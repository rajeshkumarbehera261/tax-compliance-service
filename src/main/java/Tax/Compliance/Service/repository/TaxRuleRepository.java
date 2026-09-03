package Tax.Compliance.Service.repository;

import Tax.Compliance.Service.entity.TaxRule;
import Tax.Compliance.Service.enums.RuleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaxRuleRepository
        extends JpaRepository<TaxRule, Long> {

    List<TaxRule> findByEnabledTrue();

    List<TaxRule> findByRuleType(RuleType ruleType);
}