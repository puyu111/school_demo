package org.example.school_demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherCreateResp {

    private Long dbId;

    private String id;

    private String name;

    private String gender;

    private List<String> courses;

    private String degree;

    private String email;

    private String phone;

    private LocalDateTime createdAt;
}
