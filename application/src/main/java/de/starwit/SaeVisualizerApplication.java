package de.starwit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication(exclude = {
	org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
	org.springframework.boot.actuate.autoconfigure.security.servlet.ManagementWebSecurityAutoConfiguration.class })
public class SaeVisualizerApplication {

	public static void main(String[] args) {
		SpringApplication.run(SaeVisualizerApplication.class, args);
	}

}
