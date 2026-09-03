package Tax.Compliance.Service.repository;

import Tax.Compliance.Service.dto.CustomerTaxSummary;
import Tax.Compliance.Service.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReportRepository
        extends JpaRepository<Transaction, Long> {

    @Query("""
        SELECT
            t.customerId AS customerId,
            SUM(t.amount) AS totalAmount,
            SUM(t.reportedTax) AS totalReportedTax,
            SUM(t.expectedTax) AS totalExpectedTax,
            SUM(t.taxGap) AS totalTaxGap,
            COUNT(t) AS totalTransactions,
            SUM(
                CASE
                    WHEN t.complianceStatus = 'NON_COMPLIANT'
                    THEN 1
                    ELSE 0
                END
            ) AS nonCompliantTransactions
        FROM Transaction t
        GROUP BY t.customerId
        """)
    List<CustomerTaxSummary> getCustomerTaxSummary();
}
