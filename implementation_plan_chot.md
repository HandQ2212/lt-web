# Kế hoạch Tái cấu trúc Hệ thống Toàn diện (ĐÃ CHỐT)

Bản kế hoạch này đã thống nhất tất cả các quyết định nghiệp vụ và chốt phương án thực thi.
CÓ, frontend tác động đến leadInterest trong backend.

  Data Flow:

  1. FRONTEND (CourseDetailPage.tsx)
     Lead click "Đăng ký tư vấn" hoặc "Quan tâm"
     ↓
  2. API CALLS
     • Có classId: leadApi.interestClass(classId)
     • Chỉ course: leadApi.addMyInterests({ courseIds })
     ↓
  3. BACKEND ENDPOINTS
     • POST /leads/me/interest-class
     • POST /leads/me/interests
     ↓
  4. DATABASE (lead_interests table)
     Entity: LeadInterest {
       lead_id: FK
       course_id: FK (nullable)
       clazz_id: FK (nullable)
       status: LeadStatus
       notes: String
     }
     ↓
  5. FRONTEND DISPLAY (ProfilePage.tsx)
     • leadProfile.interests[] - danh sách đã quan tâm
     • Filter: availableCourses exclude interestedCourseIds

  Examples:
  - Lead quan tâm Course TOEIC → LeadInterest { lead_id, course_id: TOEIC_ID, clazz_id: null }
  - Lead quan tâm Class L-01 → LeadInterest { lead_id, course_id: null, clazz_id: L-01_ID }

  Response includes:
  LeadInterest {
    courseId, courseName,
    clazzId, clazzName,
    levelId, levelName,
    status, notes
  }

LEAD QUAN TÂM (Frontend)                                                                                                         
     ↓                                                                                                                               
  CourseDetailPage → POST /leads/me/interests                                                                                        
     ↓                                                                                                                               
  LeadInterest saved to DB                                                                                                           
     ↓                                                                                                                               
  MAGER MỞ CRM (LeadManagementPage)                                                                                                  
     ↓                                                                                                                               
  GET /leads (leadApi.getAll)                                                                                                        
     ↓                                                                                                                               
  Backend trả về LeadResponse[] với interests[]
     ↓
  HIỂN THỊ: Chips trong từng lead card

  UI Display:
  {(lead.interests || []).map((interest) => (
    <Tooltip title={interest.clazzName || interest.courseName}>
      <Chip 
        label={interest.clazzName || interest.courseName}
        color={interest.clazzId ? "primary" : "default"}
      />
    </Tooltip>
  ))}

  Manager có thể:
  - Xem lead quan tâm course nào (chip default)
  - Xem lead quan tâm class nào (chip primary)
  - Convert lead → student (tự động tạo enrollment + invoice)

  Ví dụ:
  Lead card hiển thị: [TOEIC] [L-01] [IELTS] → Lead quan tâm 3 khóa/lớp, Manager biết lead cần tư vấn gì.
