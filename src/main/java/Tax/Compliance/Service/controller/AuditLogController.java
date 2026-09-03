package Tax.Compliance.Service.controller;

import Tax.Compliance.Service.entity.AuditLog;
import Tax.Compliance.Service.enums.EventType;
import Tax.Compliance.Service.service.AuditLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(
            AuditLogService auditLogService) {

        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<AuditLog> getAllLogs() {

        return auditLogService.getAllLogs();
    }

    @GetMapping("/transaction/{transactionId}")
    public List<AuditLog> getByTransactionId(
            @PathVariable String transactionId) {

        return auditLogService
                .getByTransactionId(transactionId);
    }

    @GetMapping("/event/{eventType}")
    public List<AuditLog> getByEventType(
            @PathVariable EventType eventType) {

        return auditLogService
                .getByEventType(eventType);
    }
}
