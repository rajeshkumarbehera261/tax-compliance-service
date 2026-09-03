package Tax.Compliance.Service.service;

import Tax.Compliance.Service.dto.TransactionRequest;
import Tax.Compliance.Service.dto.ValidationResult;
import Tax.Compliance.Service.entity.TaxRule;
import Tax.Compliance.Service.entity.Transaction;
import Tax.Compliance.Service.enums.EventType;
import Tax.Compliance.Service.enums.ValidationStatus;
import Tax.Compliance.Service.repository.TaxRuleRepository;
import Tax.Compliance.Service.repository.TransactionRepository;

import Tax.Compliance.Service.rule.RuleEngine;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TaxCalculationService taxCalculationService;
    private final TransactionValidationService validationService;
    private final RuleEngine ruleEngine;
    private final TaxRuleRepository taxRuleRepository;
    private final AuditLogService auditLogService;

    public TransactionService(TransactionRepository transactionRepository, TaxCalculationService taxCalculationService, TransactionValidationService validationService, RuleEngine ruleEngine, TaxRuleRepository taxRuleRepository, AuditLogService auditLogService) {
        this.transactionRepository = transactionRepository;
        this.taxCalculationService = taxCalculationService;
        this.validationService = validationService;
        this.ruleEngine = ruleEngine;
        this.taxRuleRepository = taxRuleRepository;
        this.auditLogService = auditLogService;
    }

    public Transaction createTransaction(
            TransactionRequest request) {

        // Step 1: Business validation
        ValidationResult validationResult =
                validationService.validate(request);

        // Step 2: Create transaction object
        Transaction transaction = Transaction.builder()
                .transactionId(request.getTransactionId())
                .date(request.getDate())
                .customerId(request.getCustomerId())
                .amount(request.getAmount())
                .taxRate(request.getTaxRate())
                .reportedTax(request.getReportedTax())
                .transactionType(request.getTransactionType())
                .originalTransactionId(
                        request.getOriginalTransactionId())
                .createdAt(LocalDateTime.now())
                .build();

        // Step 3: Handle validation failure
        if (!validationResult.valid()) {

            transaction.setValidationStatus(
                    ValidationStatus.FAILURE
            );

            transaction.setFailureReason(
                    validationResult.reason()
            );

            return transactionRepository.save(transaction);
        }

        // Step 4: Validation succeeded
        transaction.setValidationStatus(
                ValidationStatus.SUCCESS
        );
        auditLogService.log(
                EventType.TAX_COMPUTATION,
                transaction.getTransactionId(),
                "{\"message\":\"Tax calculation completed\"}"
        );
        List<TaxRule> activeRules =
                taxRuleRepository.findByEnabledTrue();
        System.out.println(
                "ACTIVE RULE COUNT = " + activeRules.size()
        );
        for (TaxRule rule : activeRules) {
            System.out.println(
                    "RULE = " + rule.getRuleName()
                            + " | TYPE = " + rule.getRuleType()
                            + " | ENABLED = " + rule.isEnabled()
                            + " | CONFIG = " + rule.getConfig()
            );
        }

        ruleEngine.execute(
                transaction,
                activeRules
        );
        auditLogService.log(
                EventType.INGESTION,
                transaction.getTransactionId(),
                "{\"message\":\"Transaction received\"}"
        );

        // Step 5: Calculate tax
        taxCalculationService.calculateTax(transaction);

        // Step 6: Save
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Transaction getTransaction(Long id) {

        return transactionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Transaction not found"
                        ));
    }

    public List<Transaction> getByCustomerId(
            String customerId) {

        return transactionRepository
                .findByCustomerId(customerId);
    }
}