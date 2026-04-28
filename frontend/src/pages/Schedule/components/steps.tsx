import { CheckCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { Steps } from 'antd';
import React from 'react';
import { STEP_CONFIG } from '../constants';
import type { StepsComponentProps } from '../types';

/**
 * 步骤条组件 - 现代化样式
 */
const StepsComponent: React.FC<StepsComponentProps> = ({
  current = 1,
  items,
}) => {
  const displayCurrent = current - 1;

  // 动态生成步骤项
  const generateStepsItems = () => {
    if (items) {
      return items;
    }

    return STEP_CONFIG.map((step, index) => {
      let status: 'wait' | 'process' | 'finish' | 'error' = 'wait';

      if (index < displayCurrent) {
        status = 'finish';
      } else if (index === displayCurrent) {
        status = 'process';
      } else {
        status = 'wait';
      }

      const icon =
        index === displayCurrent ? (
          <LoadingOutlined
            key={`icon-${step.title}`}
            style={{ fontSize: '20px' }}
          />
        ) : status === 'finish' ? (
          <CheckCircleFilled
            key={`icon-${step.title}`}
            style={{ fontSize: '18px', color: '#52c41a' }}
          />
        ) : (
          step.icon
        );

      return {
        ...step,
        icon,
        status,
      };
    });
  };

  return (
    <Steps
      current={displayCurrent}
      items={generateStepsItems()}
      size="small"
      progressDot
    />
  );
};

export default StepsComponent;
