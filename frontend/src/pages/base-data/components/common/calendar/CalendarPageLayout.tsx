import { Card, Divider, message } from 'antd';
import type { Dayjs } from 'dayjs';
import React from 'react';
import { PageContentContainer } from '../layout/PageContentContainer';

export interface CalendarOptionsPanelProps {
  selectedDates: string[];
  disabledDates: string[];
  includeWeekends: boolean;
  onIncludeWeekendsChange: (checked: boolean) => void;
  onRemoveDate: (date: string) => void;
  onDisableSelected: () => void;
  onEnableSelected: () => void;
  onSubmit: () => void;
}

const CalendarOptionsPanel: React.FC<CalendarOptionsPanelProps> = ({
  selectedDates,
  disabledDates,
  includeWeekends,
  onIncludeWeekendsChange,
  onRemoveDate,
  onDisableSelected,
  onEnableSelected,
  onSubmit,
}) => {
  return (
    <div
      style={{ width: 300, paddingLeft: 16, borderLeft: '1px solid #f0f0f0' }}
    >
      <div style={{ marginBottom: 24 }}>
        <h4>选中日期 ({selectedDates.length})</h4>
        <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
          {selectedDates.map((date) => (
            <div
              key={date}
              style={{
                display: 'inline-block',
                margin: '4px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: disabledDates.includes(date)
                    ? '#ffccc7'
                    : '#e6f7ff',
                  color: disabledDates.includes(date) ? '#ff4d4f' : '#1890ff',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => onRemoveDate(date)}
              >
                {date} ×
              </span>
            </div>
          ))}
        </div>
        {selectedDates.length === 0 && (
          <p style={{ color: '#ccc' }}>暂无选中日期</p>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={!includeWeekends}
            onChange={(e) => onIncludeWeekendsChange(!e.target.checked)}
          />
          禁用周末
        </label>
      </div>

      <div style={{ marginBottom: 24 }}>
        <button
          type="button"
          onClick={onDisableSelected}
          disabled={selectedDates.length === 0}
          style={{
            marginBottom: '8px',
            width: '100%',
            padding: '8px 16px',
            backgroundColor: selectedDates.length === 0 ? '#d9d9d9' : '#ff4d4f',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedDates.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          禁用选中日期
        </button>
        <button
          type="button"
          onClick={onEnableSelected}
          disabled={
            selectedDates.filter((d) => disabledDates.includes(d)).length === 0
          }
          style={{
            width: '100%',
            padding: '8px 16px',
            backgroundColor:
              selectedDates.filter((d) => disabledDates.includes(d)).length ===
              0
                ? '#d9d9d9'
                : '#fff',
            color:
              selectedDates.filter((d) => disabledDates.includes(d)).length ===
              0
                ? '#999'
                : '#666',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            cursor:
              selectedDates.filter((d) => disabledDates.includes(d)).length ===
              0
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          启用选中日期
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p>已禁用日期：{disabledDates.length}</p>
      </div>

      <Divider />

      <button
        type="button"
        onClick={onSubmit}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#1890ff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        保存设置
      </button>
    </div>
  );
};

// 日历页面状态接口
interface CalendarPageState {
  selectedDates: string[];
  disabledDates: string[];
  includeWeekends: boolean;
  termStart: Dayjs | null;
  termEnd: Dayjs | null;
}

// 日历页面处理器接口
interface CalendarPageHandlers {
  handleDateSelect: (date: string) => void;
  handleDisableSelected: () => void;
  handleEnableSelected: () => void;
  handleSubmit: () => void;
  handleRemoveDate: (date: string) => void;
  handlePanelChange: (date: Dayjs) => void;
  setIncludeWeekends: React.Dispatch<React.SetStateAction<boolean>>;
  setTermStart: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  setTermEnd: React.Dispatch<React.SetStateAction<Dayjs | null>>;
}

// 日历页面渲染函数类型
type CalendarPageChildren = (
  params: CalendarPageState & CalendarPageHandlers,
) => React.ReactNode;

// 日历页面布局组件 - 包含常见状态和逻辑
export interface CalendarPageLayoutProps {
  title?: string;
  initialDisabledDates?: string[];
  initialIncludeWeekends?: boolean;
  onSubmit?: (dates: {
    selected: string[];
    disabled: string[];
    includeWeekends: boolean;
    termStart: Dayjs | null;
    termEnd: Dayjs | null;
  }) => void;
  customActions?: React.ReactNode;
  children?: React.ReactNode | CalendarPageChildren;
}

const CalendarPageLayout: React.FC<CalendarPageLayoutProps> = ({
  title = '学期日历',
  initialDisabledDates = ['2026-02-10', '2026-02-11', '2026-03-08'],
  initialIncludeWeekends = true,
  onSubmit,
  customActions,
  children,
}) => {
  const [selectedDates, setSelectedDates] = React.useState<string[]>([]);
  const [disabledDates, setDisabledDates] =
    React.useState<string[]>(initialDisabledDates);
  const [includeWeekends, setIncludeWeekends] = React.useState(
    initialIncludeWeekends,
  );
  const [termStart, setTermStart] = React.useState<Dayjs | null>(null);
  const [termEnd, setTermEnd] = React.useState<Dayjs | null>(null);

  const handleDateSelect = (date: string) => {
    setSelectedDates((prev) => {
      if (prev.includes(date)) {
        return prev.filter((d) => d !== date);
      } else {
        return [...prev, date].sort();
      }
    });
  };

  const handleDisableSelected = () => {
    setDisabledDates((prev) => {
      const newDisabled = [...prev, ...selectedDates];
      return [...new Set(newDisabled)].sort();
    });
    message.success(`已禁用 ${selectedDates.length} 个选定日期`);
    setSelectedDates([]);
  };

  const handleEnableSelected = () => {
    const selectedDisabledDates = selectedDates.filter((d) =>
      disabledDates.includes(d),
    );
    if (selectedDisabledDates.length === 0) {
      message.warning('选定的日期中没有被禁用的日期');
      setSelectedDates([]);
      return;
    }
    setDisabledDates((prev) => {
      return prev.filter((d) => !selectedDisabledDates.includes(d));
    });
    setSelectedDates([]);

    message.success(`已取消禁用 ${selectedDisabledDates.length} 个日期`);
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({
        selected: selectedDates,
        disabled: disabledDates,
        includeWeekends,
        termStart,
        termEnd,
      });
    } else {
      if (!termStart || !termEnd) {
        message.warning('请先选择学期开始和结束日期');
        return;
      }
      message.success('学期日历设置已保存！');
    }
  };

  const handleRemoveDate = (date: string) => {
    setSelectedDates((prev) => prev.filter((d) => d !== date));
  };

  const handlePanelChange = (date: Dayjs) => {
    console.log(date.format('YYYY-MM-DD'));
  };

  // 检查 children 是否为函数类型
  const renderChildren = () => {
    if (typeof children === 'function') {
      return children({
        selectedDates,
        disabledDates,
        includeWeekends,
        termStart,
        termEnd,
        handleDateSelect,
        handleDisableSelected,
        handleEnableSelected,
        handleSubmit,
        handleRemoveDate,
        handlePanelChange,
        setIncludeWeekends,
        setTermStart,
        setTermEnd,
      });
    }
    return children;
  };

  return (
    <Card title={title} style={{ width: '100%' }}>
      <PageContentContainer>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            height: '100%',
            width: '100%',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ marginBottom: 16 }}>日历（用于选择学期日历）</h3>
            {renderChildren()}
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {customActions}
            <CalendarOptionsPanel
              selectedDates={selectedDates}
              disabledDates={disabledDates}
              includeWeekends={includeWeekends}
              onIncludeWeekendsChange={setIncludeWeekends}
              onRemoveDate={handleRemoveDate}
              onDisableSelected={handleDisableSelected}
              onEnableSelected={handleEnableSelected}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </PageContentContainer>
    </Card>
  );
};

export { CalendarOptionsPanel, CalendarPageLayout };
