/**
 * base-data 模块 - 步骤 6：提交
 * 显示各步骤完成状态，提供最终提交和返回修改功能
 */

import { Button, message } from 'antd';
import React from 'react';
import PageContentContainer from '../../components/PageContentContainer';
import StepStatusPanel, {
  type StepCompletion,
} from '../../components/StepStatusPanel';

/** 组件 Props 接口 */
export interface Step6SubmissionProps {
  /** 各步骤完成状态 */
  stepCompletion: StepCompletion;
  /** 设置步骤完成状态的函数 */
  setStepCompletion: React.Dispatch<React.SetStateAction<StepCompletion>>;
  /** 设置当前步骤的函数 */
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * 提交步骤组件
 * 显示完成状态面板，提供提交和返回修改按钮
 */
const Step6Submission: React.FC<Step6SubmissionProps> = ({
  stepCompletion,
  setStepCompletion,
  setCurrentStep,
}) => {
  // 判断是否所有步骤都已完成
  const allStepsCompleted = Object.values(stepCompletion).every(
    (status) => status,
  );

  /** 处理提交：重置所有步骤状态并返回第一步 */
  const handleSubmit = () => {
    message.success('提交成功！');
    setStepCompletion({
      0: false,
      1: false,
      2: false,
      3: false,
      4: false,
    });
    setCurrentStep(0);
  };

  /** 返回修改：跳转到步骤 4（学期日历） */
  const handleBackToModify = () => {
    setCurrentStep(4);
  };

  return (
    <PageContentContainer>
      <div style={{ padding: '24px' }}>
        {/* 页面标题和说明 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <h2>确认并提交数据</h2>
          <p style={{ color: '#666' }}>
            请检查您输入的所有基础数据，确认无误后即可提交
          </p>
        </div>

        {/* 步骤状态面板 */}
        <StepStatusPanel stepCompletion={stepCompletion} />

        {/* 操作按钮区域 */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              size="large"
              disabled={!allStepsCompleted}
              style={{ marginRight: '16px', minWidth: '120px' }}
              onClick={handleSubmit}
            >
              确认提交
            </Button>
            <Button
              size="large"
              style={{ minWidth: '120px' }}
              onClick={handleBackToModify}
            >
              返回修改
            </Button>
          </div>
          <p style={{ color: '#999' }}>
            提交后，管理员将进行审核，审核通过后数据正式生效
          </p>
        </div>
      </div>
    </PageContentContainer>
  );
};

export default Step6Submission;
