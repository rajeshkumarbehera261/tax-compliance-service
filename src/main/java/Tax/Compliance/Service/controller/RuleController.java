package Tax.Compliance.Service.controller;

import Tax.Compliance.Service.entity.TaxRule;
import Tax.Compliance.Service.service.RuleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rules")
public class RuleController {

    private final RuleService ruleService;

    public RuleController(RuleService ruleService) {
        this.ruleService = ruleService;
    }

    @PostMapping
    public ResponseEntity<TaxRule> createRule(
            @RequestBody TaxRule rule) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ruleService.createRule(rule));
    }

    @GetMapping
    public List<TaxRule> getAllRules() {

        return ruleService.getAllRules();
    }

    @GetMapping("/active")
    public List<TaxRule> getActiveRules() {

        return ruleService.getActiveRules();
    }

    @PutMapping("/{id}")
    public TaxRule updateRule(
            @PathVariable Long id,
            @RequestBody TaxRule rule) {

        return ruleService.updateRule(id, rule);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(
            @PathVariable Long id) {

        ruleService.deleteRule(id);

        return ResponseEntity.noContent().build();
    }
}