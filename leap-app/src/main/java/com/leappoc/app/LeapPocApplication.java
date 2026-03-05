package com.leappoc.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.leappoc")   // scan all sub-modules
public class LeapPocApplication {

    public static void main(String[] args) {
        SpringApplication.run(LeapPocApplication.class, args);
    }
}
