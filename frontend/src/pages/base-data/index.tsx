/**
 * base-data 模块 - 主页面：基础数据管理
 * 包含 6 个步骤流程：课程录入 -> 课程设置 -> 专业设置 -> 教师录入 -> 学期日历 -> 提交
 */

import { message } from 'antd';
import type { Dayjs } from 'dayjs';
import React, { useCallback, useState } from 'react';

import { type StepCompletion, Stepper } from './components';
import { DEFAULT_STEP_COMPLETION, TOTAL_STEPS } from './constants';
import {
  Step1CourseInput,
  Step2CourseSettings,
  Step3MajorSettings,
  Step4TeacherInput,
  Step5Calendar,
  Step6Submission,
} from './pages';

/**
 * 基础数据管理主页面组件
 * 管理 6 个步骤的导航和状态
 */
const BaseData: React.FC = () => {
  // 当前步骤索引
  const [currentStep, setCurrentStep] = useState(0);
  // 各步骤完成状态
  const [stepCompletion, setStepCompletion] = useState<StepCompletion>(
    DEFAULT_STEP_COMPLETION,
  );

  /** 更新步骤完成状态 */
  const updateStepCompletion = useCallback(
    (step: number, completed: boolean) => {
      setStepCompletion((prev) => ({
        ...prev,
        [step as 0 | 1 | 2 | 3 | 4]: completed,
      }));
    },
    [],
  );

  /** 前进一步：跳转到下一步 */
  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  }, []);

  /** 跳转到指定步骤 */
  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  /** 处理日历提交：保存日历设置并进入下一步 */
  const handleCalendarSubmit = useCallback(
    (data: {
      selected: string[];
      disabled: string[];
      includeWeekends: boolean;
      termStart: Dayjs | null;
      termEnd: Dayjs | null;
    }) => {
      // 验证学期日期
      if (!data.termStart || !data.termEnd) {
        message.warning('请先选择学期开始和结束日期');
        return;
      }

      updateStepCompletion(4, true);
      message.success('学期日历设置已保存！');
      goToNextStep();
    },
    [goToNextStep, updateStepCompletion],
  );

  /** 渲染当前步骤内容 */
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1CourseInput
            onUpdateStatus={() => updateStepCompletion(0, true)}
          />
        );
      case 1:
        return (
          <Step2CourseSettings
            onUpdateStatus={() => updateStepCompletion(1, true)}
          />
        );
      case 2:
        return (
          <Step3MajorSettings
            onUpdateStatus={() => updateStepCompletion(2, true)}
          />
        );
      case 3:
        return (
          <Step4TeacherInput
            onUpdateStatus={() => updateStepCompletion(3, true)}
          />
        );
      case 4:
        return (
          <Step5Calendar
            onUpdateStatus={() => updateStepCompletion(4, true)}
            onSubmit={handleCalendarSubmit}
          />
        );
      case 5:
        return (
          <Step6Submission
            stepCompletion={stepCompletion}
            setStepCompletion={setStepCompletion}
            setCurrentStep={setCurrentStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* 顶部步骤导航区 */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>基础数据管理</h2>
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fafafa',
            borderRadius: '4px',
          }}
        >
          <Stepper currentStep={currentStep} onStepChange={goToStep} />
        </div>
      </div>

      {/* 步骤内容区 */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          margin: 0,
          padding: 0,
        }}
      >
        {renderStepContent()}
      </div>
    </div>
  );
};

export default BaseData;
