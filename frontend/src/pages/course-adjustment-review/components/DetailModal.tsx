import { Button, Col, Modal, Row, Tag } from 'antd';
import React from 'react';
import type { DetailModalProps } from '../types';

/**
 * 详情弹窗组件
 * 显示调课申请的完整详细信息
 */
const DetailModal: React.FC<DetailModalProps> = ({
  visible,
  record,
  onClose,
}) => {
  if (!record) return null;

  return (
    <Modal
      title="调课申请详情"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
      width={600}
    >
      <div>
        {/* 第一行：申请编号、教师姓名 */}
        <Row gutter={16} style={{ marginBottom: 12 }}>
          <Col span={12}>
            <strong>申请编号：</strong>
            {record.id}
          </Col>
          <Col span={12}>
            <strong>教师姓名：</strong>
            {record.teacherName}
          </Col>
        </Row>

        {/* 第二行：所在院系、紧急程度 */}
        <Row gutter={16} style={{ marginBottom: 12 }}>
          <Col span={12}>
            <strong>所在院系：</strong>
            {record.department}
          </Col>
          <Col span={12}>
            <strong>紧急程度：</strong>
            <Tag color={record.urgency === 'high' ? 'red' : 'blue'}>
              {record.urgency === 'high' ? '紧急' : '一般'}
            </Tag>
          </Col>
        </Row>

        {/* 第三行：原课程、调整后 */}
        <Row gutter={16} style={{ marginBottom: 12 }}>
          <Col span={12}>
            <strong>原课程：</strong>
            {record.originalCourse}
          </Col>
          <Col span={12}>
            <strong>调整后：</strong>
            {record.targetCourse}
          </Col>
        </Row>

        {/* 第四行：申请时间 */}
        <Row gutter={16} style={{ marginBottom: 12 }}>
          <Col span={24}>
            <strong>申请时间：</strong>
            {record.applyTime}
          </Col>
        </Row>

        {/* 第五行：调课原因 */}
        <Row gutter={16} style={{ marginBottom: 12 }}>
          <Col span={24}>
            <strong>调课原因：</strong>
            <div
              style={{
                background: '#f5f5f5',
                padding: 12,
                marginTop: 8,
                borderRadius: 4,
              }}
            >
              {record.reason}
            </div>
          </Col>
        </Row>

        {/* 审核意见（如果有） */}
        {record.reviewComment && (
          <Row gutter={16}>
            <Col span={24}>
              <strong>审核意见：</strong>
              <div
                style={{
                  background: '#e6f7ff',
                  padding: 12,
                  marginTop: 8,
                  borderRadius: 4,
                }}
              >
                {record.reviewComment}
              </div>
            </Col>
          </Row>
        )}

        {/* 审核人信息（如果有） */}
        {record.reviewerName && (
          <Row gutter={16} style={{ marginTop: 12 }}>
            <Col span={12}>
              <strong>审核人：</strong>
              {record.reviewerName}
            </Col>
            <Col span={12}>
              <strong>审核时间：</strong>
              {record.reviewTime || '-'}
            </Col>
          </Row>
        )}
      </div>
    </Modal>
  );
};

export default DetailModal;
