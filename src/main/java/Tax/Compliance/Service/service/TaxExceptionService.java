package Tax.Compliance.Service.service;

import Tax.Compliance.Service.entity.TaxException;
import Tax.Compliance.Service.enums.Severity;
import Tax.Compliance.Service.repository.TaxExceptionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaxExceptionService {

    private final TaxExceptionRepository taxExceptionRepository;

    public TaxExceptionService(
            TaxExceptionRepository taxExceptionRepository) {

        this.taxExceptionRepository = taxExceptionRepository;
    }

    public TaxException createException(
            String transactionId,
            String customerId,
            String ruleName,
            Severity severity,
            String message) {

        TaxException taxException = TaxException.builder()
                .transactionId(transactionId)
                .customerId(customerId)
                .ruleName(ruleName)
                .severity(severity)
                .message(message)
                .createdAt(LocalDateTime.now())
                .build();

        return taxExceptionRepository.save(taxException);
    }

    public List<TaxException> getAllExceptions() {

        return taxExceptionRepository.findAll();
    }

    public List<TaxException> getByCustomerId(
            String customerId) {

        return taxExceptionRepository
                .findByCustomerId(customerId);
    }

    public List<TaxException> getBySeverity(
            Severity severity) {

        return taxExceptionRepository
                .findBySeverity(severity);
    }

    public List<TaxException> getByRuleName(
            String ruleName) {

        return taxExceptionRepository
                .findByRuleName(ruleName);
    }
    public List<TaxException> getByTransactionId(String transactionId) {
        return taxExceptionRepository.findByTransactionId(transactionId);
    }
}