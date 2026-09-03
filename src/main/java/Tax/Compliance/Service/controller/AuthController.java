package Tax.Compliance.Service.controller;

import Tax.Compliance.Service.dto.LoginRequest;
import Tax.Compliance.Service.dto.LoginResponse;
import Tax.Compliance.Service.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        return authService.login(request);
    }
}
