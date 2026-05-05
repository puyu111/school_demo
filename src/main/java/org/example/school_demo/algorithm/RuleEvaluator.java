package org.example.school_demo.algorithm;

import org.example.school_demo.entity.RoomEntity;
import org.example.school_demo.entity.TimeSlotConfigEntity;

import java.util.*;

/**
 * 规则评估器：根据规则权重计算解的总代价。
 * <p>
 * 8 条规则（与 rule_weight 表对应）：
 * - hard: teacher_conflict, room_conflict, class_conflict, teacher_unavailable
 * - soft: room_capacity, course_spread, time_preference, load_balance
 */
public class RuleEvaluator {

    private final Map<String, Integer> ruleWeights;
    private final List<TimeSlotConfigEntity> timeSlots;
    private final Map<Long, RoomEntity> roomMap;
    private final Map<Long, Set<Integer>> teacherUnavailableSlots;
    /** courseId -> 课程类型 (必修/选修/限选) */
    private final Map<Long, String> courseTypeMap;
    /** courseId -> 学生人数 */
    private final Map<Long, Integer> courseStudentCountMap;

    public RuleEvaluator(Map<String, Integer> ruleWeights,
                         List<TimeSlotConfigEntity> timeSlots,
                         Map<Long, RoomEntity> roomMap,
                         Map<Long, Set<Integer>> teacherUnavailableSlots,
                         Map<Long, String> courseTypeMap,
                         Map<Long, Integer> courseStudentCountMap) {
        this.ruleWeights = ruleWeights;
        this.timeSlots = timeSlots;
        this.roomMap = roomMap;
        this.teacherUnavailableSlots = teacherUnavailableSlots;
        this.courseTypeMap = courseTypeMap;
        this.courseStudentCountMap = courseStudentCountMap;
    }

    /**
     * 计算解的总代价并更新解的 ruleScores。
     */
    public double calculateCost(Solution solution) {
        Map<String, Double> scores = new LinkedHashMap<>();
        List<ScheduleSlot> slots = solution.getSlots();

        // 1. teacher_conflict (hard)
        scores.put("teacher_conflict", (double) countTeacherConflicts(slots));

        // 2. room_conflict (hard)
        scores.put("room_conflict", (double) countRoomConflicts(slots));

        // 3. class_conflict (hard)
        scores.put("class_conflict", (double) countClassConflicts(slots));

        // 4. teacher_unavailable (hard)
        scores.put("teacher_unavailable", (double) countTeacherUnavailable(slots));

        // 5. room_capacity (soft)
        scores.put("room_capacity", (double) countRoomCapacityViolations(slots));

        // 6. course_spread (soft)
        scores.put("course_spread", (double) calculateCourseSpreadPenalty(slots));

        // 7. time_preference (soft)
        scores.put("time_preference", (double) calculateTimePreferencePenalty(slots));

        // 8. load_balance (soft)
        scores.put("load_balance", calculateLoadBalancePenalty(slots));

        solution.setRuleScores(scores);

        double totalCost = 0.0;
        for (Map.Entry<String, Double> entry : scores.entrySet()) {
            int weight = getWeight(entry.getKey());
            totalCost += weight * entry.getValue();
        }

        solution.setCost(totalCost);
        return totalCost;
    }

    // ==================== Hard 规则 ====================

    /**
     * 教师冲突：同一教师在同一时间段有多门课。
     * 代价：每对冲突 +1
     */
    private int countTeacherConflicts(List<ScheduleSlot> slots) {
        Map<String, List<ScheduleSlot>> keyMap = new HashMap<>();
        for (ScheduleSlot s : slots) {
            String key = s.getTeacherId() + "-" + s.getWeekday();
            keyMap.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }

        int conflicts = 0;
        for (List<ScheduleSlot> group : keyMap.values()) {
            for (int i = 0; i < group.size(); i++) {
                for (int j = i + 1; j < group.size(); j++) {
                    if (slotsOverlap(group.get(i), group.get(j))) {
                        conflicts++;
                    }
                }
            }
        }
        return conflicts;
    }

    /**
     * 教室冲突：同一教室在同一时间段有多门课。
     */
    private int countRoomConflicts(List<ScheduleSlot> slots) {
        Map<String, List<ScheduleSlot>> keyMap = new HashMap<>();
        for (ScheduleSlot s : slots) {
            if (s.getRoomId() == null) continue;
            String key = s.getRoomId() + "-" + s.getWeekday();
            keyMap.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }

        int conflicts = 0;
        for (List<ScheduleSlot> group : keyMap.values()) {
            for (int i = 0; i < group.size(); i++) {
                for (int j = i + 1; j < group.size(); j++) {
                    if (slotsOverlap(group.get(i), group.get(j))) {
                        conflicts++;
                    }
                }
            }
        }
        return conflicts;
    }

    /**
     * 班级冲突：同一班级在同一时间段有多门课。
     */
    private int countClassConflicts(List<ScheduleSlot> slots) {
        Map<String, List<ScheduleSlot>> keyMap = new HashMap<>();
        for (ScheduleSlot s : slots) {
            if (s.getClassId() == null || s.getClassId().isEmpty()) continue;
            String key = s.getClassId() + "-" + s.getWeekday();
            keyMap.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }

        int conflicts = 0;
        for (List<ScheduleSlot> group : keyMap.values()) {
            for (int i = 0; i < group.size(); i++) {
                for (int j = i + 1; j < group.size(); j++) {
                    if (slotsOverlap(group.get(i), group.get(j))) {
                        conflicts++;
                    }
                }
            }
        }
        return conflicts;
    }

    /**
     * 教师不可用：教师在不可用时段排课。
     * compositeKey = weekday * 100 + slotIndex
     */
    private int countTeacherUnavailable(List<ScheduleSlot> slots) {
        int count = 0;
        for (ScheduleSlot s : slots) {
            Set<Integer> unavailable = teacherUnavailableSlots.get(s.getTeacherId());
            if (unavailable == null) continue;
            for (int i = 0; i < s.getDurationSlots(); i++) {
                int compositeKey = s.getWeekday() * 100 + (s.getStartSlotIndex() + i);
                if (unavailable.contains(compositeKey)) {
                    count++;
                }
            }
        }
        return count;
    }

    // ==================== Soft 规则 ====================

    /**
     * 教室容量：学生数超过教室容量。
     * 使用 courseStudentCountMap 获取实际学生数，而非硬编码 40。
     */
    private int countRoomCapacityViolations(List<ScheduleSlot> slots) {
        int violations = 0;
        for (ScheduleSlot s : slots) {
            if (s.getRoomId() == null) continue;
            RoomEntity room = roomMap.get(s.getRoomId());
            if (room == null) continue;
            int studentCount = courseStudentCountMap.getOrDefault(s.getCourseId(), 40);
            if (room.getCapacity() < studentCount) {
                violations++;
            }
        }
        return violations;
    }

    /**
     * 课程分散度：同一课程的不同课时分散在不同天（避免连续天安排）。
     * 每出现一对连续天安排，+1。
     */
    private int calculateCourseSpreadPenalty(List<ScheduleSlot> slots) {
        Map<Long, List<Integer>> courseDays = new HashMap<>();
        for (ScheduleSlot s : slots) {
            courseDays.computeIfAbsent(s.getCourseId(), k -> new ArrayList<>()).add(s.getWeekday());
        }

        int penalty = 0;
        for (List<Integer> days : courseDays.values()) {
            if (days.size() <= 1) continue;
            Collections.sort(days);
            for (int i = 1; i < days.size(); i++) {
                if (days.get(i) - days.get(i - 1) == 1) {
                    penalty++;
                }
            }
        }
        return penalty;
    }

    /**
     * 时间偏好：
     * - 必修课安排在上午 → 奖励（负惩罚 -1）
     * - 必修课安排在下午/晚 → 惩罚 +1
     * - 实验课安排在下午 → 奖励（负惩罚 -1）
     * - 实验课安排在上午/晚 → 惩罚 +1
     * - 选修课安排在下午/晚 → 奖励（负惩罚 -1）
     */
    private int calculateTimePreferencePenalty(List<ScheduleSlot> slots) {
        int penalty = 0;
        for (ScheduleSlot s : slots) {
            String courseType = courseTypeMap.get(s.getCourseId());
            if (courseType == null) continue;

            String halfDayType = getHalfDayType(s.getStartSlotIndex());
            if (halfDayType == null) continue;

            // 必修课：上午优，下午/晚劣
            if (courseType.contains("必修")) {
                if ("morning".equals(halfDayType)) {
                    penalty -= 1; // 奖励
                } else {
                    penalty += 1; // 惩罚
                }
            }
            // 实验课：下午优，上午/晚劣（课程名称或类型含"实验"）
            else if (courseType.contains("实验") || courseType.contains("实践")) {
                if ("afternoon".equals(halfDayType)) {
                    penalty -= 1;
                } else {
                    penalty += 1;
                }
            }
            // 选修课：下午/晚优（避开上午黄金时段给必修课）
            else if (courseType.contains("选修")) {
                if ("morning".equals(halfDayType)) {
                    penalty += 1;
                } else {
                    penalty -= 1;
                }
            }
        }
        return penalty;
    }

    /**
     * 教师负载均衡：教师日课时标准差 × 10。
     */
    private double calculateLoadBalancePenalty(List<ScheduleSlot> slots) {
        Map<Long, int[]> teacherDailyCount = new HashMap<>();
        for (ScheduleSlot s : slots) {
            int[] daily = teacherDailyCount.computeIfAbsent(s.getTeacherId(), k -> new int[7]);
            int dayIdx = s.getWeekday() - 1;
            if (dayIdx >= 0 && dayIdx < 7) {
                daily[dayIdx]++;
            }
        }

        if (teacherDailyCount.isEmpty()) return 0.0;

        double totalStdDev = 0.0;
        for (int[] daily : teacherDailyCount.values()) {
            double mean = Arrays.stream(daily).average().orElse(0.0);
            double variance = 0.0;
            for (int count : daily) {
                variance += (count - mean) * (count - mean);
            }
            variance /= 7.0;
            totalStdDev += Math.sqrt(variance);
        }

        return totalStdDev / teacherDailyCount.size() * 10.0;
    }

    // ==================== 辅助方法 ====================

    /**
     * 根据 slotIndex 获取 halfDayType。
     */
    private String getHalfDayType(int slotIndex) {
        if (slotIndex < 0 || slotIndex >= timeSlots.size()) return null;
        TimeSlotConfigEntity ts = timeSlots.get(slotIndex);
        return ts != null ? ts.getHalfDayType() : null;
    }

    /**
     * 检查两个 slot 是否时间重叠（同一 weekday 且时间段有交集）。
     */
    private boolean slotsOverlap(ScheduleSlot a, ScheduleSlot b) {
        if (a.getWeekday() != b.getWeekday()) return false;
        int aEnd = a.getStartSlotIndex() + a.getDurationSlots();
        int bEnd = b.getStartSlotIndex() + b.getDurationSlots();
        return a.getStartSlotIndex() < bEnd && aEnd > b.getStartSlotIndex();
    }

    private int getWeight(String ruleId) {
        return ruleWeights.getOrDefault(ruleId, 0);
    }
}
