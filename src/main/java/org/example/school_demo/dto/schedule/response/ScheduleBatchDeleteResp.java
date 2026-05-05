package org.example.school_demo.dto.schedule.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleBatchDeleteResp {
    private int successCount;
    private List<Long> failedIds;
}
