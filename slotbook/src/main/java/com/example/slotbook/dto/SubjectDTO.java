package com.example.slotbook.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubjectDTO {
    private Long id;
    
    @NotBlank(message = "Subject code is required")
    private String code;
    
    @NotBlank(message = "Subject name is required")
    private String name;
    
    @NotBlank(message = "Group is required")
    private String group;
}
