package com.leappoc.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.leappoc")
@EntityScan(basePackages = "com.leappoc")
@EnableJpaRepositories(basePackages = "com.leappoc")
public class LeapPocApplication {

    public static void main(String[] args) {
        SpringApplication.run(LeapPocApplication.class, args);
    }
}
