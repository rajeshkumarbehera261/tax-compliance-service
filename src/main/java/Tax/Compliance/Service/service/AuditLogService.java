package Tax.Compliance.Service.service;

import Tax.Compliance.Service.entity.AuditLog;
import Tax.Compliance.Service.enums.EventType;
import Tax.Compliance.Service.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository) {

        this.auditLogRepository = auditLogRepository;
    }

    public AuditLog log(
            EventType eventType,
            String transactionId,
            String detailJson) {

        AuditLog auditLog = AuditLog.builder()
                .eventType(eventType)
                .transactionId(transactionId)
                .timestamp(LocalDateTime.now())
                .detailJson(detailJson)
                .build();

        return auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAllLogs() {

        return auditLogRepository.findAll();
    }

    public List<AuditLog> getByTransactionId(
            String transactionId) {

        return auditLogRepository
                .findByTransactionId(transactionId);
    }

    public List<AuditLog> getByEventType(
            EventType eventType) {

        return auditLogRepository
                .findByEventType(eventType);
    }
}
