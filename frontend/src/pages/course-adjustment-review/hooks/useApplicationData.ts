import { Modal, message } from 'antd';
import type { Key } from 'antd/lib/table/interface';
import { useCallback, useState } from 'react';
import type { CourseAdjustmentRecord, FilterOptions } from '../types';

/**
 * 调课申请数据管理 Hook
 * 管理申请列表、筛选、审核等操作
 */
export const useApplicationData = () => {
  // 申请数据
  const [data, setData] = useState<CourseAdjustmentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 选中行 keys
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  // 筛选条件
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    urgency: 'all',
  });

  // 详情弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<CourseAdjustmentRecord | null>(null);

  // 加载申请列表
  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: 调用实际 API
      // const res = await api.getApplications(filters);
      // if (res.success) {
      //   setData(res.data.list);
      // }

      // 暂时使用模拟数据
      setLoading(false);
    } catch (err) {
      console.error('加载申请列表失败:', err);
      message.error('加载失败');
      setLoading(false);
    }
  }, [filters]);

  // 筛选数据
  const filteredData = useCallback(() => {
    return data.filter((item) => {
      if (filters.status !== 'all' && item.status !== filters.status)
        return false;
      if (filters.urgency !== 'all' && item.urgency !== filters.urgency)
        return false;
      if (filters.department && item.department !== filters.department)
        return false;
      return true;
    });
  }, [data, filters]);

  // 查看详情
  const handleViewDetail = useCallback((record: CourseAdjustmentRecord) => {
    setSelectedRecord(record);
    setModalVisible(true);
  }, []);

  // 关闭详情弹窗
  const handleCloseDetail = useCallback(() => {
    setModalVisible(false);
    setSelectedRecord(null);
  }, []);

  // 处理审核
  const handleReview = useCallback(
    (
      record: CourseAdjustmentRecord,
      status: 'approved' | 'rejected',
      comment: string,
    ) => {
      // 更新状态
      const newData = data.map((item) =>
        item.key === record.key
          ? ({
              ...item,
              status,
              reviewComment: comment,
              reviewTime: new Date().toLocaleString(),
            } as CourseAdjustmentRecord)
          : item,
      );
      setData(newData);
      setModalVisible(false);
      message.success(`申请已${status === 'approved' ? '通过' : '驳回'}`);

      // TODO: 调用实际 API
      // api.reviewApplication({
      //   applicationId: record.id,
      //   status,
      //   reviewComment: comment,
      // });
    },
    [data],
  );

  // 批量审核
  const handleBatchAction = useCallback(
    async (action: 'approve' | 'reject') => {
      if (selectedRowKeys.length === 0) {
        message.warning('请先选择申请记录');
        return;
      }

      Modal.confirm({
        title: `确认批量${action === 'approve' ? '通过' : '驳回'}选中的 ${selectedRowKeys.length} 条申请？`,
        onOk: async () => {
          const newData = data.map((item) =>
            selectedRowKeys.includes(item.key as Key) &&
            item.status === 'pending'
              ? ({
                  ...item,
                  status: action === 'approve' ? 'approved' : 'rejected',
                } as CourseAdjustmentRecord)
              : item,
          );
          setData(newData);
          setSelectedRowKeys([]);
          message.success(`已批量处理 ${selectedRowKeys.length} 条申请`);

          // TODO: 调用实际 API
          // await api.batchReviewApplications({
          //   applicationIds: selectedRowKeys.map((k) => String(k)),
          //   status: action === 'approve' ? 'approved' : 'rejected',
          // });
        },
      });
    },
    [data, selectedRowKeys],
  );

  // 刷新数据
  const refreshData = useCallback(() => {
    loadApplications();
  }, [loadApplications]);

  return {
    // 数据
    data: filteredData(),
    allData: data,
    loading,
    filters,
    selectedRowKeys,
    modalVisible,
    selectedRecord,

    // 状态管理
    setFilters,
    setSelectedRowKeys,
    setModalVisible,
    setSelectedRecord,

    // 方法
    loadApplications,
    refreshData,
    handleViewDetail,
    handleCloseDetail,
    handleReview,
    handleBatchAction,
  };
};
