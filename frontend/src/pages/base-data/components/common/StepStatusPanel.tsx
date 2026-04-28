import React from 'react';

// 定义步骤完成状态类型
type StepCompletion = Record<0 | 1 | 2 | 3 | 4, boolean>;

// 步骤状态面板属性接口
interface StepStatusPanelProps {
  stepCompletion: StepCompletion;
}

// 步骤配置
const STEPS = [
  { id: 0, name: '课程录入' },
  { id: 1, name: '课程设置' },
  { id: 2, name: '专业设置' },
  { id: 3, name: '教师录入' },
  { id: 4, name: '学期日历' },
] as const; // 使用 const 断言以保持字面量类型

// 步骤状态面板组件
const StepStatusPanel: React.FC<StepStatusPanelProps> = ({
  stepCompletion,
}) => {
  const allStepsCompleted = STEPS.every((step) => stepCompletion[step.id]);

  return (
    <div
      style={{
        backgroundColor: '#f6ffed',
        border: '1px solid #b7eb8f',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '32px',
      }}
    >
      <h3 style={{ margin: 0, color: '#52c41a', marginBottom: '16px' }}>
        各模块完成状态
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}
      >
        {STEPS.map((step) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                textAlign: 'center',
                lineHeight: '20px',
                borderRadius: '50%',
                backgroundColor: stepCompletion[step.id]
                  ? '#f6ffed'
                  : '#fff2f0',
                border: `1px solid ${stepCompletion[step.id] ? '#b7eb8f' : '#ffccc7'}`,
                color: stepCompletion[step.id] ? '#52c41a' : '#ff4d4f',
                fontWeight: 'bold',
                marginRight: '8px',
              }}
            >
              {stepCompletion[step.id] ? '✓' : '×'}
            </span>
            <span>{step.name}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: allStepsCompleted ? '#f6ffed' : '#fffbe6',
          border: allStepsCompleted ? '1px solid #b7eb8f' : '1px solid #ffe58f',
          borderRadius: '4px',
        }}
      >
        <strong>
          {allStepsCompleted
            ? '所有模块已完成，可以提交'
            : '仍有未完成的模块，请继续完成'}
        </strong>
      </div>
    </div>
  );
};

export default StepStatusPanel;
