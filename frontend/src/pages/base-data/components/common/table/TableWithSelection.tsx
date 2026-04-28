import { Button, Flex, Input, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import React, { useState } from 'react';

export interface TableWithSelectionProps<T extends object = object> {
  columns: ColumnsType<T>;
  dataSource: T[];
  onSelectChange?: (selectedRowKeys: React.Key[]) => void;
  tableTitle?: string;
  onAdd?: () => void;
  onDelete?: (selectedRowKeys: React.Key[]) => void;
  onEdit?: (record: T) => void;
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

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
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
  } as TableProps<T>['rowSelection'];

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
          columns={extendedColumns}
          dataSource={dataSource}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: dataSource.length,
            onChange: handlePageChange,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            position: ['bottomCenter'],
            hideOnSinglePage: dataSource.length <= 10,
          }}
          title={() => tableTitle}
        />
      </div>
    </Flex>
  );
};

export default TableWithSelection;
