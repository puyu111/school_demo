import { Tabs } from 'antd';
import React from 'react';
import type { MyTabsProps, TabItem } from '../types';
import TeacherAvailableTime from './teacher-available-time';
import RuleWeightManagement from './weight-management/index';

const MyTabs: React.FC<MyTabsProps> = ({
  activeStep = 1,
  onStepChange,
  tabItems,
}) => {
  // 默认 tab 配置
  const defaultTabItems: TabItem[] = [
    {
      label: '教师不可用时间',
      key: '1',
      children: <TeacherAvailableTime />,
    },
    {
      label: '权重管理',
      key: '2',
      children: <RuleWeightManagement />,
    },
  ];

  const items = tabItems || defaultTabItems;
  const activeKey = activeStep.toString();

  return (
    <div style={{ padding: 24 }}>
      <Tabs
        style={{ margin: '10.8px', backgroundColor: '#ffffff' }}
        activeKey={activeKey}
        type="card"
        size="middle"
        items={items}
        onChange={(key) => {
          onStepChange?.(Number(key));
        }}
      />
    </div>
  );
};

export default MyTabs;
