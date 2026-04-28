import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  RedoOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Alert, Button, Divider, List, Space, Tag, Typography } from 'antd';
import React from 'react';

const { Text, Paragraph } = Typography;

const SchedulePanel = ({
  onAutoSchedule,
  onClearAll,
  onReset,
  selectedCourse,
  pendingCount,
  recommendations,
}) => {
  return (
    <div>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <h4>智能排课</h4>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={onAutoSchedule}
            block
          >
            一键智能排课
          </Button>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <div>
          <h4>操作选项</h4>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Button
              icon={<CloseCircleOutlined />}
              onClick={onClearAll}
              danger
              block
            >
              清空所有排课
            </Button>
            <Button icon={<RedoOutlined />} onClick={onReset} block>
              重置数据
            </Button>
          </Space>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <div>
          <h4>课程统计</h4>
          <div style={{ padding: '8px 0' }}>
            <Paragraph>
              <CheckCircleOutlined /> 待排课程:{' '}
              <Text strong>{pendingCount}</Text> 门
            </Paragraph>
          </div>
        </div>

        {selectedCourse && (
          <div>
            <h4>当前选中</h4>
            <div
              style={{
                padding: '8px',
                background: '#f9f9f9',
                borderRadius: '4px',
              }}
            >
              <Text strong>{selectedCourse.name}</Text>
              <div style={{ marginTop: '4px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {selectedCourse.teacherName} | {selectedCourse.className}
                </Text>
              </div>
            </div>
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div>
            <h4>推荐时间</h4>
            <List
              size="small"
              dataSource={recommendations.slice(0, 3)}
              renderItem={(rec, _index) => (
                <List.Item style={{ padding: '4px 0' }}>
                  <Tag color="blue">
                    {rec.day
                      .replace(/([a-z])/g, (m) => m.toUpperCase())
                      .replace('day', '')}
                    {` 第${rec.slot}节`}
                  </Tag>
                  <Text
                    type="secondary"
                    style={{ fontSize: '12px', marginLeft: '8px' }}
                  >
                    {rec.reason}
                  </Text>
                </List.Item>
              )}
            />
          </div>
        )}

        <Alert
          message="提示"
          description={
            <div style={{ fontSize: '12px' }}>
              <div>• 从左侧选择课程后，点击课表单元格进行安排</div>
              <div>• 点击已排课程可移除</div>
              <div>• 优先安排高优先级课程</div>
            </div>
          }
          type="info"
          showIcon
        />
      </Space>
    </div>
  );
};

export default SchedulePanel;
