package Tax.Compliance.Service.controller;

import Tax.Compliance.Service.dto.TransactionRequest;
import Tax.Compliance.Service.entity.Transaction;
import Tax.Compliance.Service.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(
            @Valid @RequestBody TransactionRequest request) {

        Transaction transaction =
                transactionService.createTransaction(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(transaction);
    }

    @GetMapping
    public List<Transaction> getAllTransactions() {

        return transactionService.getAllTransactions();
    }

    @GetMapping("/{id}")
    public Transaction getTransaction(
            @PathVariable Long id) {

        return transactionService.getTransaction(id);
    }

    @GetMapping("/customer/{customerId}")
    public List<Transaction> getByCustomerId(
            @PathVariable String customerId) {

        return transactionService
                .getByCustomerId(customerId);
    }
}