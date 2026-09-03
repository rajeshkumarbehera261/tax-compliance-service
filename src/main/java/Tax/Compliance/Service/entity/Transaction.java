package Tax.Compliance.Service.entity;


import Tax.Compliance.Service.enums.ComplianceStatus;
import Tax.Compliance.Service.enums.TransactionType;
import Tax.Compliance.Service.enums.ValidationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false, unique = true)
    private String transactionId;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate date;

    @Column(name = "customer_id", nullable = false)
    private String customerId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "tax_rate", precision = 5, scale = 4)
    private BigDecimal taxRate;

    @Column(name = "reported_tax", precision = 19, scale = 2)
    private BigDecimal reportedTax;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @Column(name = "expected_tax", precision = 19, scale = 2)
    private BigDecimal expectedTax;

    @Column(name = "tax_gap", precision = 19, scale = 2)
    private BigDecimal taxGap;

    @Enumerated(EnumType.STRING)
    @Column(name = "compliance_status")
    private ComplianceStatus complianceStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "validation_status")
    private ValidationStatus validationStatus;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "original_transaction_id")
    private String originalTransactionId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}