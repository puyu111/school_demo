import { Button, message } from 'antd';
import React from 'react';
import StepStatusPanel from './component/StepStatusPanel';

interface SubmissionPageProps {
  stepCompletion: {
    0: boolean;
    1: boolean;
    2: boolean;
    3: boolean;
    4: boolean;
  };
  setStepCompletion: React.Dispatch<
    React.SetStateAction<{
      0: boolean;
      1: boolean;
      2: boolean;
      3: boolean;
      4: boolean;
    }>
  >;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const SubmissionPage: React.FC<SubmissionPageProps> = ({
  stepCompletion,
  setStepCompletion,
  setCurrentStep,
}) => {
  const allStepsCompleted = Object.values(stepCompletion).every(
    (status) => status,
  );

  return (
    <div
      style={{
        padding: '24px',
      }}
    >
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

      <StepStatusPanel stepCompletion={stepCompletion} />

      <div
        style={{
          textAlign: 'center',
          marginTop: '24px',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Button
            type="primary"
            size="large"
            disabled={!allStepsCompleted}
            style={{ marginRight: '16px', minWidth: '120px' }}
            onClick={() => {
              // 实际提交逻辑
              message.success('提交成功！');
              // 重置所有步骤状态
              setStepCompletion({
                0: false,
                1: false,
                2: false,
                3: false,
                4: false,
              });
              // 跳转到第一步
              setCurrentStep(0);
              // 这里可以添加实际的数据提交逻辑
            }}
          >
            确认提交
          </Button>
          <Button
            size="large"
            style={{ minWidth: '120px' }}
            onClick={() => setCurrentStep(4)}
          >
            返回修改
          </Button>
        </div>
        <p style={{ color: '#999' }}>
          提交后，管理员将进行审核，审核通过后数据正式生效
        </p>
      </div>
    </div>
  );
};

export default SubmissionPage;
