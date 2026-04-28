/**
 * base-data 模块 - 页面内容容器组件
 * 提供统一的页面内容区域包装
 */

import React from 'react';

/** 组件 Props 接口 */
export interface PageContentContainerProps {
  /** 子节点内容 */
  children: React.ReactNode;
}

/**
 * 页面内容容器组件
 * 为页面内容提供统一的最小高度和宽度设置
 */
const PageContentContainer: React.FC<PageContentContainerProps> = ({
  children,
}) => {
  return (
    <div
      style={{
        minHeight: '600px',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default PageContentContainer;
