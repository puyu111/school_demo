import {
  LoadingOutlined,
  SmileOutlined,
  SolutionOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { StepsProps } from 'antd';
import { Steps } from 'antd';
import React from 'react';

export interface StepperProps {
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ currentStep = 0, onStepChange }) => {
  const [loadingStep, setLoadingStep] = React.useState<number | null>(null);

  const handleStepClick: StepsProps['onChange'] = (step) => {
    console.log('点击步骤:', step);
    // 点击时设为加载状态
    setLoadingStep(step);
    onStepChange?.(step);
  };

  // 当父组件更新 currentStep 且与 loadingStep 相同时，认为内容已加载，清除加载状态
  React.useEffect(() => {
    if (loadingStep !== null && loadingStep === currentStep) {
      const t = setTimeout(() => setLoadingStep(null), 200);
      return () => clearTimeout(t);
    }
    // 如果 currentStep 与 loadingStep 不一致，则不自动清除 loadingStep（仍显示加载）
    return undefined;
  }, [currentStep, loadingStep]);

  const defaultIcons = [
    <UserOutlined key="0" />,
    <SolutionOutlined key="1" />,
    <UserOutlined key="2" />,
    <SmileOutlined key="3" />,
    <SolutionOutlined key="4" />,
    <UserOutlined key="5" />,
  ];

  const items: StepsProps['items'] = [
    {
      title: '课程录入',
      status:
        currentStep > 0 ? 'finish' : currentStep === 0 ? 'process' : 'wait',
      icon: loadingStep === 0 ? <LoadingOutlined spin /> : defaultIcons[0],
    },
    {
      title: '课程设置',
      status:
        currentStep > 1 ? 'finish' : currentStep === 1 ? 'process' : 'wait',
      icon: loadingStep === 1 ? <LoadingOutlined spin /> : defaultIcons[1],
    },
    {
      title: '专业设置',
      status:
        currentStep > 2 ? 'finish' : currentStep === 2 ? 'process' : 'wait',
      icon: loadingStep === 2 ? <LoadingOutlined spin /> : defaultIcons[2],
    },
    {
      title: '教师录入',
      status:
        currentStep > 3 ? 'finish' : currentStep === 3 ? 'process' : 'wait',
      icon: loadingStep === 3 ? <LoadingOutlined spin /> : defaultIcons[3],
    },
    {
      title: '学期日历',
      status:
        currentStep > 4 ? 'finish' : currentStep === 4 ? 'process' : 'wait',
      icon: loadingStep === 4 ? <LoadingOutlined spin /> : defaultIcons[4],
    },
    {
      title: '提交',
      status:
        currentStep >= 5 ? 'finish' : currentStep === 5 ? 'process' : 'wait',
      icon: loadingStep === 5 ? <LoadingOutlined spin /> : defaultIcons[5],
    },
  ];

  return (
    <Steps current={currentStep} items={items} onChange={handleStepClick} />
  );
};

export default Stepper;
