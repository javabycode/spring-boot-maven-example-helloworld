package com.javabycode.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.web.SpringBootServletInitializer;


@SpringBootApplication
public class MyWebApplication extends SpringBootServletInitializer{
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(MyWebApplication.class);
    }

    public static void main(String[] args) throws Exception {
        SpringApplication.run(MyWebApplication.class, args);
    }
}

