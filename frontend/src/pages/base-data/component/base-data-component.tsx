import {
  LoadingOutlined,
  SmileOutlined,
  SolutionOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { CalendarProps, StepsProps } from 'antd';
import {
  Button,
  Calendar,
  Card,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  message,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Upload,
} from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import zhCN from 'antd/locale/zh_CN';
import type { Dayjs } from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';

// 定义节假日接口
interface Holiday {
  date: string; // 格式 YYYY-MM-DD
  name?: string;
}

// 2026年中国节假日数据
export const CHINA_HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-01', name: '元旦' },
  { date: '2026-01-02', name: '休' },
  { date: '2026-01-03', name: '休' },
  { date: '2026-02-11', name: '春节' },
  { date: '2026-02-12', name: '休' },
  { date: '2026-02-13', name: '休' },
  { date: '2026-02-14', name: '休' },
  { date: '2026-02-15', name: '休' },
  { date: '2026-02-16', name: '休' },
  { date: '2026-02-17', name: '休' },
  { date: '2026-04-04', name: '清明节' },
  { date: '2026-04-05', name: '休' },
  { date: '2026-04-06', name: '休' },
  { date: '2026-05-01', name: '劳动节' },
  { date: '2026-05-02', name: '休' },
  { date: '2026-05-03', name: '休' },
  { date: '2026-05-04', name: '休' },
  { date: '2026-05-05', name: '休' },
  { date: '2026-06-09', name: '端午节' },
  { date: '2026-06-10', name: '休' },
  { date: '2026-06-11', name: '休' },
  { date: '2026-09-15', name: '中秋节' },
  { date: '2026-09-16', name: '休' },
  { date: '2026-09-17', name: '休' },
  { date: '2026-10-01', name: '国庆节' },
  { date: '2026-10-02', name: '休' },
  { date: '2026-10-03', name: '休' },
  { date: '2026-10-04', name: '休' },
  { date: '2026-10-05', name: '休' },
  { date: '2026-10-06', name: '休' },

  { date: '2026-10-07', name: '休' },
];

// 子组件1: 高级日历组件（支持禁用日期和节假日展示）
export interface CalendarComponentProps {
  disabledDates?: string[]; // YYYY-MM-DD
  holidays?: Holiday[];
  disableWeekends?: boolean;
  selectedDates?: string[]; // 多选日期，格式 YYYY-MM-DD
  onDateSelect?: (date: string) => void; // 单个日期点击回调
  onPanelChange?: (date: Dayjs) => void; // 日历面板变化回调
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  disabledDates = [],
  holidays = [],
  disableWeekends = false,
  selectedDates = [],
  onDateSelect,
  onPanelChange,
}) => {
  const handlePanelChange = (
    value: Dayjs,
    mode: CalendarProps<Dayjs>['mode'],
  ) => {
    console.log(value.format('YYYY-MM-DD'), mode);
    onPanelChange?.(value);
  };

  const _isDateDisabled = (value: Dayjs) => {
    const d = value.format('YYYY-MM-DD');
    if (disabledDates.includes(d)) return true;
    if (disableWeekends) {
      const wd = value.day(); // 0 Sunday, 6 Saturday
      if (wd === 0 || wd === 6) return true;
    }
    return false;
  };

  const findHoliday = React.useCallback(
    (value: Dayjs) => {
      const d = value.format('YYYY-MM-DD');
      return holidays.find((h) => h.date === d);
    },
    [holidays],
  );

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const isSelected = selectedDates.includes(dateStr);
    const isWeekend = [0, 6].includes(value.day());
    const isDisabled =
      disabledDates.includes(dateStr) || (disableWeekends && isWeekend);
    const holiday = findHoliday(value);

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
        onClick={() => {
          onDateSelect?.(dateStr);
        }}
      >
        {/* 覆盖层用于显示选中和禁用状态，但位于日期数字下方 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0, // 确保覆盖层在日期数字下方
            cursor: 'pointer',
            borderRadius: '4px',
            ...(isSelected && !isDisabled
              ? {
                  backgroundColor: 'rgba(24, 144, 255, 0.2)', // 选中的非禁用日期
                }
              : isSelected && isDisabled
                ? {
                    // 被选中的禁用日期
                    backgroundColor: 'rgba(255, 100, 100, 0.4)', // 选中的禁用日期
                    border: '2px solid rgba(24, 144, 255, 0.8)', // 添加蓝色边框以突出选中状态
                  }
                : isDisabled
                  ? {
                      backgroundColor: 'rgba(252, 214, 218, 0.8)', // 禁用日期使用浅红色
                      opacity: 0.8,
                    }
                  : {}),
          }}
        />
        {/* 节假日标签显示在最顶层 */}
        {holiday && (
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              fontSize: '10px',
              color: '#f5222d',
              marginTop: '2px',
            }}
          >
            {holiday.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Calendar
        onPanelChange={handlePanelChange}
        dateCellRender={dateCellRender}
        mode={'month'} // 明确指定日历模式
        disabledDate={(_date) => {
          // 返回false以允许所有日期被点击，即使它们被标记为"禁用"
          return false;
        }}
      />
    </ConfigProvider>
  );
};

// 子组件2: 步骤条组件
export interface StepperProps {
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ currentStep = 0, onStepChange }) => {
  const [loadingStep, setLoadingStep] = React.useState<number | null>(null);

  const handleStepClick: StepsProps['onChange'] = (step) => {
    console.log('点击步骤:', step);
    // 点击时设为加载状态
    setLoadingStep(step);
    onStepChange?.(step);
  };

  // 当父组件更新 currentStep 且与 loadingStep 相同时，认为内容已加载，清除加载状态
  React.useEffect(() => {
    if (loadingStep !== null && loadingStep === currentStep) {
      const t = setTimeout(() => setLoadingStep(null), 200);
      return () => clearTimeout(t);
    }
    // 如果 currentStep 与 loadingStep 不一致，则不自动清除 loadingStep（仍显示加载）
    return undefined;
  }, [currentStep, loadingStep]);

  const defaultIcons = [
    <UserOutlined key="icon-0" />,
    <SolutionOutlined key="icon-1" />,
    <UserOutlined key="icon-2" />,
    <SmileOutlined key="icon-3" />,
    <SolutionOutlined key="icon-4" />,
    <UserOutlined key="icon-5" />,
  ];

  const items: StepsProps['items'] = [
    {
      title: '课程录入',
      status:
        currentStep > 0 ? 'finish' : currentStep === 0 ? 'process' : 'wait',
      icon: loadingStep === 0 ? <LoadingOutlined spin /> : defaultIcons[0],
    },
    {
      title: '课程设置',
      status:
        currentStep > 1 ? 'finish' : currentStep === 1 ? 'process' : 'wait',
      icon: loadingStep === 1 ? <LoadingOutlined spin /> : defaultIcons[1],
    },
    {
      title: '专业设置',
      status:
        currentStep > 2 ? 'finish' : currentStep === 2 ? 'process' : 'wait',
      icon: loadingStep === 2 ? <LoadingOutlined spin /> : defaultIcons[2],
    },
    {
      title: '教师录入',
      status:
        currentStep > 3 ? 'finish' : currentStep === 3 ? 'process' : 'wait',
      icon: loadingStep === 3 ? <LoadingOutlined spin /> : defaultIcons[3],
    },
    {
      title: '学期日历',
      status:
        currentStep > 4 ? 'finish' : currentStep === 4 ? 'process' : 'wait',
      icon: loadingStep === 4 ? <LoadingOutlined spin /> : defaultIcons[4],
    },
    {
      title: '提交',
      status:
        currentStep >= 5 ? 'finish' : currentStep === 5 ? 'process' : 'wait',
      icon: loadingStep === 5 ? <LoadingOutlined spin /> : defaultIcons[5],
    },
  ];

  return (
    <Steps current={currentStep} items={items} onChange={handleStepClick} />
  );
};

// 通用页面内容容器组件
export interface PageContentContainerProps {
  children: React.ReactNode;
}

const PageContentContainer: React.FC<PageContentContainerProps> = ({
  children,
}) => {
  return (
    <div
      style={{
        padding: '8px', // 从 16px 减少到 8px
        minHeight: '600px',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// 通用空页面组件
export interface EmptyPageProps {
  title?: string;
  description?: string;
}

const EmptyPage: React.FC<EmptyPageProps> = ({
  title = '功能待开发...',
  description = '此功能正在开发中，敬请期待...',
}) => {
  return (
    <Card title={title} style={{ width: '100%' }}>
      <div
        style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          minHeight: '600px',
        }}
      >
        <div
          style={{
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#888', fontWeight: 'normal' }}>{title}</h3>
            {description && (
              <p style={{ color: '#aaa', marginTop: '8px' }}>{description}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// 日历选项面板组件
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
            <Tag
              key={date}
              closable
              onClose={(e) => {
                e.preventDefault();
                onRemoveDate(date);
              }}
              color={disabledDates.includes(date) ? 'red' : 'blue'}
            >
              {date}
            </Tag>
          ))}
        </div>
        {selectedDates.length === 0 && (
          <p style={{ color: '#ccc' }}>暂无选中日期</p>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <Checkbox
          checked={!includeWeekends}
          onChange={(e) => onIncludeWeekendsChange(!e.target.checked)}
        >
          禁用周末
        </Checkbox>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Button
          type="primary"
          danger
          onClick={onDisableSelected}
          disabled={selectedDates.length === 0}
          style={{ marginBottom: 8, width: '100%' }}
        >
          禁用选中日期
        </Button>
        <Button
          type="default"
          onClick={onEnableSelected}
          disabled={
            selectedDates.filter((d) => disabledDates.includes(d)).length === 0
          }
          style={{ width: '100%' }}
        >
          启用选中日期
        </Button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p>已禁用日期: {disabledDates.length}</p>
      </div>

      <Divider />

      <Button
        type="primary"
        size="large"
        onClick={onSubmit}
        style={{ width: '100%' }}
      >
        保存设置
      </Button>
    </div>
  );
};

// 日期范围选择面板组件
export interface DateRangePanelProps {
  termStart: Dayjs | null;
  termEnd: Dayjs | null;
  onTermStartChange: (date: Dayjs | null) => void;
  onTermEndChange: (date: Dayjs | null) => void;
}

const DateRangePanel: React.FC<DateRangePanelProps> = ({
  termStart,
  termEnd,
  onTermStartChange,
  onTermEndChange,
}) => {
  return (
    <div style={{ marginTop: 16 }}>
      <Space direction="horizontal" style={{ marginBottom: 16 }}>
        <span>学期开始:</span>
        <DatePicker value={termStart} onChange={onTermStartChange} />
        <span style={{ marginLeft: 16 }}>学期结束:</span>
        <DatePicker value={termEnd} onChange={onTermEndChange} />
      </Space>
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

  // 检查children是否为函数类型
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

// 通用表格选择组件
type TableRowSelection<T extends object = object> =
  TableProps<T>['rowSelection'];

// 添加export关键字使类型可以在外部使用
export interface TableWithSelectionProps<T extends object = object> {
  columns: ColumnsType<T>;
  dataSource: T[];
  onSelectChange?: (selectedRowKeys: React.Key[]) => void;
  tableTitle?: string;
  onAdd?: () => void;
  onDelete?: (selectedRowKeys: React.Key[]) => void;
  onEdit?: (record: T) => void; // 添加编辑功能
  onBatchImport?: () => void;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onSubmit?: () => void;
}

const TableWithSelection = <T extends { key?: React.Key } = object>({
  columns,
  dataSource,
  onSelectChange,
  tableTitle = '数据表格',
  onAdd,
  onDelete,
  onEdit,
  onBatchImport = () => {},
  searchPlaceholder = '搜索...',
  onSearch = () => {},
  onSubmit,
}: TableWithSelectionProps<T>) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [_loading, setLoading] = useState(false);

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const _start = () => {
    setLoading(true);
    // ajax request after empty completing
    setTimeout(() => {
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };

  const handleOnSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
    onSelectChange?.(newSelectedRowKeys);
  };

  const selectAll = () => {
    const keys = dataSource.map(
      (item) => (item as { key?: React.Key }).key as React.Key,
    );
    setSelectedRowKeys(keys);
    onSelectChange?.(keys);
  };

  const selectNone = () => {
    setSelectedRowKeys([]);
    onSelectChange?.([]);
  };

  const selectInvert = () => {
    const keys = dataSource.map(
      (item) => (item as { key?: React.Key }).key as React.Key,
    );
    const invertedSelection = keys.filter(
      (key) => !selectedRowKeys.includes(key),
    );
    setSelectedRowKeys(invertedSelection);
    onSelectChange?.(invertedSelection);
  };

  const selectOddRows = () => {
    const oddKeys = dataSource
      .filter((_, index) => (index + 1) % 2 === 1)
      .map((item) => (item as { key?: React.Key }).key as React.Key);
    setSelectedRowKeys(oddKeys);
    onSelectChange?.(oddKeys);
  };

  const selectEvenRows = () => {
    const evenKeys = dataSource
      .filter((_, index) => (index + 1) % 2 === 0)
      .map((item) => (item as { key?: React.Key }).key as React.Key);
    setSelectedRowKeys(evenKeys);
    onSelectChange?.(evenKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: handleOnSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      {
        key: 'odd',
        text: '选择奇数行',
        onSelect: selectOddRows,
      },
      {
        key: 'even',
        text: '选择偶数行',
        onSelect: selectEvenRows,
      },
    ],
  } as TableRowSelection<T>;

  const hasSelected = selectedRowKeys.length > 0;

  // 添加编辑列到表格
  const extendedColumns = onEdit
    ? ([
        ...columns,
        {
          title: '操作',
          key: 'action',
          render: (_: any, record: T) => (
            <Button
              type="link"
              onClick={() => onEdit(record)}
              style={{ padding: 0 }}
            >
              编辑
            </Button>
          ),
        },
      ] as ColumnsType<T>)
    : columns;

  return (
    <Flex gap="middle" vertical>
      <div
        style={{
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingTop: '24px',
        }}
      >
        <Flex align="center" justify="space-between">
          <Flex gap="middle">
            <Button type="primary" onClick={onAdd}>
              新建
            </Button>
            <Button
              danger
              onClick={() => onDelete?.([...selectedRowKeys])}
              disabled={!hasSelected}
            >
              删除
            </Button>
            <Button onClick={onBatchImport}>批量导入</Button>
            <Button onClick={selectAll}>全选</Button>
            <Button onClick={selectNone}>全不选</Button>
            <Button onClick={selectInvert}>反选</Button>
          </Flex>
          <Input.Search
            placeholder={searchPlaceholder}
            onSearch={onSearch}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            disabled={dataSource.length === 0}
            onClick={onSubmit}
          >
            提交数据
          </Button>
        </Flex>
      </div>
      <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
        <Table<T>
          rowSelection={rowSelection}
          columns={extendedColumns} // 使用扩展后的列
          dataSource={dataSource}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: dataSource.length,
            onChange: handlePageChange,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            position: ['bottomCenter'], // 分页控件居中
            hideOnSinglePage: dataSource.length <= 10,
          }}
          title={() => tableTitle}
        />
      </div>
    </Flex>
  );
};

// 通用数据管理组件
export interface CommonDataManagerProps<T = any> {
  // 数据相关
  initialData: T[];
  tableTitle: string;
  columns: any[];
  formFields: {
    name: string;
    label: string;
    type: 'input' | 'select' | 'number' | 'email';
    required?: boolean;
    mode?: 'multiple'; // 添加多选模式支持，仅对 select 类型有效
    options?: { label: string; value: string }[]; // 仅对 select 类型有效
  }[];

  // 国际化
  searchPlaceholder?: string;
  submitButtonText?: string;
  modalTitleNew?: string;
  modalTitleEdit?: string;
  batchImportTitle?: string;
  batchImportFormat?: string;
  batchImportExample?: string;

  // 自定义函数
  validateData?: (formData: any) => string | null | undefined; // 修改返回类型

  // 数据变更回调
  onDataChanged?: (data: T[]) => void;
  onSubmit?: () => void;
}

const CommonDataManager = <T extends { key?: React.Key }>({
  initialData,
  tableTitle,
  columns,
  formFields,
  searchPlaceholder = '请输入关键词进行搜索',
  modalTitleNew = '新建',
  modalTitleEdit = '编辑',
  batchImportTitle = '批量导入',
  batchImportFormat = '请按以下格式准备数据（每行一条记录，用逗号分隔）：',
  batchImportExample = '',
  validateData,
  onDataChanged,
  onSubmit,
}: CommonDataManagerProps<T>) => {
  // 创建一个ref来保存onDataChanged回调
  const onDataChangedRef = useRef(onDataChanged);

  // 在每次渲染时更新ref的值
  useEffect(() => {
    onDataChangedRef.current = onDataChanged;
  }, [onDataChanged]);

  // 状态管理
  const [data, setData] = useState<T[]>(initialData);
  const [_selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [batchInputText, setBatchInputText] = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(data);

  // 数据变化时同步到父组件
  useEffect(() => {
    setFilteredData(data);
    if (onDataChangedRef.current) {
      onDataChangedRef.current(data);
    }
  }, [data]); // 现在只依赖 data，避免无限循环

  // 初始化表单数据
  React.useEffect(() => {
    const initialFormData: Record<string, any> = {};
    formFields.forEach((field) => {
      initialFormData[field.name] = '';
    });
    setFormData(initialFormData);
  }, [formFields]);

  // 处理搜索功能
  const handleSearch = (value: string) => {
    if (!value) {
      setFilteredData(data);
      return;
    }

    // 搜索所有字符串类型的字段
    const filtered = data.filter((item) => {
      const itemValues = Object.values(item).filter(
        (val) => typeof val === 'string',
      );
      return itemValues.some((val) =>
        val.toLowerCase().includes(value.toLowerCase()),
      );
    });

    setFilteredData(filtered);
    message.info(`找到 ${filtered.length} 条匹配的记录`);
  };

  // 新建功能
  const handleAdd = () => {
    const emptyFormData: Record<string, any> = {};
    formFields.forEach((field) => {
      emptyFormData[field.name] = field.type === 'number' ? 0 : '';
    });
    setFormData(emptyFormData);
    setCurrentRecord(null);
    setModalVisible(true);
  };

  // 编辑功能
  const _handleEdit = (record: T) => {
    const recordData: Record<string, any> = { ...(record as any) };
    setFormData(recordData);
    setCurrentRecord(record);
    setModalVisible(true);
  };

  // 保存表单
  const handleSave = () => {
    // 验证必填字段
    if (validateData) {
      const error = validateData(formData);
      if (error) {
        message.error(error);
        return;
      }
    } else {
      // 默认验证：检查所有设置了required=true的字段
      for (const field of formFields) {
        if (
          field.required &&
          (!formData[field.name] || String(formData[field.name]).trim() === '')
        ) {
          message.error(`${field.label} 是必填项`);
          return;
        }
      }
    }

    if (currentRecord) {
      // 编辑现有记录
      setData(
        (prevData) =>
          prevData.map((item) =>
            (item as any).key === (currentRecord as any).key
              ? { ...item, ...formData }
              : item,
          ) as T[],
      );
    } else {
      // 添加新记录
      const newKey =
        Math.max(...data.map((item) => Number((item as any).key)), 0) + 1;
      const newData = [
        ...data,
        {
          key: newKey,
          ...formData,
        },
      ] as T[];
      setData(newData);
      setFilteredData(newData); // 同时更新过滤后的数据
    }

    setModalVisible(false);
    message.success(
      currentRecord ? `${tableTitle}更新成功！` : `${tableTitle}添加成功！`,
    );
  };

  // 删除功能
  const handleDelete = (keysToDelete: React.Key[]) => {
    if (keysToDelete.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }

    const newData = data.filter(
      (item) => !keysToDelete.includes((item as any).key),
    );
    setData(newData);
    setFilteredData(newData);
    setSelectedRowKeys([]);
    message.success('删除成功！');
  };

  // 提交功能
  const handleSubmit = () => {
    if (data.length === 0) {
      message.error('没有数据可提交！');
      return;
    }

    message.success('提交成功！');
    if (onSubmit) {
      onSubmit();
    }
  };

  // 批量导入功能
  const handleBatchImport = () => {
    setBatchInputText('');
    setBatchModalVisible(true);
  };

  // 处理Excel文件上传
  const handleExcelUpload = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const _content = e.target?.result as string;
        message.success('文件上传成功！请确认数据并导入。');
      } catch (_error) {
        message.error('文件解析失败，请上传正确的Excel文件');
      }
    };

    reader.onerror = () => {
      message.error('文件读取失败');
    };

    reader.readAsText(file);
    return false; // 阻止默认上传行为
  };

  // 处理批量导入
  const handleBatchImportConfirm = () => {
    const inputToProcess = batchInputText;

    if (!inputToProcess.trim()) {
      message.error('请输入要导入的数据或上传Excel文件');
      return;
    }

    try {
      // 假设是以逗号分隔的行数据
      const lines = inputToProcess.split('\n').filter((line) => line.trim());

      if (lines.length === 0) {
        message.error('没有有效的数据行');
        return;
      }

      const newRecords = lines.map((line, index) => {
        const parts = line.split(',').map((part) => part.trim());
        if (parts.length < formFields.length) {
          throw new Error(`第${index + 1}行数据格式不正确`);
        }

        const record: Record<string, any> = {};
        formFields.forEach((field, idx) => {
          if (field.type === 'number') {
            record[field.name] = parseInt(parts[idx], 10) || 0;
          } else if (field.type === 'select' && field.mode === 'multiple') {
            // 对于多选字段，按逗号分割值
            record[field.name] = parts[idx]
              .split(',')
              .map((item) => item.trim());
          } else {
            record[field.name] = parts[idx];
          }
        });

        return {
          key:
            Math.max(...data.map((item) => Number((item as any).key)), 0) +
            index +
            1,
          ...record,
        };
      });

      const newData = [...data, ...newRecords] as T[];
      setData(newData);
      setFilteredData(newData);
      setBatchModalVisible(false);
      message.success(`成功导入${newRecords.length}条记录！`);
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : '批量导入失败，请检查数据格式';
      message.error(messageText);
    }
  };

  return (
    <>
      <TableWithSelection
        columns={columns}
        dataSource={filteredData}
        tableTitle={tableTitle}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onBatchImport={handleBatchImport}
        onSearch={handleSearch}
        searchPlaceholder={searchPlaceholder}
        onSubmit={handleSubmit}
        onSelectChange={(selectedKeys) => setSelectedRowKeys(selectedKeys)}
      />

      {/* 新建/编辑模态框 */}
      <Modal
        title={currentRecord ? modalTitleEdit : modalTitleNew}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
      >
        <Form layout="vertical">
          {formFields.map((field, _index) => (
            <Form.Item
              key={field.name}
              label={field.label}
              required={field.required}
            >
              {field.type === 'input' || field.type === 'email' ? (
                <Input
                  type={field.type}
                  value={formData[field.name]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field.name]: e.target.value,
                    })
                  }
                  placeholder={`请输入${field.label}`}
                />
              ) : field.type === 'number' ? (
                <Input
                  type="number"
                  value={formData[field.name]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field.name]: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  placeholder={`请输入${field.label}`}
                />
              ) : field.type === 'select' && field.mode === 'multiple' ? (
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder={`请选择${field.label}`}
                  value={
                    formData[field.name]
                      ? Array.isArray(formData[field.name])
                        ? formData[field.name]
                        : String(formData[field.name]).split(',')
                      : []
                  }
                  onChange={(values) =>
                    setFormData({
                      ...formData,
                      [field.name]: values || [],
                    })
                  }
                  options={field.options}
                />
              ) : field.type === 'select' ? (
                <Select
                  style={{ width: '100%' }}
                  placeholder={`请选择${field.label}`}
                  value={formData[field.name]}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      [field.name]: value,
                    })
                  }
                  options={field.options}
                />
              ) : null}
            </Form.Item>
          ))}
        </Form>
      </Modal>

      {/* 批量导入模态框 */}
      <Modal
        title={batchImportTitle}
        open={batchModalVisible}
        onCancel={() => setBatchModalVisible(false)}
        footer={null}
      >
        <div>
          <p>{batchImportFormat}</p>
          {batchImportExample && (
            <p>
              <strong>示例:</strong> {batchImportExample}
            </p>
          )}

          <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
            <Upload
              beforeUpload={handleExcelUpload}
              accept=".xlsx,.xls,.csv"
              maxCount={1}
              showUploadList={true}
            >
              <Button icon={<UploadOutlined />}>上传Excel文件</Button>
            </Upload>

            <div style={{ margin: '16px 0' }}>
              <p>或者直接粘贴数据：</p>
              <textarea
                rows={8}
                style={{ width: '100%', marginTop: 8 }}
                value={batchInputText}
                onChange={(e) => setBatchInputText(e.target.value)}
                placeholder="粘贴Excel数据或手动输入，每行一条记录，用逗号分隔各字段"
              ></textarea>
            </div>
          </Space>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button
              onClick={() => setBatchModalVisible(false)}
              style={{ marginRight: 8 }}
            >
              取消
            </Button>
            <Button type="primary" onClick={handleBatchImportConfirm}>
              导入
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// 预设数据管理器类型
export type PresetDataManagerType =
  | 'course-input'
  | 'course-settings'
  | 'major-settings'
  | 'teacher-input';

// 预设数据管理组件
export interface PresetDataManagerProps {
  type: PresetDataManagerType;
  onUpdateStatus?: (completed: boolean) => void;
  tableTitle?: string;
  searchPlaceholder?: string;
  initialData?: any[];
}

const PresetDataManager: React.FC<PresetDataManagerProps> = ({
  type,
  onUpdateStatus,
  tableTitle,
  searchPlaceholder,
  initialData,
}) => {
  const [_hasSubmitted, setHasSubmitted] = useState(false); // 跟踪是否已提交
  const [data, setData] = useState<any[]>(initialData || []);

  // 根据类型获取预设配置
  const getPresetConfig = () => {
    switch (type) {
      case 'course-input': {
        const _courseNames = Array.from({ length: 46 }).map(
          (_, i) => `课程 ${i + 1}`,
        );
        const presetInitialData =
          initialData ||
          Array.from({ length: 46 }).map((_, i) => ({
            key: i,
            id: `COURSE${i + 1}`,
            name: `课程 ${i + 1}`,
            credits: Math.floor(Math.random() * 4) + 1,
            type: i % 3 === 0 ? '必修' : i % 3 === 1 ? '选修' : '限选',
            totalHours: Math.floor(Math.random() * 64) + 16,
          }));

        return {
          initialData: presetInitialData,
          tableTitle: tableTitle || '课程录入表',
          searchPlaceholder:
            searchPlaceholder || '请输入课程ID或课程名称进行搜索',
          formFields: [
            {
              name: 'id',
              label: '课程ID',
              type: 'input' as const,
              required: true,
            },
            {
              name: 'name',
              label: '课程名称',
              type: 'input' as const,
              required: true,
            },
            {
              name: 'credits',
              label: '课程学分',
              type: 'number' as const,
              required: true,
            },
            {
              name: 'type',
              label: '课程类型',
              type: 'select' as const,
              required: true,
              options: [
                { label: '必修', value: '必修' },
                { label: '选修', value: '选修' },
                { label: '限选', value: '限选' },
              ],
            },
            {
              name: 'totalHours',
              label: '总课时',
              type: 'number' as const,
              required: true,
            },
          ],
          columns: [
            { title: '课程ID', dataIndex: 'id', key: 'id' },
            { title: '课程名称', dataIndex: 'name', key: 'name' },
            { title: '课程学分', dataIndex: 'credits', key: 'credits' },
            { title: '课程类型', dataIndex: 'type', key: 'type' },
            { title: '总课时', dataIndex: 'totalHours', key: 'totalHours' },
          ],
          validateData: (formData: any) => {
            if (
              !formData.name ||
              !formData.id ||
              !formData.credits ||
              !formData.totalHours
            ) {
              return '请填写所有必填字段';
            }
            return null;
          },
        };
      }

      case 'course-settings': {
        const allCourseNames = Array.from({ length: 20 }).map(
          (_, i) => `课程 ${i + 1}`,
        );
        const presetInitialData =
          initialData ||
          Array.from({ length: 20 }).map((_, i) => ({
            key: i,
            name: `课程 ${i + 1}`,
            priority: (i % 4) + 1,
            prerequisites:
              i > 0 ? allCourseNames.slice(Math.max(0, i - 3), i) : [], // 修改这里：获取前面最多3个课程作为前置课程
            semester: `第${(i % 4) + 1}学期`,
          }));

        // 为表单字段单独定义可选项
        return {
          initialData: presetInitialData,
          tableTitle: tableTitle || '课程设置表',
          searchPlaceholder:
            searchPlaceholder || '请输入课程名称或开设学期进行搜索',
          formFields: [
            {
              name: 'name',
              label: '课程名称',
              type: 'input' as const,
              required: true,
            },
            {
              name: 'priority',
              label: '课程优先等级',
              type: 'number' as const,
              required: true,
            },
            {
              name: 'prerequisites',
              label: '前置课程（可多选）',
              type: 'select' as const,
              required: false,
              mode: 'multiple' as const,
              options: allCourseNames.map((courseName) => ({
                // 允许选择所有先前的课程
                label: courseName,
                value: courseName,
              })),
            },
            {
              name: 'semester',
              label: '开设学期',
              type: 'select' as const,
              required: true,
              options: [
                { label: '第一学期', value: '第一学期' },
                { label: '第二学期', value: '第二学期' },
                { label: '第三学期', value: '第三学期' },
                { label: '第四学期', value: '第四学期' },
              ],
            },
          ],
          columns: [
            { title: '课程名称', dataIndex: 'name', key: 'name' },
            { title: '课程优先等级', dataIndex: 'priority', key: 'priority' },
            {
              title: '前置课程（可多选）',
              dataIndex: 'prerequisites',
              key: 'prerequisites',
              render: (text: string | string[]) => {
                if (!text || (Array.isArray(text) && text.length === 0))
                  return <span>-</span>;

                const prereqs = Array.isArray(text)
                  ? text
                  : typeof text === 'string'
                    ? text.split(',')
                    : [];
                return (
                  <div>
                    {prereqs
                      .filter((prereq) => prereq && prereq.trim() !== '')
                      .map((prereq, index) => (
                        <div key={prereq}>
                          第{index + 1}前置: {prereq.trim()}
                        </div>
                      ))}
                    {prereqs.filter(
                      (prereq: any) => prereq && prereq.trim() !== '',
                    ).length === 0 && <span>-</span>}
                  </div>
                );
              },
            },
            { title: '开设学期', dataIndex: 'semester', key: 'semester' },
          ],
          validateData: (formData: any) => {
            if (!formData.name || !formData.priority || !formData.semester) {
              return '请填写所有必填字段';
            }
            return null;
          },
        };
      }

      case 'major-settings': {
        const availableCourses = [
          '高等数学',
          '线性代数',
          '概率论',
          '大学物理',
          '计算机基础',
          '数据结构',
          '算法设计',
          '软件工程',
          '数据库原理',
          '网络技术',
          '操作系统',
          '编译原理',
          '计算机网络',
          '软件测试',
          '人工智能',
        ];
        const presetInitialData =
          initialData ||
          Array.from({ length: 15 }).map((_, i) => ({
            key: i,
            id: `MAJOR${String(i + 1).padStart(3, '0')}`,
            name: `专业 ${i + 1}`,
            courses: [
              availableCourses[i % availableCourses.length],
              availableCourses[(i + 3) % availableCourses.length],
            ],
            classSize: Math.floor(Math.random() * 10) + 5,
            duration: Math.floor(Math.random() * 2) + 3,
          }));

        return {
          initialData: presetInitialData,
          tableTitle: tableTitle || '专业设置表',
          searchPlaceholder: searchPlaceholder || '请输入专业名称或ID进行搜索',
          formFields: [
            {
              name: 'id',
              label: '专业ID',
              type: 'input' as const,
              required: true,
            },
            {
              name: 'name',
              label: '专业名称',
              type: 'input' as const,
              required: true,
            },
            {
              name: 'courses',
              label: '开设课程（多选）',
              type: 'select' as const,
              required: false,
              mode: 'multiple' as const,
              options: availableCourses.map((course) => ({
                label: course,
                value: course,
              })),
            },
            {
              name: 'classSize',
              label: '班级数',
              type: 'number' as const,
              required: true,
            },
            {
              name: 'duration',
              label: '年制',
              type: 'number' as const,
              required: true,
            },
          ],
          columns: [
            { title: '专业ID', dataIndex: 'id', key: 'id' },
            { title: '专业名称', dataIndex: 'name', key: 'name' },
            {
              title: '开设课程（多选）',
              dataIndex: 'courses',
              key: 'courses',
              render: (text: string[]) => {
                if (!text || text.length === 0) return <span>-</span>;
                return (
                  <div>
                    {text.map((course) => (
                      <div key={course}>{course}</div>
                    ))}
                  </div>
                );
              },
            },
            { title: '班级数', dataIndex: 'classSize', key: 'classSize' },
            { title: '年制', dataIndex: 'duration', key: 'duration' },
          ],
          validateData: (formData: any) => {
            if (
              !formData.id ||
              !formData.name ||
              !formData.classSize ||
              !formData.duration
            ) {
              return '请填写所有必填字段';
            }
            return null;
          },
        };
      }

      case 'teacher-input': {
        const availableCourses = Array.from({ length: 10 }).map(
          (_, i) => `课程 ${i + 1}`,
        );
        const degreeOptions = [
          { label: '专科', value: '专科' },
          { label: '本科', value: '本科' },
          { label: '硕士', value: '硕士' },
          { label: '博士', value: '博士' },
        ];
        const presetInitialData =
          initialData ||
          Array.from({ length: 30 }).map((_, i) => ({
            key: i,
            id: `TCH${String(i + 1).padStart(4, '0')}`,
            name: `教师 ${i + 1}`,
            gender: i % 2 === 0 ? '男' : '女',
            courses:
              i % 2 === 0
                ? [availableCourses[i % 10], availableCourses[(i + 1) % 10]]
                : [availableCourses[i % 10]],
            degree: degreeOptions[i % 4].value,
          }));

        return {
          initialData: presetInitialData,
          tableTitle: tableTitle || '教师录入表',
          searchPlaceholder: searchPlaceholder || '请输入教师姓名或ID进行搜索',
          formFields: [
            {
              name: 'id',
              label: '教师ID',
              type: 'input' as const,
              required: true,
            },
            {
              name: 'name',
              label: '姓名',
              type: 'input' as const,
              required: true,
            },
            {
              name: 'gender',
              label: '性别',
              type: 'select' as const,
              required: true,
              options: [
                { label: '男', value: '男' },
                { label: '女', value: '女' },
              ],
            },
            {
              name: 'courses',
              label: '可授课程（多选）',
              type: 'select' as const,
              required: false,
              mode: 'multiple' as const,
              options: availableCourses.map((course) => ({
                label: course,
                value: course,
              })),
            },
            {
              name: 'degree',
              label: '学历',
              type: 'select' as const,
              required: true,
              options: degreeOptions,
            },
          ],
          columns: [
            { title: '教师ID', dataIndex: 'id', key: 'id' },
            { title: '姓名', dataIndex: 'name', key: 'name' },
            {
              title: '性别',
              dataIndex: 'gender',
              key: 'gender',
              render: (value: string) => value,
            },
            {
              title: '可授课程（多选）',
              dataIndex: 'courses',
              key: 'courses',
              render: (text: string[]) => {
                if (!text || text.length === 0) return <span>-</span>;
                return (
                  <div>
                    {text.map((course) => (
                      <div key={course}>{course}</div>
                    ))}
                  </div>
                );
              },
            },
            { title: '学历', dataIndex: 'degree', key: 'degree' },
          ],
          validateData: (formData: any) => {
            if (
              !formData.id ||
              !formData.name ||
              !formData.gender ||
              !formData.degree
            ) {
              return '请填写所有必填字段';
            }
            return null;
          },
        };
      }

      default:
        throw new Error(`未知的数据管理器类型: ${type}`);
    }
  };

  const config = getPresetConfig();

  useEffect(() => {
    setData(config.initialData);
  }, []); // 只在组件挂载时运行一次

  const handleDataChange = (newData: any[]) => {
    setData(newData);
    // 不再根据数据是否存在来更新状态，而是根据是否已提交
  };

  const handleManagerSubmit = () => {
    if (data.length === 0) {
      message.error('请先添加数据！');
      return;
    }
    setHasSubmitted(true);
    if (onUpdateStatus) {
      onUpdateStatus(true); // 只有点击提交才标记为完成
    }
    message.success(`${config.tableTitle}提交成功！`);
  };

  return (
    <CommonDataManager
      initialData={config.initialData}
      tableTitle={config.tableTitle}
      columns={config.columns}
      formFields={config.formFields}
      searchPlaceholder={config.searchPlaceholder}
      modalTitleNew={
        type === 'course-input'
          ? '新建课程'
          : type === 'course-settings'
            ? '新建课程设置'
            : type === 'major-settings'
              ? '新建专业'
              : '新建教师'
      }
      modalTitleEdit={
        type === 'course-input'
          ? '编辑课程'
          : type === 'course-settings'
            ? '编辑课程设置'
            : type === 'major-settings'
              ? '编辑专业'
              : '编辑教师'
      }
      batchImportExample={
        type === 'course-input'
          ? '高等数学,数学系,64,必修,4'
          : type === 'course-settings'
            ? '课程 1,1,课程 2,课程 3,课程 4,第一学期'
            : // 统一分隔符格式
              type === 'major-settings'
              ? 'MAJOR001,计算机科学与技术,高等数学,数据结构,算法设计,5,4'
              : 'TCH0001,李老师,男,课程 高等数学,课程 线性代数,本科'
      }
      validateData={config.validateData}
      onDataChanged={handleDataChange}
      onSubmit={handleManagerSubmit} // 传递提交处理函数
    />
  );
};

export {
  CalendarComponent,
  Stepper,
  PageContentContainer,
  EmptyPage,
  CalendarOptionsPanel,
  DateRangePanel,
  CalendarPageLayout,
  TableWithSelection,
  CommonDataManager,
  PresetDataManager,
  // 注意：CHINA_HOLIDAYS_2026 已在声明时直接导出，无需在此处重复列出
};
