package com.elc.system.modules.chatbot.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatHistoryMessage;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatMessageRequest;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatMessageResponse;
import com.elc.system.modules.sms.entity.Branch;
import com.elc.system.modules.sms.entity.Course;
import com.elc.system.modules.sms.repository.BranchRepository;
import com.elc.system.modules.sms.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Locale;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private static final int MAX_CONTEXT_ITEMS = 8;
    private static final int MAX_HISTORY_ITEMS = 8;

    private final OpenAiChatClient openAiChatClient;
    private final CourseRepository courseRepository;
    private final BranchRepository branchRepository;

    @Transactional(readOnly = true)
    public ChatMessageResponse reply(ChatMessageRequest request, User currentUser) {
        List<Course> courses = safeFindAll(courseRepository::findAll, "courses")
                .stream()
                .limit(MAX_CONTEXT_ITEMS)
                .toList();
        List<Branch> branches = safeFindAll(branchRepository::findAll, "branches")
                .stream()
                .limit(MAX_CONTEXT_ITEMS)
                .toList();
        String answer = null;
        String source = "LOCAL_FALLBACK";

        if (openAiChatClient.isConfigured()) {
            try {
                answer = openAiChatClient.createReply(
                        buildInstructions(courses, branches, currentUser, request.getCurrentPath()),
                        buildInput(request)
                ).orElse(null);
                if (answer != null && !answer.isBlank()) {
                    source = "OPENAI";
                }
            } catch (RuntimeException ex) {
                log.warn("OpenAI chatbot fallback activated: {}", ex.getMessage(), ex);
            }
        } else {
            log.warn("OpenAI chatbot fallback activated: OPENAI_API_KEY is not configured.");
        }

        if (answer == null || answer.isBlank()) {
            answer = buildFallbackReply(request.getMessage(), courses, branches);
        }

        return ChatMessageResponse.builder()
                .message(answer)
                .source(source)
                .timestamp(ZonedDateTime.now())
                .build();
    }

    private <T> List<T> safeFindAll(Supplier<List<T>> loader, String label) {
        try {
            return loader.get();
        } catch (RuntimeException ex) {
            log.warn("Chatbot context '{}' unavailable: {}", label, ex.getMessage());
            return List.of();
        }
    }

    private String buildInstructions(List<Course> courses, List<Branch> branches, User user, String currentPath) {
        String userInfo = user == null
                ? "Khach truy cap chua dang nhap"
                : user.getFullName() + " - role " + user.getRole();

        return """
                Ban la tro ly ao cua ELC English Center. Tra loi bang tieng Viet, ngan gon, than thien va dung ngu canh.
                Quy tac:
                - Chi tu van dua tren du lieu he thong ben duoi va cac luong ELC hien co.
                - Khong bia gia, lich hoc, khuyen mai, ket qua hoc tap, hoa don hoac thong tin ca nhan.
                - Khong hoi mat khau, token, API key hoac thong tin nhay cam.
                - Neu cau hoi can nhan vien xu ly, huong dan nguoi dung de lai thong tin lien he hoac vao dung man hinh.

                Nguoi dung: %s
                Trang hien tai: %s

                Khoa hoc:
                %s

                Chi nhanh:
                %s
                """.formatted(userInfo, blankToDefault(currentPath, "khong xac dinh"),
                summarizeCourses(courses), summarizeBranches(branches));
    }

    private String buildInput(ChatMessageRequest request) {
        String history = request.getHistory() == null ? "" : request.getHistory().stream()
                .filter(item -> item.getContent() != null && !item.getContent().isBlank())
                .limit(MAX_HISTORY_ITEMS)
                .map(this::formatHistoryItem)
                .collect(Collectors.joining("\n"));

        return """
                Lich su gan day:
                %s

                Tin nhan moi:
                %s
                """.formatted(history.isBlank() ? "(khong co)" : history, request.getMessage().trim());
    }

    private String formatHistoryItem(ChatHistoryMessage item) {
        String role = "assistant".equalsIgnoreCase(item.getRole()) ? "Tro ly" : "Nguoi dung";
        return role + ": " + item.getContent().trim();
    }

    private String buildFallbackReply(String message, List<Course> courses, List<Branch> branches) {
        String normalized = message == null ? "" : message.toLowerCase(Locale.ROOT);

        if (containsAny(normalized, "khoa", "course", "ielts", "business", "hoc phi", "gia")) {
            return "Hien tai ban co the xem cac khoa hoc trong muc Khoa hoc. "
                    + summarizeCoursesForReply(courses)
                    + " Neu can tu van lo trinh, hay de lai so dien thoai trong form lien he.";
        }

        if (containsAny(normalized, "chi nhanh", "dia chi", "lien he", "hotline")) {
            return summarizeBranchesForReply(branches)
                    + " Ban cung co the gui form lien he de nhan tu van tu ELC.";
        }

        if (containsAny(normalized, "lich", "lop", "diem danh", "bai tap")) {
            return "Neu ban da co tai khoan, hay dang nhap va vao dung khu vuc Hoc vien/Giang vien de xem lich hoc, lop hoc, diem danh va bai tap. Neu chua co tai khoan, ELC se tu van lop phu hop qua form lien he.";
        }

        if (containsAny(normalized, "thanh toan", "hoa don", "hoc phi", "cong no")) {
            return "Thong tin hoa don va thanh toan nam trong khu vuc Hoc vien hoac Tai chinh sau khi dang nhap. ELC khong yeu cau mat khau hay ma bao mat qua chat.";
        }

        return "Toi co the ho tro ve khoa hoc, hoc phi, chi nhanh, lich hoc, bai tap va thanh toan trong he thong ELC. Ban cho toi biet muc tieu hoc tieng Anh cua ban hoac van de ban dang gap nhe.";
    }

    private String summarizeCourses(List<Course> courses) {
        if (courses.isEmpty()) {
            return "- Chua co du lieu khoa hoc trong he thong.";
        }
        return courses.stream()
                .map(course -> "- %s | level: %s | hoc phi: %s | mo ta: %s".formatted(
                        blankToDefault(course.getName(), "Chua dat ten"),
                        course.getLevel() == null ? "chua cap nhat" : course.getLevel().name(),
                        formatPrice(course.getBasePrice()),
                        compact(course.getDescription(), 140)))
                .collect(Collectors.joining("\n"));
    }

    private String summarizeBranches(List<Branch> branches) {
        if (branches.isEmpty()) {
            return "- Chua co du lieu chi nhanh trong he thong.";
        }
        return branches.stream()
                .map(branch -> "- %s | dia chi: %s | dien thoai: %s".formatted(
                        blankToDefault(branch.getName(), "Chi nhanh ELC"),
                        blankToDefault(branch.getAddress(), "chua cap nhat"),
                        blankToDefault(branch.getPhone(), "chua cap nhat")))
                .collect(Collectors.joining("\n"));
    }

    private String summarizeCoursesForReply(List<Course> courses) {
        if (courses.isEmpty()) {
            return "Du lieu khoa hoc chua duoc cap nhat trong he thong.";
        }
        return "Mot so khoa hoc hien co: " + courses.stream()
                .map(course -> blankToDefault(course.getName(), "Khoa hoc ELC"))
                .collect(Collectors.joining(", ")) + ".";
    }

    private String summarizeBranchesForReply(List<Branch> branches) {
        if (branches.isEmpty()) {
            return "Thong tin chi nhanh chua duoc cap nhat trong he thong.";
        }
        return "Cac chi nhanh hien co: " + branches.stream()
                .map(branch -> blankToDefault(branch.getName(), "ELC"))
                .collect(Collectors.joining(", ")) + ".";
    }

    private boolean containsAny(String value, String... keywords) {
        for (String keyword : keywords) {
            if (value.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String formatPrice(BigDecimal price) {
        return price == null ? "chua cap nhat" : price.stripTrailingZeros().toPlainString() + " VND";
    }

    private String compact(String value, int maxLength) {
        String normalized = blankToDefault(value, "chua cap nhat").replaceAll("\\s+", " ").trim();
        return normalized.length() <= maxLength ? normalized : normalized.substring(0, maxLength - 3) + "...";
    }

    private String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
