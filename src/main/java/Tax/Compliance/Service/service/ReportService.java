package Tax.Compliance.Service.service;

import Tax.Compliance.Service.dto.CustomerTaxSummary;
import Tax.Compliance.Service.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public List<CustomerTaxSummary> getCustomerTaxSummary() {

        return reportRepository.getCustomerTaxSummary();
    }

    public BigDecimal calculateComplianceScore(
            CustomerTaxSummary summary) {

        if (summary.getTotalTransactions() == 0) {
            return BigDecimal.valueOf(100);
        }

        BigDecimal total =
                BigDecimal.valueOf(
                        summary.getTotalTransactions()
                );

        BigDecimal nonCompliant =
                BigDecimal.valueOf(
                        summary.getNonCompliantTransactions()
                );

        return BigDecimal.valueOf(100)
                .subtract(
                        nonCompliant
                                .divide(total, 4,
                                        java.math.RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                );
    }
}