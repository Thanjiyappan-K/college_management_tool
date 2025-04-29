// package com.example.slotbook;

// import org.springframework.boot.SpringApplication;
// import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication
// public class CollegeApplication {

// 	public static void main(String[] args) {
// 		SpringApplication.run(CollegeApplication.class, args);
// 	}

// }





package com.example.slotbook;

import com.example.slotbook.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class SlotBookApplication {

    @Autowired
    private SubjectService subjectService;

    public static void main(String[] args) {
        SpringApplication.run(SlotBookApplication.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowedHeaders("*");
            }
        };
    }

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Group A courses
            List<String> groupACourses = Arrays.asList(
                "19MS154 Basic Financial Accounting",
                "19MS156 Human Resource Management and Team Building",
                "19MA220 Mathematics for Artificial Intelligence",
                "19EE404 Digital Electronics",
                "19AI403 Introduction to Data Science",
                "19AI407 Parallel Computing Architecture",
                "19AI409 Applied Artificial Intelligence",
                "19AI413 Deep Learning and Its Applications",
                "19AI539 Mobile User Interface Development",
                "19AM508 Introduction to IoT",
                "19CS417 Ethical Hacking Techniques",
                "19AI513 Game Programming",
                "19AI411 Neural Networks",
                "19AI521 Expert Systems",
                "19CS404 Database Management System and Its Applications",
                "19CS406 Computer Networks",
                "19CS408 Software Engineering",
                "19CS411 Virtualization and Cloud Computing",
                "19CS413 Artificial Intelligence",
                "19AI405 Fundamentals of Artificial Intelligence",
                "19AI502 Applied Natural Language Processing",
                "19AI541 Cloud Computing",
                "19AM509 Industrial Internet Of Things",
                "19CS415 Cryptography",
                "19IT402 Game Development Technologies",
                "19EC410 VLSI design",
                "19EC526 Verilog HDL"
            );

            // Group B courses
            List<String> groupBCourses = Arrays.asList(
                "19MS155 Stock Market and Company Operations",
                "19AI301 Python Programming",
                "19AI303 Engineering Mechanics and Product Development",
                "19EE309 Programming Microcontrollers",
                "19AI406 Digital Image Processing Techniques",
                "19AI412 Web Data Mining",
                "19AI414 Fundamentals of Web Application Development",
                "19CS420 Prototyping of IoT Systems",
                "19AI410 Introduction to Machine Learning",
                "19AI545 Modern Web Application Development",
                "19AI546 Web Server Programming",
                "19AI512 NoSQL Database Design",
                "19AI505 Reinforcement Learning",
                "19CS305 Computer Architecture",
                "19CS405 Operating System",
                "19CS407 Theory of Computation",
                "19CS409 Compiler Design",
                "19CS412 Cryptography and Network Security",
                "19CS504 Software Project Management",
                "19IT406 Grid and Cloud Computing",
                "19AM401 Time Series Analysis and Forecasting",
                "19CS418 Cyber Law and Compliance",
                "19CS545 Open Source Operating System",
                "19AI547 Blockchain for Business",
                "19CS414 Mobile Application Development",
                "19AI550 Artificial Intelligence for Games",
                "19CS416 Cloud Security",
                "19CS565 Robotic Process Automation",
                "19CS569 Applied Data Science",
                "19CS579 Generative AI Application Development",
                "19CS570 Entrepreneurship and Small Business Development",
                "19EC519 Testing of VLSI circuits",
                "19EC522 Physical design for VLSI",
                "19CS532 Fundamentals of Cryptocurrency",
                "19AI509 Concepts of Virtual and Augmented Reality",
                "19EE305 Basic Electrical, Electronics and Measurement Engineering"
            );

            // Initialize subjects
            subjectService.initializeSubjects(groupACourses, groupBCourses);
        };
    }
}
