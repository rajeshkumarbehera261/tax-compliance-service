package Tax.Compliance.Service.service;

import Tax.Compliance.Service.entity.Transaction;
import Tax.Compliance.Service.enums.ComplianceStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class TaxCalculationService {

    private static final BigDecimal TOLERANCE = BigDecimal.ONE;

    public void calculateTax(Transaction transaction) {

        // If reported tax is missing, transaction is non-compliant
        if (transaction.getReportedTax() == null) {
            transaction.setComplianceStatus(
                    ComplianceStatus.NON_COMPLIANT
            );
            return;
        }

        BigDecimal expectedTax = transaction.getAmount()
                .multiply(transaction.getTaxRate())
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal taxGap = expectedTax
                .subtract(transaction.getReportedTax())
                .setScale(2, RoundingMode.HALF_UP);

        transaction.setExpectedTax(expectedTax);
        transaction.setTaxGap(taxGap);

        determineComplianceStatus(transaction, taxGap);
    }

    private void determineComplianceStatus(
            Transaction transaction,
            BigDecimal taxGap) {

        if (taxGap.abs().compareTo(TOLERANCE) <= 0) {

            transaction.setComplianceStatus(
                    ComplianceStatus.COMPLIANT
            );

        } else if (taxGap.compareTo(TOLERANCE) > 0) {

            transaction.setComplianceStatus(
                    ComplianceStatus.UNDERPAID
            );

        } else {

            transaction.setComplianceStatus(
                    ComplianceStatus.OVERPAID
            );
        }
    }
}