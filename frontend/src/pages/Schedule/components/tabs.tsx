import { Tabs } from 'antd';
import React from 'react';
import type { MyTabsProps } from '../types';

/**
 * 标签页组件 - 现代化样式
 */
const MyTabs: React.FC<MyTabsProps> = ({
  activeStep = 1,
  onStepChange,
  tabItems,
}) => {
  const activeKey = activeStep.toString();

  const tabBarStyle: React.CSSProperties = {
    marginBottom: 0,
    background: 'transparent',
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <Tabs
        activeKey={activeKey}
        type="card"
        size="large"
        items={tabItems}
        onChange={(key) => {
          onStepChange?.(Number(key));
        }}
        tabBarStyle={tabBarStyle}
        tabBarGutter={8}
      />
    </div>
  );
};

export default MyTabs;
