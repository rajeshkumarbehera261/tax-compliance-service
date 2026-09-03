package Tax.Compliance.Service.controller;

import Tax.Compliance.Service.entity.TaxException;
import Tax.Compliance.Service.enums.Severity;
import Tax.Compliance.Service.service.TaxExceptionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exceptions")
public class TaxExceptionController {

    private final TaxExceptionService taxExceptionService;

    public TaxExceptionController(
            TaxExceptionService taxExceptionService) {

        this.taxExceptionService = taxExceptionService;
    }

    @GetMapping
    public List<TaxException> getExceptions(

            @RequestParam(required = false)
            String transactionId,

            @RequestParam(required = false)
            String customerId,

            @RequestParam(required = false)
            Severity severity,

            @RequestParam(required = false)
            String ruleName) {


        /*
         * Transaction-specific filtering
         */

        if (transactionId != null &&
                !transactionId.isBlank()) {

            return taxExceptionService
                    .getByTransactionId(
                            transactionId
                    );
        }


        /*
         * Customer filtering
         */

        if (customerId != null &&
                !customerId.isBlank()) {

            return taxExceptionService
                    .getByCustomerId(
                            customerId
                    );
        }


        /*
         * Severity filtering
         */

        if (severity != null) {

            return taxExceptionService
                    .getBySeverity(
                            severity
                    );
        }


        /*
         * Rule filtering
         */

        if (ruleName != null &&
                !ruleName.isBlank()) {

            return taxExceptionService
                    .getByRuleName(
                            ruleName
                    );
        }


        /*
         * No filter
         */

        return taxExceptionService
                .getAllExceptions();
    }

    @GetMapping("/customer/{customerId}")
    public List<TaxException> getByCustomerId(
            @PathVariable String customerId) {

        return taxExceptionService
                .getByCustomerId(customerId);
    }

    @GetMapping("/severity/{severity}")
    public List<TaxException> getBySeverity(
            @PathVariable Severity severity) {

        return taxExceptionService
                .getBySeverity(severity);
    }

    @GetMapping("/rule/{ruleName}")
    public List<TaxException> getByRuleName(
            @PathVariable String ruleName) {

        return taxExceptionService
                .getByRuleName(ruleName);
    }
}