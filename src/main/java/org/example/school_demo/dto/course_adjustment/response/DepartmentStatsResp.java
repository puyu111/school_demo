package org.example.school_demo.dto.course_adjustment.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentStatsResp {

    private String department;
    private long total;
    private long pending;
    private long approved;
    private long rejected;
}
