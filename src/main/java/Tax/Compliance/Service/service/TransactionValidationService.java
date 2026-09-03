package Tax.Compliance.Service.service;

import Tax.Compliance.Service.dto.TransactionRequest;
import Tax.Compliance.Service.dto.ValidationResult;
import Tax.Compliance.Service.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class TransactionValidationService {

    private final TransactionRepository transactionRepository;

    public TransactionValidationService(
            TransactionRepository transactionRepository) {

        this.transactionRepository = transactionRepository;
    }

    public ValidationResult validate(TransactionRequest request) {

        // 1. Check duplicate transaction
        if (transactionRepository.existsByTransactionId(
                request.getTransactionId())) {

            return ValidationResult.failure(
                    "Transaction ID already exists"
            );
        }

        // 2. Amount must be positive
        if (request.getAmount() == null ||
                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            return ValidationResult.failure(
                    "Transaction amount must be greater than zero"
            );
        }

        // 3. Tax rate validation
        if (request.getTaxRate() == null ||
                request.getTaxRate().compareTo(BigDecimal.ZERO) < 0) {

            return ValidationResult.failure(
                    "Tax rate cannot be negative"
            );
        }

        // 4. Tax rate cannot exceed 100%
        if (request.getTaxRate().compareTo(BigDecimal.ONE) > 0) {

            return ValidationResult.failure(
                    "Tax rate cannot exceed 100%"
            );
        }

        // 5. Refund validation
        if ("REFUND".equalsIgnoreCase(String.valueOf(request.getTransactionType()))) {

            if (request.getOriginalTransactionId() == null ||
                    request.getOriginalTransactionId().isBlank()) {

                return ValidationResult.failure(
                        "Refund must reference an original transaction"
                );
            }

            boolean originalExists =
                    transactionRepository.existsByTransactionId(
                            request.getOriginalTransactionId());

            if (!originalExists) {

                return ValidationResult.failure(
                        "Original transaction does not exist"
                );
            }
        }

        return ValidationResult.success();
    }
}