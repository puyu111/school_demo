import {
  BorderOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Modal, message, Radio, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTeachers, useUnavailableDatesWithApi } from '../hooks/useApiData';
import type { SelectionType, Teacher, UnavailableDate } from '../types';
import AddDateForm from './AddDateForm';
import TeacherSelectionPanel from './TeacherSelectionPanel';
import UnavailableDateTable from './UnavailableDateTable';

interface WeekOption {
  label: string;
  value: string;
}

const TeacherUnavailableDialog: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [teacherSearchText, setTeacherSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'select' | 'manage'>('select');
  const [_selectionType, _setSelectionType] = useState<SelectionType>('single');

  // 使用 API 获取教师数据
  const { teachers, teachersLoading } = useTeachers();

  // 使用 API 获取不可用日期
  const {
    dates,
    datesLoading,
    loadDates,
    bulkAddDates,
    deleteDate,
    bulkDeleteDates,
  } = useUnavailableDatesWithApi();

  const {
    selectionType,
    setSelectionType,
    selectedDate,
    setSelectedDate,
    dateRange,
    setDateRange,
    selectedWeek,
    setSelectedWeek,
    selectedMonth,
    setSelectedMonth,
    selectedQuarter,
    setSelectedQuarter,
    reason,
    setReason,
    addWeekendOnly,
    setAddWeekendOnly,
    addWorkdayOnly,
    setAddWorkdayOnly,
    resetSelector,
    disabledDate,
    getWeekDateRange,
    getQuarterMonths,
  } = useDateSelector();

  // 生成周选项
  const weeks: WeekOption[] = useMemo(() => {
    const currentYear = dayjs().year();
    const weekOptions: WeekOption[] = [];
    for (let i = 1; i <= 52; i++) {
      weekOptions.push({
        label: `第${i}周 (${getWeekDateRange(currentYear, i)})`,
        value: `${currentYear}-W${i.toString().padStart(2, '0')}`,
      });
    }
    return weekOptions;
  }, [getWeekDateRange]);

  // 筛选显示的日期
  const displayedDates = useMemo(() => {
    if (selectedTeachers.length === 0) return dates;
    return dates.filter((date: UnavailableDate) =>
      selectedTeachers.includes(date.teacherId),
    );
  }, [dates, selectedTeachers]);

  // 处理教师选择
  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId],
    );
  };

  // 处理日期选择变化
  const handleDateChange = (type: string, value: any) => {
    switch (type) {
      case 'date':
        setSelectedDate(value);
        break;
      case 'week':
        setSelectedWeek(value);
        break;
      case 'month':
        setSelectedMonth(value);
        break;
      case 'quarter':
        setSelectedQuarter(value);
        break;
      case 'range':
        setDateRange(value);
        break;
    }
  };

  // 添加不可排日期
  const handleAddDate = async () => {
    if (selectedTeachers.length === 0) {
      message.warning('请先选择教师');
      return;
    }

    if (!reason.trim()) {
      message.warning('请输入原因');
      return;
    }

    const datesToAdd: Omit<UnavailableDate, 'key'>[] = [];

    switch (selectionType) {
      case 'single': {
        if (!selectedDate) {
          message.warning('请选择日期');
          return;
        }

        const isWeekend = selectedDate.day() === 0 || selectedDate.day() === 6;
        if (addWeekendOnly && !isWeekend) {
          message.warning('请选择周末日期');
          return;
        }
        if (addWorkdayOnly && isWeekend) {
          message.warning('请选择工作日日期');
          return;
        }

        const dateStart = selectedDate.startOf('day').valueOf();
        const dateEnd = selectedDate.endOf('day').valueOf();

        selectedTeachers.forEach((teacherId: string) => {
          const teacher = teachers.find((t: Teacher) => t.id === teacherId);
          if (!teacher) return;

          const exists = dates.some(
            (item: UnavailableDate) =>
              item.teacherId === teacherId &&
              Array.isArray(item.validDate) &&
              item.validDate[0] === dateStart &&
              item.validDate[1] === dateEnd,
          );

          if (exists) {
            message.warning(`${teacher.name}的该日期已存在`);
            return;
          }

          datesToAdd.push({
            teacherId,
            teacherName: teacher.name,
            validDate: [dateStart, dateEnd],
            reason: reason.trim(),
            type: 'other',
            rangeType: 'single',
          });
        });
        break;
      }

      case 'week': {
        if (!selectedWeek) {
          message.warning('请选择周');
          return;
        }
        const [year, week] = selectedWeek.split('-W');
        const weekStart = dayjs()
          .year(parseInt(year, 10))
          .week(parseInt(week, 10))
          .startOf('week')
          .valueOf();
        const weekEnd = dayjs()
          .year(parseInt(year, 10))
          .week(parseInt(week, 10))
          .endOf('week')
          .valueOf();

        selectedTeachers.forEach((teacherId: string) => {
          const teacher = teachers.find((t: Teacher) => t.id === teacherId);
          if (!teacher) return;

          datesToAdd.push({
            teacherId,
            teacherName: teacher.name,
            validDate: [weekStart, weekEnd],
            reason: reason.trim(),
            type: 'other',
            rangeType: 'week',
          });
        });
        break;
      }

      case 'month': {
        if (!selectedMonth) {
          message.warning('请选择月份');
          return;
        }
        const monthStart = dayjs()
          .month(parseInt(selectedMonth, 10) - 1)
          .startOf('month')
          .valueOf();
        const monthEnd = dayjs()
          .month(parseInt(selectedMonth, 10) - 1)
          .endOf('month')
          .valueOf();

        selectedTeachers.forEach((teacherId: string) => {
          const teacher = teachers.find((t: Teacher) => t.id === teacherId);
          if (!teacher) return;

          datesToAdd.push({
            teacherId,
            teacherName: teacher.name,
            validDate: [monthStart, monthEnd],
            reason: reason.trim(),
            type: 'other',
            rangeType: 'month',
          });
        });
        break;
      }

      case 'quarter': {
        if (!selectedQuarter) {
          message.warning('请选择季度');
          return;
        }
        const quarter = parseInt(selectedQuarter, 10);
        const quarterMonths = getQuarterMonths(quarter);
        const quarterStart = dayjs()
          .month(quarterMonths[0] - 1)
          .startOf('month')
          .valueOf();
        const quarterEnd = dayjs()
          .month(quarterMonths[quarterMonths.length - 1] - 1)
          .endOf('month')
          .valueOf();

        selectedTeachers.forEach((teacherId: string) => {
          const teacher = teachers.find((t: Teacher) => t.id === teacherId);
          if (!teacher) return;

          datesToAdd.push({
            teacherId,
            teacherName: teacher.name,
            validDate: [quarterStart, quarterEnd],
            reason: reason.trim(),
            type: 'other',
            rangeType: 'quarter',
          });
        });
        break;
      }

      case 'range': {
        if (!dateRange[0] || !dateRange[1]) {
          message.warning('请选择日期范围');
          return;
        }
        const rangeStart = dateRange[0]?.startOf('day').valueOf();
        const rangeEnd = dateRange[1]?.endOf('day').valueOf();

        selectedTeachers.forEach((teacherId: string) => {
          const teacher = teachers.find((t: Teacher) => t.id === teacherId);
          if (!teacher) return;

          datesToAdd.push({
            teacherId,
            teacherName: teacher.name,
            validDate: [rangeStart, rangeEnd],
            reason: reason.trim(),
            type: 'other',
            rangeType: 'range',
          });
        });
        break;
      }
    }

    if (datesToAdd.length > 0) {
      try {
        await bulkAddDates(datesToAdd);
        resetSelector();
        message.success(`成功为${selectedTeachers.length}位教师添加不可排日期`);
      } catch (_error) {
        message.error('添加失败，请重试');
      }
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    const keysToDelete =
      selectedTeachers.length > 0
        ? displayedDates.map((d) => d.key)
        : dates.map((d) => d.key);

    if (keysToDelete.length === 0) {
      message.info('暂无数据');
      return;
    }

    try {
      await bulkDeleteDates(keysToDelete);
      message.success(`已清空${keysToDelete.length}条记录`);
    } catch (_error) {
      message.error('删除失败，请重试');
    }
  };

  // 统计信息
  const stats = useMemo(() => {
    const uniqueTeachers = new Set(
      dates.map((d: UnavailableDate) => d.teacherName),
    ).size;
    const typeCounts = {
      single: dates.filter((d: UnavailableDate) => d.rangeType === 'single')
        .length,
      week: dates.filter((d: UnavailableDate) => d.rangeType === 'week').length,
      month: dates.filter((d: UnavailableDate) => d.rangeType === 'month')
        .length,
      quarter: dates.filter((d: UnavailableDate) => d.rangeType === 'quarter')
        .length,
      range: dates.filter((d: UnavailableDate) => d.rangeType === 'range')
        .length,
    };
    return { uniqueTeachers, typeCounts };
  }, [dates]);

  // 对话框打开时加载数据
  useEffect(() => {
    if (modalOpen) {
      loadDates();
    }
  }, [modalOpen]);

  return (
    <>
      <Button
        type="primary"
        icon={<CalendarOutlined />}
        onClick={() => setModalOpen(true)}
        style={{ marginBottom: 16 }}
        loading={teachersLoading || datesLoading}
      >
        管理教师不可排日期
      </Button>

      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>教师不可排日期管理</span>
          </Space>
        }
        open={modalOpen}
        onOk={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
        width={1200}
        footer={[
          <Button
            key="batch"
            danger
            onClick={handleBatchDelete}
            icon={<DeleteOutlined />}
          >
            清空
          </Button>,
          <Button key="cancel" onClick={() => setModalOpen(false)}>
            取消
          </Button>,
          <Button key="ok" type="primary" onClick={() => setModalOpen(false)}>
            <CheckCircleOutlined style={{ marginRight: 4 }} />
            保存
          </Button>,
        ]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 教师选择面板 */}
          <TeacherSelectionPanel
            teachers={teachers}
            selectedTeacherIds={selectedTeachers}
            searchText={teacherSearchText}
            activeTab={activeTab}
            onTeacherSelect={handleTeacherSelect}
            onSearchChange={setTeacherSearchText}
            onTabChange={setActiveTab}
            onClearSelection={() => setSelectedTeachers([])}
          />

          {/* 日期管理区域 */}
          {activeTab === 'manage' && (
            <>
              {/* 日期类型选择 */}
              <div>
                <h4>
                  <BorderOutlined style={{ marginRight: 8 }} />
                  选择日期类型
                </h4>
                <Radio.Group
                  value={selectionType}
                  onChange={(e) => setSelectionType(e.target.value)}
                  buttonStyle="solid"
                  style={{ marginBottom: 16 }}
                >
                  <Radio.Button value="single">单日</Radio.Button>
                  <Radio.Button value="week">整周</Radio.Button>
                  <Radio.Button value="month">整月</Radio.Button>
                  <Radio.Button value="quarter">季度</Radio.Button>
                  <Radio.Button value="range">日期区间</Radio.Button>
                </Radio.Group>
              </div>

              {/* 添加日期表单 */}
              <AddDateForm
                selectionType={selectionType}
                selectedDate={selectedDate}
                dateRange={dateRange}
                selectedWeek={selectedWeek}
                selectedMonth={selectedMonth}
                selectedQuarter={selectedQuarter}
                reason={reason}
                addWeekendOnly={addWeekendOnly}
                addWorkdayOnly={addWorkdayOnly}
                selectedTeacherCount={selectedTeachers.length}
                weeks={weeks}
                disabledDate={disabledDate}
                onDateChange={handleDateChange}
                onReasonChange={(value) => setReason(value)}
                onWeekendOnlyChange={setAddWeekendOnly}
                onWorkdayOnlyChange={setAddWorkdayOnly}
                onAdd={handleAddDate}
              />

              {/* 日期表格 */}
              <div>
                <h4>
                  不可排日期列表
                  {selectedTeachers.length > 0 && (
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      仅显示选中的{selectedTeachers.length}位教师
                    </Tag>
                  )}
                </h4>
                <UnavailableDateTable
                  data={displayedDates}
                  teachers={teachers}
                  onDelete={deleteDate}
                />
              </div>

              {/* 统计信息 */}
              <div
                style={{
                  background: '#e6f7ff',
                  padding: 16,
                  borderRadius: 6,
                  border: '1px solid #91d5ff',
                }}
              >
                <Space wrap>
                  <span>
                    <strong>总计：</strong>
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {dates.length} 条
                    </Tag>
                  </span>
                  <span>|</span>
                  <span>
                    <strong>教师：</strong>
                    <Tag color="green">{stats.uniqueTeachers} 位</Tag>
                  </span>
                  <span>|</span>
                  <Space size="small">
                    <Tag color="blue">{stats.typeCounts.single} 单日</Tag>
                    <Tag color="green">{stats.typeCounts.week} 周</Tag>
                    <Tag color="orange">{stats.typeCounts.month} 月</Tag>
                    <Tag color="purple">{stats.typeCounts.quarter} 季度</Tag>
                    <Tag color="cyan">{stats.typeCounts.range} 区间</Tag>
                  </Space>
                </Space>
              </div>
            </>
          )}
        </Space>
      </Modal>
    </>
  );
};

// 日期选择器 Hook
const useDateSelector = () => {
  const [selectionType, setSelectionType] = useState<SelectionType>('single');
  const [selectedDate, setSelectedDate] = useState<any | null>(null);
  const [dateRange, setDateRange] = useState<[any | null, any | null]>([
    null,
    null,
  ]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [reason, setReason] = useState('');
  const [addWeekendOnly, setAddWeekendOnly] = useState(false);
  const [addWorkdayOnly, setAddWorkdayOnly] = useState(false);

  const resetSelector = useCallback(() => {
    setSelectedDate(null);
    setDateRange([null, null]);
    setSelectedWeek('');
    setSelectedMonth('');
    setSelectedQuarter('');
    setReason('');
    setAddWeekendOnly(false);
    setAddWorkdayOnly(false);
  }, []);

  const disabledDate = useCallback((current: any) => {
    return current && current < dayjs().startOf('day');
  }, []);

  const getWeekDateRange = useCallback((year: number, week: number): string => {
    const startOfWeek = dayjs().year(year).week(week).startOf('week');
    const endOfWeek = startOfWeek.endOf('week');
    return `${startOfWeek.format('MM/DD')}-${endOfWeek.format('MM/DD')}`;
  }, []);

  const getQuarterMonths = useCallback((quarter: number): number[] => {
    const quarterMap: Record<number, number[]> = {
      1: [1, 2, 3],
      2: [4, 5, 6],
      3: [7, 8, 9],
      4: [10, 11, 12],
    };
    return quarterMap[quarter] || [];
  }, []);

  return {
    selectionType,
    setSelectionType,
    selectedDate,
    setSelectedDate,
    dateRange,
    setDateRange,
    selectedWeek,
    setSelectedWeek,
    selectedMonth,
    setSelectedMonth,
    selectedQuarter,
    setSelectedQuarter,
    reason,
    setReason,
    addWeekendOnly,
    setAddWeekendOnly,
    addWorkdayOnly,
    setAddWorkdayOnly,
    resetSelector,
    disabledDate,
    getWeekDateRange,
    getQuarterMonths,
  };
};

export default TeacherUnavailableDialog;
