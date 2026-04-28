/**
 * base-data 模块 - 带选择功能的表格组件
 * 支持行选择、批量操作、搜索、分页等功能
 */

import { Button, Flex, Input, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { useState } from 'react';
import { log } from '../../utils';

/** 组件 Props 接口 */
export interface TableWithSelectionProps<T extends object = object> {
  /** 表格列配置 */
  columns: ColumnsType<T>;
  /** 表格数据源 */
  dataSource: T[];
  /** 数据总数（用于后端分页） */
  total?: number;
  /** 行选择变化回调 */
  onSelectChange?: (selectedRowKeys: React.Key[]) => void;
  /** 表格标题 */
  tableTitle?: string;
  /** 新建按钮点击回调 */
  onAdd?: () => void;
  /** 删除按钮点击回调 */
  onDelete?: (selectedRowKeys: React.Key[]) => void;
  /** 编辑按钮点击回调 */
  onEdit?: (record: T) => void;
  /** 批量导入按钮点击回调 */
  onBatchImport?: () => void;
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 搜索回调 */
  onSearch?: (value: string) => void;
  /** 提交按钮点击回调 */
  onSubmit?: () => void;
}

/**
 * 带选择功能的表格组件
 * 提供行选择、批量操作、搜索、分页等完整表格功能
 */
const TableWithSelection = <T extends { key?: React.Key } = object>({
  columns,
  dataSource,
  total,
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
  // 当前选中的行键值
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // 当前页码
  const [currentPage, setCurrentPage] = useState<number>(1);
  // 每页显示条数
  const [pageSize, setPageSize] = useState<number>(10);

  /** 处理页码变化 */
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  /** 处理行选择变化 */
  const handleOnSelectChange = (newSelectedRowKeys: React.Key[]) => {
    log.debug('CommonTable', 'selectedRowKeys changed:', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
    onSelectChange?.(newSelectedRowKeys);
  };

  /** 全选 */
  const selectAll = () => {
    const keys = dataSource.map(
      (item) => (item as { key?: React.Key }).key as React.Key,
    );
    setSelectedRowKeys(keys);
    onSelectChange?.(keys);
  };

  /** 全不选 */
  const selectNone = () => {
    setSelectedRowKeys([]);
    onSelectChange?.([]);
  };

  /** 反选 */
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

  /** 选择奇数行 */
  const selectOddRows = () => {
    const oddKeys = dataSource
      .filter((_, index) => (index + 1) % 2 === 1)
      .map((item) => (item as { key?: React.Key }).key as React.Key);
    setSelectedRowKeys(oddKeys);
    onSelectChange?.(oddKeys);
  };

  /** 选择偶数行 */
  const selectEvenRows = () => {
    const evenKeys = dataSource
      .filter((_, index) => (index + 1) % 2 === 0)
      .map((item) => (item as { key?: React.Key }).key as React.Key);
    setSelectedRowKeys(evenKeys);
    onSelectChange?.(evenKeys);
  };

  // 行选择配置
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
  } as TableProps<T>['rowSelection'];

  // 是否有已选中的行
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
      {/* 顶部操作栏 */}
      <div
        style={{
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingTop: '24px',
        }}
      >
        <Flex align="center" justify="space-between">
          {/* 左侧操作按钮 */}
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
          {/* 搜索框 */}
          <Input.Search
            placeholder={searchPlaceholder}
            onSearch={onSearch}
            style={{ width: 300 }}
          />
          {/* 提交按钮 */}
          <Button
            type="primary"
            disabled={dataSource.length === 0}
            onClick={onSubmit}
          >
            提交数据
          </Button>
        </Flex>
      </div>

      {/* 表格区域 */}
      <div style={{ padding: '24px', background: '#fff', borderRadius: '4px' }}>
        <Table<T>
          rowSelection={rowSelection}
          columns={extendedColumns}
          dataSource={dataSource}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total ?? dataSource.length,
            onChange: handlePageChange,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            position: ['bottomCenter'],
            hideOnSinglePage: (total ?? dataSource.length) <= 10,
          }}
          title={() => tableTitle}
        />
      </div>
    </Flex>
  );
};

export default TableWithSelection;
