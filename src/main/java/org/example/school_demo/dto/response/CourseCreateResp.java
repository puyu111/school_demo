package org.example.school_demo.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCreateResp {
    private Long dbId;          // 数据库自增主键
    private String id;          // 业务ID（前端传入的 C001）
    private String name;
    private Integer credits;
    private String type;
    private Integer totalHours;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}
