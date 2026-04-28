import {
  CalendarOutlined,
  DragOutlined,
  SaveOutlined,
  ScheduleOutlined,
  SettingOutlined,
  SyncOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import type { ScheduleToolbarProps } from '../types';

const { Title } = Typography;

const ScheduleToolbar: React.FC<ScheduleToolbarProps> = ({
  totalWeeks,
  hasUnsavedChanges,
  loading,
  showConfigPanel,
  onToggleConfigPanel,
  onUndo,
  onRefresh,
  onSave,
  isMobile: isMobileProp,
}) => {
  const isMobileDetected =
    isMobileProp ||
    (typeof window !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        window.navigator.userAgent,
      ));

  return (
    <Card
      style={{
        marginBottom: isMobileDetected ? 10 : 16,
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
      styles={{
        body: { padding: isMobileDetected ? '12px 16px' : '16px 24px' },
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: isMobileDetected ? 8 : 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobileDetected ? '8px' : '12px',
          }}
        >
          <ScheduleOutlined
            style={{ color: '#1890ff', fontSize: isMobileDetected ? 20 : 24 }}
          />
          <div>
            <Title
              level={isMobileDetected ? 5 : 4}
              style={{ margin: 0, fontSize: isMobileDetected ? 16 : undefined }}
            >
              拖拽课表编辑
            </Title>
            <Space
              size={isMobileDetected ? 'small' : 'middle'}
              style={{ flexWrap: 'wrap' }}
            >
              <Tag
                color="blue"
                style={{ fontSize: isMobileDetected ? 11 : undefined }}
              >
                <DragOutlined /> {isMobileDetected ? '拖拽' : '拖拽编辑'}
              </Tag>
              <Tag
                color="green"
                style={{ fontSize: isMobileDetected ? 11 : undefined }}
              >
                <CalendarOutlined /> 共{totalWeeks}周
              </Tag>
              {hasUnsavedChanges && (
                <Tag
                  color="orange"
                  style={{ fontSize: isMobileDetected ? 11 : undefined }}
                >
                  未保存
                </Tag>
              )}
            </Space>
          </div>
        </div>

        <Space wrap size={isMobileDetected ? 'small' : 'middle'}>
          <Tooltip title="配置时段和可排课时间">
            <Button
              icon={<SettingOutlined />}
              onClick={onToggleConfigPanel}
              size={isMobileDetected ? 'large' : 'middle'}
            >
              {showConfigPanel ? '隐藏配置' : '显示配置'}
            </Button>
          </Tooltip>

          <Tooltip title="撤销更改">
            <Button
              icon={<UndoOutlined />}
              onClick={onUndo}
              disabled={!hasUnsavedChanges}
              size={isMobileDetected ? 'large' : 'middle'}
            >
              撤销
            </Button>
          </Tooltip>

          <Tooltip title="刷新数据">
            <Button
              icon={<SyncOutlined spin={loading} />}
              onClick={onRefresh}
              size={isMobileDetected ? 'large' : 'middle'}
            >
              刷新
            </Button>
          </Tooltip>

          <Tooltip title="保存更改">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={onSave}
              loading={loading}
              disabled={!hasUnsavedChanges}
              size={isMobileDetected ? 'large' : 'middle'}
            >
              保存
            </Button>
          </Tooltip>
        </Space>
      </div>
    </Card>
  );
};

export default ScheduleToolbar;
