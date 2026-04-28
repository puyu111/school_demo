import { Card, Modal } from 'antd';
import React, { useState } from 'react';
import {
  ApplicationTable,
  DetailModal,
  FilterBar,
  ReviewForm,
  useApplicationData,
} from './components';
import type { CourseAdjustmentRecord } from './types';

/**
 * 调课申请审核页面
 * 支持查看、筛选、审核调课申请
 */
const CourseAdjustmentReview: React.FC = () => {
  const {
    data,
    loading,
    filters,
    selectedRowKeys,
    modalVisible,
    selectedRecord,
    setFilters,
    setSelectedRowKeys,
    handleCloseDetail,
    handleViewDetail,
    handleReview,
    handleBatchAction,
  } = useApplicationData();

  // 审核弹窗状态
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewingRecord, setReviewingRecord] =
    useState<CourseAdjustmentRecord | null>(null);

  // 打开审核弹窗
  const handleOpenReviewModal = (
    record: CourseAdjustmentRecord,
    _status: 'approved' | 'rejected',
  ) => {
    setReviewingRecord(record);
    setReviewModalVisible(true);
  };

  // 关闭审核弹窗
  const handleCloseReviewModal = () => {
    setReviewModalVisible(false);
    setReviewingRecord(null);
  };

  // 提交审核
  const handleSubmitReview = (
    status: 'approved' | 'rejected',
    comment: string,
  ) => {
    if (reviewingRecord) {
      handleReview(reviewingRecord, status, comment);
      handleCloseReviewModal();
    }
  };

  // 表格行审核点击
  const handleTableReview = (
    record: CourseAdjustmentRecord,
    status: 'approved' | 'rejected',
  ) => {
    handleOpenReviewModal(record, status);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 头部筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          onBatchAction={handleBatchAction}
          selectedCount={selectedRowKeys.length}
        />
      </Card>

      {/* 申请表格 */}
      <Card>
        <ApplicationTable
          data={data}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={setSelectedRowKeys}
          onViewDetail={handleViewDetail}
          onReview={handleTableReview}
          loading={loading}
        />
      </Card>

      {/* 详情弹窗 */}
      <DetailModal
        visible={modalVisible}
        record={selectedRecord}
        onClose={handleCloseDetail}
      />

      {/* 审核弹窗 */}
      <Modal
        title="审核调课申请"
        open={reviewModalVisible}
        onCancel={handleCloseReviewModal}
        footer={null}
        width={600}
      >
        {reviewingRecord && (
          <ReviewForm
            record={reviewingRecord}
            onSubmit={handleSubmitReview}
            onCancel={handleCloseReviewModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default CourseAdjustmentReview;
