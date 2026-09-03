package Tax.Compliance.Service.rule;

import Tax.Compliance.Service.entity.TaxRule;
import Tax.Compliance.Service.entity.Transaction;
import Tax.Compliance.Service.enums.RuleType;
import Tax.Compliance.Service.service.TaxExceptionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import Tax.Compliance.Service.enums.TransactionType;
import Tax.Compliance.Service.repository.TransactionRepository;
import java.math.BigDecimal;
import java.util.List;

@Component
public class RuleEngine {

    private final ObjectMapper objectMapper;
    private final TaxExceptionService taxExceptionService;
    private final TransactionRepository transactionRepository;

    public RuleEngine(ObjectMapper objectMapper, TaxExceptionService taxExceptionService, TransactionRepository transactionRepository) {
        this.objectMapper = objectMapper;
        this.taxExceptionService = taxExceptionService;
        this.transactionRepository = transactionRepository;
    }

    public void execute(
            Transaction transaction,
            List<TaxRule> rules) {

        for (TaxRule rule : rules) {

            if (!rule.isEnabled()) {
                continue;
            }

            switch (rule.getRuleType()) {

                case HIGH_VALUE_TRANSACTION ->
                        executeHighValueRule(
                                transaction,
                                rule
                        );

                case REFUND_VALIDATION ->
                        executeRefundRule(
                                transaction,
                                rule
                        );

                case GST_SLAB_VIOLATION ->
                        executeGstSlabRule(
                                transaction,
                                rule
                        );
            }
        }
    }
    private void executeGstSlabRule(
            Transaction transaction,
            TaxRule rule) {

        try {
            JsonNode config =
                    objectMapper.readTree(rule.getConfig());

            BigDecimal threshold =
                    config.get("threshold").decimalValue();

            if (transaction.getAmount().compareTo(threshold) > 0) {

                taxExceptionService.createException(
                        transaction.getTransactionId(),
                        transaction.getCustomerId(),
                        rule.getRuleName(),
                        rule.getSeverity(),
                        "Transaction amount violates configured GST slab"
                );
            }

        } catch (Exception e) {
            throw new RuntimeException(
                    "Invalid configuration for rule: "
                            + rule.getRuleName(),
                    e
            );
        }
    }

    private void executeHighValueRule(
            Transaction transaction,
            TaxRule rule) {

        try {

            JsonNode config =
                    objectMapper.readTree(rule.getConfig());

            BigDecimal threshold =
                    config.get("threshold")
                            .decimalValue();

            if (transaction.getAmount()
                    .compareTo(threshold) > 0) {

                taxExceptionService.createException(
                        transaction.getTransactionId(),
                        transaction.getCustomerId(),
                        rule.getRuleName(),
                        rule.getSeverity(),
                        "Transaction amount exceeds configured high-value threshold"
                );
            }

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid configuration for rule: "
                            + rule.getRuleName(),
                    e
            );
        }
    }



    private void executeRefundRule(
            Transaction transaction,
            TaxRule rule) {

        if (transaction.getTransactionType()
                != TransactionType.REFUND) {

            return;
        }

        if (transaction.getOriginalTransactionId() == null) {
            return;
        }

        Transaction original =
                transactionRepository
                        .findByTransactionId(
                                transaction
                                        .getOriginalTransactionId()
                        )
                        .orElse(null);

        if (original == null) {
            return;
        }

        if (original.getTransactionType()
                != TransactionType.SALE) {

            taxExceptionService.createException(
                    transaction.getTransactionId(),
                    transaction.getCustomerId(),
                    rule.getRuleName(),
                    rule.getSeverity(),
                    "Refund does not reference a SALE transaction"
            );

            return;
        }

        if (transaction.getAmount()
                .compareTo(original.getAmount()) > 0) {

            taxExceptionService.createException(
                    transaction.getTransactionId(),
                    transaction.getCustomerId(),
                    rule.getRuleName(),
                    rule.getSeverity(),
                    "Refund amount exceeds original sale amount"
            );
        }
    }
}