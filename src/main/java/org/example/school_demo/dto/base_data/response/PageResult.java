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
public class PageResult<T> {

    private List<T> list;
    private Long total;

    public static <T> PageResult<T> of(List<T> list, Long total) {
        return PageResult.<T>builder()
                .list(list)
                .total(total)
                .build();
    }
}
