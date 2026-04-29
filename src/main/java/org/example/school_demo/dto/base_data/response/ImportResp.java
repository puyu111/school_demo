package org.example.school_demo.dto.base_data.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ImportResp<T> {

    private Integer total;
    private Integer success;
    private Integer failed;
    private List<T> createdRecords;
    private List<ImportError> errors;
}
