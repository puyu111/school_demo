package org.example.school_demo.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 时间段实体
 * 表示一周中的某个具体节次，如"周一第 1 节"
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlot {

    /**
     * 时间段唯一标识
     * 格式：{星期}-{节次}，如 "Mon-1", "Tue-3"
     * 星期：Mon, Tue, Wed, Thu, Fri, Sat, Sun
     */
    private String id;

    /**
     * 星期几 (1-7, 1=周一)
     */
    private Integer dayOfWeek;

    /**
     * 节次 (1-12，表示当天第几节课)
     */
    private Integer period;

    /**
     * 显示名称，如 "周一第 1 节"
     */
    private String displayName;

    /**
     * 星期几的中文名称映射
     */
    public static String getDayNameChinese(int dayOfWeek) {
        String[] names = {"", "周一", "周二", "周三", "周四", "周五", "周六", "周日"};
        return names[dayOfWeek];
    }

    /**
     * 从 ID 解析 TimeSlot
     * @param id 格式如 "Mon-1"
     * @return TimeSlot 对象
     */
    public static TimeSlot fromId(String id) {
        String[] parts = id.split("-");
        String dayStr = parts[0];
        int period = Integer.parseInt(parts[1]);

        int dayOfWeek = switch (dayStr) {
            case "Mon" -> 1;
            case "Tue" -> 2;
            case "Wed" -> 3;
            case "Thu" -> 4;
            case "Fri" -> 5;
            case "Sat" -> 6;
            case "Sun" -> 7;
            default -> throw new IllegalArgumentException("Invalid day: " + dayStr);
        };

        return TimeSlot.builder()
                .id(id)
                .dayOfWeek(dayOfWeek)
                .period(period)
                .displayName(getDayNameChinese(dayOfWeek) + "第" + period + "节")
                .build();
    }

    /**
     * 生成所有可能的时间段 ID 列表
     * @param days 天数 (如 5 表示周一到周五)
     * @param periodsPerDay 每天节数 (如 8)
     * @return 时间段 ID 列表
     */
    public static String[] generateAllSlotIds(int days, int periodsPerDay) {
        String[] dayNames = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        String[] ids = new String[days * periodsPerDay];
        int idx = 0;
        for (int d = 0; d < days; d++) {
            for (int p = 1; p <= periodsPerDay; p++) {
                ids[idx++] = dayNames[d] + "-" + p;
            }
        }
        return ids;
    }
}
