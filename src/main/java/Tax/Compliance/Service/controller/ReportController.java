package Tax.Compliance.Service.controller;

import Tax.Compliance.Service.dto.CustomerTaxSummary;
import Tax.Compliance.Service.service.ReportService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/customer-tax-summary")
    public List<Map<String, Object>>
    getCustomerTaxSummary() {

        List<CustomerTaxSummary> summaries =
                reportService.getCustomerTaxSummary();

        return summaries.stream()
                .map(summary -> {

                    Map<String, Object> result =
                            new LinkedHashMap<>();

                    result.put(
                            "customerId",
                            summary.getCustomerId()
                    );

                    result.put(
                            "totalAmount",
                            summary.getTotalAmount()
                    );

                    result.put(
                            "totalReportedTax",
                            summary.getTotalReportedTax()
                    );

                    result.put(
                            "totalExpectedTax",
                            summary.getTotalExpectedTax()
                    );

                    result.put(
                            "totalTaxGap",
                            summary.getTotalTaxGap()
                    );

                    result.put(
                            "totalTransactions",
                            summary.getTotalTransactions()
                    );

                    result.put(
                            "nonCompliantTransactions",
                            summary.getNonCompliantTransactions()
                    );

                    result.put(
                            "complianceScore",
                            reportService
                                    .calculateComplianceScore(summary)
                    );

                    return result;
                })
                .toList();
    }
}