package Tax.Compliance.Service.repository;

import Tax.Compliance.Service.entity.AuditLog;
import Tax.Compliance.Service.enums.EventType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByTransactionId(String transactionId);

    List<AuditLog> findByEventType(EventType eventType);
}