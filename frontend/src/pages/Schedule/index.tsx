import { BarChartOutlined, ScheduleOutlined } from '@ant-design/icons';
import React from 'react';
import {
  CourseSchedulePreview,
  CourseSchedulingStatistics,
  MyTabs,
  StepsComponent,
} from './components';
import { useSteps } from './hooks/useSchedule';
import type { TabItem } from './types';

/**
 * 课表管理页面
 * 包含两个主要功能：
 * 1. 课表预览 - 查看和编辑课程安排
 * 2. 排课统计 - 查看和分析排课统计数据
 */
const Schedule: React.FC = () => {
  const { activeStep, handleStepChange } = useSteps(1);

  const tabItems: TabItem[] = [
    {
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ScheduleOutlined />
          课表预览
        </span>
      ),
      key: '1',
      children: <CourseSchedulePreview />,
    },
    {
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChartOutlined />
          排课统计
        </span>
      ),
      key: '2',
      children: <CourseSchedulingStatistics />,
    },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #F7F9FC 0%, #F0F2F5 100%)',
        minHeight: 'calc(100vh - 64px)',
        paddingBottom: '24px',
      }}
    >
      {/* 页面标题 */}
      <div
        style={{
          padding: '24px 24px 0',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            }}
          >
            <ScheduleOutlined style={{ color: '#fff', fontSize: '20px' }} />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              课表管理系统
            </h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: '#666',
              }}
            >
              可视化课程安排与数据分析
            </p>
          </div>
        </div>
      </div>

      {/* 步骤条 */}
      <div
        style={{
          maxWidth: '600px',
          marginLeft: '24px',
          marginBottom: '20px',
          padding: '16px 24px',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <StepsComponent current={activeStep} />
      </div>

      {/* 标签页 */}
      <div
        style={{
          margin: '0 16px',
        }}
      >
        <MyTabs
          activeStep={activeStep}
          onStepChange={handleStepChange}
          tabItems={tabItems}
        />
      </div>
    </div>
  );
};

export default Schedule;
