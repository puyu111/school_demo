import { CalendarOutlined } from "@ant-design/icons";
import { Button, Checkbox, Input, Space } from "antd";
import type { Dayjs } from "dayjs";
import React from "react";
import type { SelectionType } from "../types";
import DateSelector from "./DateSelector";

interface AddDateFormProps {
  selectionType: SelectionType;
  selectedDate: Dayjs | null;
  dateRange: [Dayjs | null, Dayjs | null];
  selectedWeek: string;
  selectedMonth: string;
  selectedQuarter: string;
  reason: string;
  addWeekendOnly: boolean;
  addWorkdayOnly: boolean;
  selectedTeacherCount: number;
  weeks?: Array<{ label: string; value: string }>;
  disabledDate?: (current: Dayjs) => boolean;
  onDateChange: (type: string, value: any) => void;
  onReasonChange: (value: string) => void;
  onWeekendOnlyChange: (checked: boolean) => void;
  onWorkdayOnlyChange: (checked: boolean) => void;
  onAdd: () => void;
}

/**
 * 添加不可排日期表单组件
 */
const AddDateForm: React.FC<AddDateFormProps> = ({
  selectionType,
  selectedDate,
  dateRange,
  selectedWeek,
  selectedMonth,
  selectedQuarter,
  reason,
  addWeekendOnly,
  addWorkdayOnly,
  selectedTeacherCount,
  weeks,
  disabledDate,
  onDateChange,
  onReasonChange,
  onWeekendOnlyChange,
  onWorkdayOnlyChange,
  onAdd,
}) => {
  return (
    <div
      style={{
        background: "#f6ffed",
        padding: 20,
        borderRadius: 8,
        border: "1px solid #b7eb8f",
        marginBottom: 16,
      }}
    >
      <h4 style={{ marginBottom: 16 }}>
        <CalendarOutlined style={{ marginRight: 8 }} />
        添加不可排日期
      </h4>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* 日期类型选择 */}
        <Space wrap>
          <DateSelector
            selectionType={selectionType}
            selectedDate={selectedDate}
            dateRange={dateRange}
            selectedWeek={selectedWeek}
            selectedMonth={selectedMonth}
            selectedQuarter={selectedQuarter}
            disabledDate={disabledDate}
            weeks={weeks}
            onChange={onDateChange}
          />

          <Input
            placeholder="请输入原因（如：个人事务、会议等）"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Button
            type="primary"
            onClick={onAdd}
            disabled={selectedTeacherCount === 0}
          >
            {selectedTeacherCount > 0
              ? `为${selectedTeacherCount}位教师添加`
              : "添加"}
          </Button>
        </Space>

        {/* 筛选选项 */}
        {(selectionType === "single" || selectionType === "range") && (
          <Space>
            <Checkbox
              checked={addWeekendOnly}
              onChange={(e) => {
                onWeekendOnlyChange(e.target.checked);
                if (e.target.checked) onWorkdayOnlyChange(false);
              }}
            >
              仅添加周末
            </Checkbox>
            <Checkbox
              checked={addWorkdayOnly}
              onChange={(e) => {
                onWorkdayOnlyChange(e.target.checked);
                if (e.target.checked) onWeekendOnlyChange(false);
              }}
            >
              仅添加工作日
            </Checkbox>
          </Space>
        )}

        <p style={{ margin: 0, color: "#666", fontSize: 12 }}>
          提示：将为
          {selectedTeacherCount > 0
            ? `${selectedTeacherCount}位选中的教师`
            : "选中的教师"}
          添加不可排日期
          {selectionType === "range" && "（可选择日期范围批量添加）"}
          {selectionType === "week" && "（可添加整周日期）"}
          {selectionType === "month" && "（可添加整月日期）"}
          {selectionType === "quarter" && "（可添加整个季度日期）"}
        </p>
      </Space>
    </div>
  );
};

export default AddDateForm;
