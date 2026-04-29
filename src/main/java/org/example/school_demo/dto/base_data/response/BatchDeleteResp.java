package org.example.school_demo.dto.base_data.response;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BatchDeleteResp {

    private Integer deletedCount;
    private List<String> deletedDbIds;
    private List<String> deletedDisplayIds;
    private Integer failedCount;
    private List<String> failedDbIds;
    private LocalDateTime deleteTime;
}
