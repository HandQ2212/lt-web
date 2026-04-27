package com.elc.system.modules.report.service;

import com.elc.system.modules.payroll.service.PayrollService;
import com.elc.system.modules.report.dto.ReportDto.*;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;

/**
 * Excel export service for financial reports.
 * Generates .xlsx files for Revenue, Payroll, and student data.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ExcelExportService {

    private final ReportService reportService;
    private final PayrollService payrollService;

    /** Export revenue report to Excel */
    public void exportRevenueReport(int year, Integer month, HttpServletResponse response) throws IOException {
        RevenueReport report = reportService.getRevenueReport(year, month);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Revenue Report");

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);

            // Header
            Row headerRow = sheet.createRow(0);
            createStyledCell(headerRow, 0, "Báo cáo Doanh thu - " + report.getPeriod(), headerStyle);

            // Summary
            Row summaryRow = sheet.createRow(2);
            summaryRow.createCell(0).setCellValue("Tổng Doanh thu");
            Cell revenueCell = summaryRow.createCell(1);
            revenueCell.setCellValue(report.getTotalRevenue().doubleValue());
            revenueCell.setCellStyle(currencyStyle);

            // Monthly breakdown
            Row breakdownHeader = sheet.createRow(4);
            createStyledCell(breakdownHeader, 0, "Tháng", headerStyle);
            createStyledCell(breakdownHeader, 1, "Doanh thu (VNĐ)", headerStyle);

            int rowNum = 5;
            for (Map.Entry<String, BigDecimal> entry : report.getRevenueByMonth().entrySet()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(entry.getKey());
                Cell cell = row.createCell(1);
                cell.setCellValue(entry.getValue().doubleValue());
                cell.setCellStyle(currencyStyle);
            }

            // Auto-size columns
            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            // Write response
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition",
                    "attachment; filename=revenue_report_" + report.getPeriod() + ".xlsx");
            workbook.write(response.getOutputStream());
        }

        log.info("Revenue report exported to Excel for period: {}", report.getPeriod());
    }

    /** Export payroll report to Excel */
    public void exportPayrollReport(int month, int year, HttpServletResponse response) throws IOException {
        var payroll = payrollService.calculateMonthlyPayroll(month, year);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Payroll Report");

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);

            // Title
            Row titleRow = sheet.createRow(0);
            createStyledCell(titleRow, 0,
                    String.format("Bảng Lương Tháng %d/%d", month, year), headerStyle);

            // Summary
            Row summaryRow = sheet.createRow(2);
            summaryRow.createCell(0).setCellValue("Tổng số Giáo viên");
            summaryRow.createCell(1).setCellValue(payroll.getTotalTeachers());
            Row costRow = sheet.createRow(3);
            costRow.createCell(0).setCellValue("Tổng chi phí Lương");
            Cell costCell = costRow.createCell(1);
            costCell.setCellValue(payroll.getTotalSalaryCost().doubleValue());
            costCell.setCellStyle(currencyStyle);

            // Detail header
            Row detailHeader = sheet.createRow(5);
            String[] headers = {"Giáo viên", "Email", "Số buổi dạy", "Đơn giá/buổi",
                    "Lương cơ bản", "Thưởng", "Phạt", "Thực lĩnh"};
            for (int i = 0; i < headers.length; i++) {
                createStyledCell(detailHeader, i, headers[i], headerStyle);
            }

            // Data rows
            int rowNum = 6;
            for (var detail : payroll.getPayrollDetails()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(detail.getTeacherName());
                row.createCell(1).setCellValue(detail.getTeacherEmail());
                row.createCell(2).setCellValue(detail.getTotalSessions());

                Cell c3 = row.createCell(3);
                c3.setCellValue(detail.getRatePerSession().doubleValue());
                c3.setCellStyle(currencyStyle);

                Cell c4 = row.createCell(4);
                c4.setCellValue(detail.getBaseSalary().doubleValue());
                c4.setCellStyle(currencyStyle);

                Cell c5 = row.createCell(5);
                c5.setCellValue(detail.getTotalBonuses().doubleValue());
                c5.setCellStyle(currencyStyle);

                Cell c6 = row.createCell(6);
                c6.setCellValue(detail.getTotalPenalties().doubleValue());
                c6.setCellStyle(currencyStyle);

                Cell c7 = row.createCell(7);
                c7.setCellValue(detail.getNetSalary().doubleValue());
                c7.setCellStyle(currencyStyle);
            }

            // Auto-size all columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition",
                    String.format("attachment; filename=payroll_%d_%02d.xlsx", year, month));
            workbook.write(response.getOutputStream());
        }

        log.info("Payroll report exported to Excel for {}/{}", month, year);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        return style;
    }

    private void createStyledCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }
}
