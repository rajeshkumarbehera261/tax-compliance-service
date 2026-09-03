package Tax.Compliance.Service.service;

import Tax.Compliance.Service.dto.LoginRequest;
import Tax.Compliance.Service.dto.LoginResponse;
import Tax.Compliance.Service.entity.User;

import Tax.Compliance.Service.repository.UserRepository;
import org.springframework.security.authentication.*;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtServices jwtServices;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtServices jwtServices) {

        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtServices = jwtServices;
    }

    public LoginResponse login(
            LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        User user = userRepository
                .findByUsername(request.username())
                .orElseThrow();

        String token =
                jwtServices.generateToken(
                        user.getUsername(),
                        user.getRole().name()
                );

        return new LoginResponse(
                token,
                user.getUsername(),
                user.getRole().name()
        );
    }
}