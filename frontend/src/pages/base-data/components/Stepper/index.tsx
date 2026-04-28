/**
 * base-data 模块 - 步骤条组件
 * 显示基础数据管理的 6 个步骤流程
 */

import {
  LoadingOutlined,
  SmileOutlined,
  SolutionOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { StepsProps } from 'antd';
import { Steps } from 'antd';
import React, { useEffect } from 'react';
import { BASE_DATA_STEPS } from '../../constants';

/** 组件 Props 接口 */
export interface StepperProps {
  /** 当前步骤索引 */
  currentStep?: number;
  /** 步骤切换回调 */
  onStepChange?: (step: number) => void;
}

/**
 * 步骤条组件
 * 显示 6 个步骤的进度，支持点击切换步骤
 */
const Stepper: React.FC<StepperProps> = ({ currentStep = 0, onStepChange }) => {
  // 记录正在加载的步骤（点击切换时显示 loading 状态）
  const [loadingStep, setLoadingStep] = React.useState<number | null>(null);

  /** 处理步骤点击 */
  const handleStepClick: StepsProps['onChange'] = (step) => {
    console.log('点击步骤:', step);
    setLoadingStep(step);
    onStepChange?.(step);
  };

  // 步骤切换完成后清除 loading 状态
  useEffect(() => {
    if (loadingStep !== null && loadingStep === currentStep) {
      const t = setTimeout(() => setLoadingStep(null), 200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [currentStep, loadingStep]);

  // 默认步骤图标
  const defaultIcons = [
    <UserOutlined key="icon-0" />,
    <SolutionOutlined key="icon-1" />,
    <UserOutlined key="icon-2" />,
    <SmileOutlined key="icon-3" />,
    <SolutionOutlined key="icon-4" />,
    <UserOutlined key="icon-5" />,
  ];

  // 构建步骤项配置
  const items: StepsProps['items'] = BASE_DATA_STEPS.map((step, index) => ({
    title: step.title,
    status:
      currentStep > index
        ? 'finish' // 已完成的步骤
        : currentStep === index
          ? 'process' // 当前步骤
          : 'wait', // 待处理的步骤
    icon:
      loadingStep === index ? <LoadingOutlined spin /> : defaultIcons[index],
  }));

  return (
    <Steps current={currentStep} items={items} onChange={handleStepClick} />
  );
};

export default Stepper;
