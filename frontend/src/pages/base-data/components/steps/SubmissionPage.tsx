import { Button, message } from 'antd';
import React from 'react';
import StepStatusPanel from '../common/StepStatusPanel';

interface StepCompletion {
  0: boolean;
  1: boolean;
  2: boolean;
  3: boolean;
  4: boolean;
}

interface SubmissionPageProps {
  stepCompletion: StepCompletion;
  setStepCompletion: React.Dispatch<React.SetStateAction<StepCompletion>>;
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

  const handleBackToModify = () => {
    setCurrentStep(4);
  };

  return (
    <div style={{ padding: '24px' }}>
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
  );
};

export default SubmissionPage;
