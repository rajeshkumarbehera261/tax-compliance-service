package Tax.Compliance.Service.repository;

import Tax.Compliance.Service.entity.TaxException;
import Tax.Compliance.Service.enums.Severity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaxExceptionRepository
        extends JpaRepository<TaxException, Long> {

    List<TaxException> findByCustomerId(String customerId);

    List<TaxException> findBySeverity(Severity severity);

    List<TaxException> findByRuleName(String ruleName);

    List<TaxException> findByTransactionId(String transactionId);
}