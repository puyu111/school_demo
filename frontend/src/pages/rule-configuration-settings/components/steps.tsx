import { LoadingOutlined } from '@ant-design/icons';
import { Steps } from 'antd';
import React from 'react';
import { STEP_CONFIG } from '../constants';
import type { StepsComponentProps } from '../types';

const StepsComponent: React.FC<StepsComponentProps> = ({
  current = 0,
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
          <LoadingOutlined key={`icon-${step.title}`} />
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

  return <Steps current={displayCurrent} items={generateStepsItems()} />;
};

export default StepsComponent;
