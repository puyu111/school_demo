package org.example.school_demo.algorithm;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.config.SimulatedAnnealingProperties;
import org.example.school_demo.model.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 模拟退火算法核心实现
 *
 * 算法流程：
 * 1. 生成初始解（随机但合法的排课方案）
 * 2. 循环直到温度低于阈值：
 *    a. 在当前温度下进行多次迭代
 *    b. 每次迭代生成一个邻域解（通过交换/移动操作）
 *    c. 计算代价变化 ΔE
 *    d. 如果 ΔE < 0，接受新解；否则以概率 exp(-ΔE/T) 接受
 *    e. 记录最优解
 *    3. 降温 T = T * alpha
 * 4. 返回最优解
 *
 * 参考：Kirkpatrick, S., Gelatt, C. D., & Vecchi, M. P. (1983).
 * Optimization by Simulated Annealing. Science, 220(4598), 671-680.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SimulatedAnnealingAlgorithm {

    private final SimulatedAnnealingProperties properties;

    // 算法运行状态
    private volatile boolean cancelled = false;

    /**
     * 执行模拟退火算法
     *
     * @param courses 课程列表
     * @param teachers 教师列表
     * @param classrooms 教室列表
     * @param allTimeSlots 所有时间段 ID 列表
     * @return 排课方案
     */
    public AlgorithmResult execute(
            List<Course> courses,
            List<Teacher> teachers,
            List<Classroom> classrooms,
            List<String> allTimeSlots
    ) {
        cancelled = false;

        // 构建查找表
        Map<String, Teacher> teacherMap = toMap(teachers, Teacher::getId);
        Map<String, Classroom> classroomMap = toMap(classrooms, Classroom::getId);
        Map<String, Course> courseMap = toMap(courses, Course::getId);

        // 初始化参数
        double temperature = properties.getInitialTemperature();
        double minTemp = properties.getMinTemperature();
        double coolingRate = properties.getCoolingRate();
        int iterationsPerTemp = properties.getIterationsPerTemperature();
        int noImprovementThreshold = properties.getNoImprovementThreshold();

        // 设置随机种子（用于结果复现）
        if (properties.getRandomSeed() != null) {
            ThreadLocalRandom.current().setSeed(properties.getRandomSeed());
        }

        log.info("开始模拟退火算法 - 初始温度：{}, 终止温度：{}, 冷却率：{}",
                 temperature, minTemp, coolingRate);

        // ========== 步骤 1: 生成初始解 ==========
        TimetableSolution currentSolution = generateInitialSolution(
                courses, teachers, classrooms, allTimeSlots, teacherMap, classroomMap
        );

        // 计算初始代价
        double currentCost = calculateCost(currentSolution, teachers, teacherMap);
        double bestCost = currentCost;
        TimetableSolution bestSolution = currentSolution.copy();

        // 算法统计信息
        long startTime = System.currentTimeMillis();
        int totalIterations = 0;
        int noImprovementCount = 0;
        int acceptedCount = 0;

        // ========== 步骤 2: 模拟退火主循环 ==========
        while (temperature > minTemp && !cancelled) {
            noImprovementCount = 0;

            // 在当前温度下进行多次迭代
            for (int i = 0; i < iterationsPerTemp && !cancelled; i++) {
                totalIterations++;

                // 生成邻域解
                TimetableSolution neighborSolution = generateNeighbor(
                        currentSolution, allTimeSlots, classroomMap
                );

                // 计算邻域解的代价
                double neighborCost = calculateCost(neighborSolution, teachers, teacherMap);

                // 计算代价变化 ΔE = E_new - E_current
                // 如果 ΔE < 0，说明新解更优
                double deltaE = neighborCost - currentCost;

                // ========== Metropolis 接受准则 ==========
                boolean accept = false;
                if (deltaE < 0) {
                    // 新解更优，直接接受
                    accept = true;
                } else if (temperature > 0) {
                    // 新解更差，以概率 exp(-ΔE/T) 接受
                    // 温度越高，接受劣解的概率越大（有利于跳出局部最优）
                    double acceptanceProbability = Math.exp(-deltaE / temperature);
                    if (ThreadLocalRandom.current().nextDouble() < acceptanceProbability) {
                        accept = true;
                    }
                }

                if (accept) {
                    currentSolution = neighborSolution;
                    currentCost = neighborCost;
                    acceptedCount++;

                    // 如果找到了更好的解，更新最优解
                    if (currentCost < bestCost) {
                        bestSolution = currentSolution.copy();
                        bestCost = currentCost;
                        noImprovementCount = 0;

                        if (properties.getEnableDetailedLogging()) {
                            log.debug("迭代 {}: 找到新最优解，代价：{}", totalIterations, bestCost);
                        }
                    }
                }

                // 检查是否连续无改进
                if (deltaE >= 0 || currentCost >= bestCost) {
                    noImprovementCount++;
                }

                // 提前终止：连续多代无改进
                if (noImprovementCount >= noImprovementThreshold) {
                    log.info("连续 {} 代无改进，提前终止", noImprovementThreshold);
                    break;
                }
            }

            // ========== 温度衰减 ==========
            // 使用几何冷却策略：T_new = T_old * alpha
            temperature = temperature * coolingRate;

            if (properties.getEnableDetailedLogging() && totalIterations % 500 == 0) {
                log.info("迭代 {}, 温度：{:.4f}, 最优代价：{:.2f}, 接受率：{:.2%}",
                        totalIterations, temperature, bestCost,
                        (double) acceptedCount / totalIterations);
            }
        }

        // 计算最终统计信息
        long executionTime = System.currentTimeMillis() - startTime;
        boolean foundFeasible = bestSolution.getHardConstraintViolations() == 0;

        log.info("算法结束 - 总迭代：{}, 最终温度：{:.4f}, 最优代价：{:.2f}, 耗时：{}ms",
                 totalIterations, temperature, bestCost, executionTime);

        // 更新最优解的统计信息
        bestSolution.setFitnessScore(bestCost);
        bestSolution.setFeasible(foundFeasible);

        return AlgorithmResult.builder()
                .solution(bestSolution)
                .iterations(totalIterations)
                .finalTemperature(temperature)
                .finalCost(bestCost)
                .foundFeasibleSolution(foundFeasible)
                .executionTimeMs(executionTime)
                .acceptedCount(acceptedCount)
                .build();
    }

    /**
     * 生成初始解
     * 策略：随机但合法地分配每门课程到可用的 (时间段，教室) 组合
     */
    private TimetableSolution generateInitialSolution(
            List<Course> courses,
            List<Teacher> teachers,
            List<Classroom> classrooms,
            List<String> allTimeSlots,
            Map<String, Teacher> teacherMap,
            Map<String, Classroom> classroomMap
    ) {
        TimetableSolution solution = new TimetableSolution();
        solution.setCourses(courses);
        solution.setTeachers(teachers);
        solution.setClassrooms(classrooms);
        solution.setAllTimeSlots(allTimeSlots);

        // 跟踪已使用的资源
        Set<String> usedTeacherSlots = new HashSet<>();  // teacherId+slotId
        Set<String> usedClassroomSlots = new HashSet<>(); // classroomId+slotId
        Set<String> usedClassSlots = new HashSet<>();     // classId+slotId

        // 复制一份可用时间段列表用于随机选择
        List<String> availableSlots = new ArrayList<>(allTimeSlots);
        Collections.shuffle(availableSlots);

        for (Course course : courses) {
            Teacher teacher = teacherMap.get(course.getTeacherId());
            if (teacher == null) {
                log.warn("课程 {} 的教师 {} 不存在", course.getName(), course.getTeacherId());
                continue;
            }

            boolean assigned = false;

            // 尝试为课程的每个课时找到一个合法的 (时间段，教室) 组合
            for (int p = 0; p < course.getRequiredPeriods() && !assigned; p++) {
                // 随机打乱时间段顺序，增加解的多样性
                Collections.shuffle(availableSlots);

                for (String slotId : availableSlots) {
                    if (assigned) break;

                    // 检查教师是否可用
                    if (!teacher.isAvailableAt(slotId)) continue;

                    // 检查教师该时间段是否已有课
                    if (usedTeacherSlots.contains(teacher.getId() + ":" + slotId)) continue;

                    // 检查班级该时间段是否已有课
                    if (course.getClassId() != null &&
                        usedClassSlots.contains(course.getClassId() + ":" + slotId)) {
                        continue;
                    }

                    // 寻找合适的教室
                    for (Classroom classroom : classrooms) {
                        if (!classroom.isAvailableAt(slotId)) continue;
                        if (!classroom.isSuitableFor(course)) continue;

                        String classroomSlotKey = classroom.getId() + ":" + slotId;
                        if (usedClassroomSlots.contains(classroomSlotKey)) continue;

                        // 找到合法分配
                        CourseAssignment assignment = CourseAssignment.builder()
                                .courseId(course.getId())
                                .timeSlotId(slotId)
                                .classroomId(classroom.getId())
                                .teacherId(teacher.getId())
                                .build();

                        solution.addAssignment(assignment);

                        // 标记资源已使用
                        usedTeacherSlots.add(teacher.getId() + ":" + slotId);
                        usedClassroomSlots.add(classroomSlotKey);
                        if (course.getClassId() != null) {
                            usedClassSlots.add(course.getClassId() + ":" + slotId);
                        }

                        assigned = true;
                        break;
                    }
                }

                if (!assigned) {
                    log.warn("无法为课程 {} 生成合法初始分配", course.getName());
                }
            }
        }

        // 计算初始代价
        solution.setFitnessScore(calculateCost(solution, teachers, teacherMap));
        return solution;
    }

    /**
     * 生成邻域解
     * 通过邻域操作对当前解进行微小扰动
     *
     * 支持的邻域操作：
     * 1. 交换操作 (Swap): 交换两门课的时间段
     * 2. 移动操作 (Move): 将一门课移动到另一个空闲时间段
     */
    private TimetableSolution generateNeighbor(
            TimetableSolution currentSolution,
            List<String> allTimeSlots,
            Map<String, Classroom> classroomMap
    ) {
        TimetableSolution neighbor = currentSolution.copy();

        // 随机选择邻域操作类型
        int operationType = ThreadLocalRandom.current().nextInt(3);
        List<CourseAssignment> assignmentsList = new ArrayList<>(neighbor.getAssignments().values());

        if (assignmentsList.size() < 2) {
            return neighbor;
        }

        switch (operationType) {
            case 0:
                // ========== Swap 操作：交换两门课的时间段 ==========
                swapTimeSlots(neighbor, assignmentsList, allTimeSlots);
                break;
            case 1:
                // ========== Move 操作：移动一门课到空闲时间段 ==========
                moveCourse(neighbor, assignmentsList, allTimeSlots, classroomMap);
                break;
            case 2:
                // ========== Swap Classroom 操作：交换两门课的教室 ==========
                swapClassrooms(neighbor, assignmentsList);
                break;
        }

        return neighbor;
    }

    /**
     * Swap 操作：交换两门课的时间段
     * 前提：两门课的教师不同，且交换后仍满足约束
     */
    private void swapTimeSlots(
            TimetableSolution solution,
            List<CourseAssignment> assignments,
            List<String> allTimeSlots
    ) {
        int idx1 = ThreadLocalRandom.current().nextInt(assignments.size());
        int idx2 = ThreadLocalRandom.current().nextInt(assignments.size());

        if (idx1 == idx2) {
            idx2 = (idx2 + 1) % assignments.size();
        }

        CourseAssignment a1 = assignments.get(idx1);
        CourseAssignment a2 = assignments.get(idx2);

        // 交换时间段
        String tempSlot = a1.getTimeSlotId();
        a1.setTimeSlotId(a2.getTimeSlotId());
        a2.setTimeSlotId(tempSlot);
    }

    /**
     * Move 操作：移动一门课到另一个空闲时间段
     */
    private void moveCourse(
            TimetableSolution solution,
            List<CourseAssignment> assignments,
            List<String> allTimeSlots,
            Map<String, Classroom> classroomMap
    ) {
        int idx = ThreadLocalRandom.current().nextInt(assignments.size());
        CourseAssignment assignment = assignments.get(idx);

        // 随机选择一个新时间段
        String newSlot = allTimeSlots.get(
                ThreadLocalRandom.current().nextInt(allTimeSlots.size())
        );

        // 随机选择一个教室
        List<Classroom> classrooms = new ArrayList<>(classroomMap.values());
        Classroom newClassroom = classrooms.get(
                ThreadLocalRandom.current().nextInt(classrooms.size())
        );

        assignment.setTimeSlotId(newSlot);
        assignment.setClassroomId(newClassroom.getId());
    }

    /**
     * Swap Classroom 操作：交换两门课的教室（同时间段）
     */
    private void swapClassrooms(
            TimetableSolution solution,
            List<CourseAssignment> assignments
    ) {
        // 找到时间段相同的两门课
        Map<String, List<CourseAssignment>> byTimeSlot = new HashMap<>();
        for (CourseAssignment a : assignments) {
            byTimeSlot.computeIfAbsent(a.getTimeSlotId(), k -> new ArrayList<>()).add(a);
        }

        // 选择一个有多门课的时间段
        List<String> multiSlotTimes = byTimeSlot.entrySet().stream()
                .filter(e -> e.getValue().size() >= 2)
                .map(Map.Entry::getKey)
                .toList();

        if (multiSlotTimes.isEmpty()) {
            // 退化为随机交换
            swapTimeSlots(solution, assignments, new ArrayList<>(solution.getAllTimeSlots()));
            return;
        }

        String timeSlot = multiSlotTimes.get(
                ThreadLocalRandom.current().nextInt(multiSlotTimes.size())
        );
        List<CourseAssignment> sameTimeAssignments = byTimeSlot.get(timeSlot);

        if (sameTimeAssignments.size() >= 2) {
            CourseAssignment a1 = sameTimeAssignments.get(0);
            CourseAssignment a2 = sameTimeAssignments.get(1);

            // 交换教室
            String tempClassroom = a1.getClassroomId();
            a1.setClassroomId(a2.getClassroomId());
            a2.setClassroomId(tempClassroom);
        }
    }

    /**
     * 计算代价函数
     *
     * 代价 = 硬约束违反惩罚 + 软约束违反惩罚
     *
     * 硬约束（违反则给予极大惩罚）：
     * 1. 同一教师同一时间段多门课
     * 2. 同一教室同一时间段多门课
     * 3. 教室容量不足
     * 4. 时间段不在教师/教室可用范围内
     *
     * 软约束（尽量优化）：
     * 1. 教师偏好时间段未满足
     * 2. 教师连续上课超过限制
     * 3. 教室利用率不均衡
     */
    private double calculateCost(
            TimetableSolution solution,
            List<Teacher> teachers,
            Map<String, Teacher> teacherMap
    ) {
        double cost = 0.0;
        int hardViolations = 0;
        double softCost = 0.0;

        // ========== 硬约束检查 ==========

        // 1. 检查教师冲突（同一教师同一时间段多门课）
        Map<String, List<CourseAssignment>> teacherSlotMap = new HashMap<>();
        for (CourseAssignment assignment : solution.getAssignments().values()) {
            String key = assignment.getTeacherId() + ":" + assignment.getTimeSlotId();
            teacherSlotMap.computeIfAbsent(key, k -> new ArrayList<>()).add(assignment);
        }

        for (List<CourseAssignment> conflicts : teacherSlotMap.values()) {
            if (conflicts.size() > 1) {
                hardViolations += conflicts.size() - 1;
            }
        }

        // 2. 检查教室冲突（同一教室同一时间段多门课）
        Map<String, List<CourseAssignment>> classroomSlotMap = new HashMap<>();
        for (CourseAssignment assignment : solution.getAssignments().values()) {
            String key = assignment.getClassroomId() + ":" + assignment.getTimeSlotId();
            classroomSlotMap.computeIfAbsent(key, k -> new ArrayList<>()).add(assignment);
        }

        for (List<CourseAssignment> conflicts : classroomSlotMap.values()) {
            if (conflicts.size() > 1) {
                hardViolations += conflicts.size() - 1;
            }
        }

        // ========== 软约束计算 ==========

        // 1. 教师偏好时间段满足度（未满足偏好则增加代价）
        double teacherPreferenceCost = 0.0;
        for (CourseAssignment assignment : solution.getAssignments().values()) {
            Teacher teacher = teacherMap.get(assignment.getTeacherId());
            if (teacher != null && !teacher.isPreferred(assignment.getTimeSlotId())) {
                // 如果教师有偏好但该时间段不在偏好列表中，增加少量代价
                if (!teacher.getPreferredSlots().isEmpty()) {
                    teacherPreferenceCost += 1.0;
                }
            }
        }

        // 2. 教师连续上课检查
        double continuousClassCost = 0.0;
        for (Teacher teacher : teachers) {
            List<CourseAssignment> teacherAssignments = new ArrayList<>(
                    solution.getAssignments().values()
                    .stream()
                    .filter(a -> a.getTeacherId().equals(teacher.getId()))
                    .toList()
            );

            if (teacherAssignments.isEmpty()) continue;

            // 按时间段排序
            teacherAssignments.sort(Comparator
                    .comparingInt((CourseAssignment a) -> a.getDayOfWeek())
                    .thenComparingInt(CourseAssignment::getPeriod));

            // 检查连续上课情况
            int continuousCount = 1;
            for (int i = 1; i < teacherAssignments.size(); i++) {
                CourseAssignment prev = teacherAssignments.get(i - 1);
                CourseAssignment curr = teacherAssignments.get(i);

                // 同一天且节次连续
                if (prev.getDayOfWeek().equals(curr.getDayOfWeek()) &&
                    curr.getPeriod() == prev.getPeriod() + 1) {
                    continuousCount++;
                } else {
                    continuousCount = 1;
                }

                // 超过最大连续节数限制，增加代价
                if (continuousCount > teacher.getMaxContinuousPeriods()) {
                    continuousClassCost += 1.0;
                }
            }
        }

        // 3. 教室利用率均衡性检查
        double classroomBalanceCost = 0.0;
        Map<String, Integer> classroomUsage = new HashMap<>();
        for (CourseAssignment assignment : solution.getAssignments().values()) {
            classroomUsage.merge(assignment.getClassroomId(), 1, Integer::sum);
        }

        if (!classroomUsage.isEmpty()) {
            double avgUsage = classroomUsage.values().stream()
                    .mapToInt(Integer::intValue)
                    .average()
                    .orElse(0.0);

            double variance = classroomUsage.values().stream()
                    .mapToDouble(u -> Math.pow(u - avgUsage, 2))
                    .average()
                    .orElse(0.0);

            // 方差越大，代价越高
            classroomBalanceCost = Math.sqrt(variance);
        }

        // ========== 计算总代价 ==========
        softCost = teacherPreferenceCost * properties.getTeacherPreferenceWeight()
                 + continuousClassCost * properties.getContinuousClassWeight()
                 + classroomBalanceCost * properties.getClassroomBalanceWeight();

        cost = hardViolations * properties.getHardConstraintWeight() + softCost;

        // 更新解的统计信息
        solution.setHardConstraintViolations(hardViolations);
        solution.setSoftConstraintCost(softCost);
        solution.setFitnessScore(cost);

        return cost;
    }

    /**
     * 将列表转换为 Map
     */
    private <T> Map<String, T> toMap(List<T> list, java.util.function.Function<T, String> keyExtractor) {
        Map<String, T> map = new HashMap<>();
        for (T item : list) {
            map.put(keyExtractor.apply(item), item);
        }
        return map;
    }

    /**
     * 取消算法执行
     */
    public void cancel() {
        cancelled = true;
    }

    /**
     * 算法执行结果
     */
    @Data
    @Builder
    public static class AlgorithmResult {
        private TimetableSolution solution;
        private int iterations;
        private double finalTemperature;
        private double finalCost;
        private boolean foundFeasibleSolution;
        private long executionTimeMs;
        private int acceptedCount;
    }
}
