package Tax.Compliance.Service.dto;

import java.math.BigDecimal;

public interface CustomerTaxSummary {

    String getCustomerId();

    BigDecimal getTotalAmount();

    BigDecimal getTotalReportedTax();

    BigDecimal getTotalExpectedTax();

    BigDecimal getTotalTaxGap();

    Long getTotalTransactions();

    Long getNonCompliantTransactions();
}