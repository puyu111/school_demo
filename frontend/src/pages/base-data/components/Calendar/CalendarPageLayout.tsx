/**
 * base-data 模块 - 日历页面布局组件
 * 提供日历页面的整体布局结构
 */

import { Card } from 'antd';
import React from 'react';
import PageContentContainer from '../PageContentContainer';

/** 组件 Props 接口 */
export interface CalendarPageLayoutProps {
  /** 页面标题 */
  title?: string;
  /** 子节点内容 */
  children?: React.ReactNode;
  /** 初始禁用日期列表（未使用，保留用于兼容） */
  initialDisabledDates?: string[];
  /** 初始是否包含周末（未使用，保留用于兼容） */
  initialIncludeWeekends?: boolean;
}

/**
 * 日历页面布局组件
 * 包裹日历组件和内容区域，提供统一的页面样式
 */
const CalendarPageLayout: React.FC<CalendarPageLayoutProps> = ({
  title = '学期日历',
  children,
}) => {
  return (
    <Card title={title} style={{ width: '100%' }}>
      <PageContentContainer>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            height: '100%',
            width: '100%',
          }}
        >
          {children}
        </div>
      </PageContentContainer>
    </Card>
  );
};

export default CalendarPageLayout;
