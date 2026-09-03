package Tax.Compliance.Service.service;

import Tax.Compliance.Service.entity.TaxRule;
import Tax.Compliance.Service.repository.TaxRuleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RuleService {

    private final TaxRuleRepository taxRuleRepository;

    public RuleService(TaxRuleRepository taxRuleRepository) {
        this.taxRuleRepository = taxRuleRepository;
    }

    public TaxRule createRule(TaxRule rule) {

        rule.setCreatedAt(LocalDateTime.now());

        return taxRuleRepository.save(rule);
    }

    public List<TaxRule> getAllRules() {

        return taxRuleRepository.findAll();
    }

    public List<TaxRule> getActiveRules() {

        return taxRuleRepository.findByEnabledTrue();
    }

    public TaxRule updateRule(Long id, TaxRule updatedRule) {

        TaxRule existingRule =
                taxRuleRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Rule not found: " + id
                                ));

        existingRule.setRuleName(updatedRule.getRuleName());
        existingRule.setRuleType(updatedRule.getRuleType());
        existingRule.setSeverity(updatedRule.getSeverity());
        existingRule.setConfig(updatedRule.getConfig());
        existingRule.setEnabled(updatedRule.isEnabled());

        return taxRuleRepository.save(existingRule);
    }

    public void deleteRule(Long id) {

        if (!taxRuleRepository.existsById(id)) {
            throw new RuntimeException(
                    "Rule not found: " + id
            );
        }

        taxRuleRepository.deleteById(id);
    }


}