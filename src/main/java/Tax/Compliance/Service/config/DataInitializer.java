package Tax.Compliance.Service.config;

import Tax.Compliance.Service.entity.User;
import Tax.Compliance.Service.enums.Role;
import Tax.Compliance.Service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (userRepository
                    .findByUsername("admin")
                    .isEmpty()) {

                User admin = User.builder()
                        .username("admin")
                        .password(
                                passwordEncoder.encode("admin123")
                        )
                        .role(Role.ADMIN)
                        .enabled(true)
                        .build();

                userRepository.save(admin);
            }

            if (userRepository
                    .findByUsername("Rajesh")
                    .isEmpty()) {

                User auditor = User.builder()
                        .username("Rajesh")
                        .password(
                                passwordEncoder.encode("Rajesh123")
                        )
                        .role(Role.AUDITOR)
                        .enabled(true)
                        .build();

                userRepository.save(auditor);
            }
        };
    }
}
