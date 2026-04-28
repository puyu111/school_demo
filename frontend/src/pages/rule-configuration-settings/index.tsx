import React from "react";
import { MyTabs, StepsComponent } from "./components";
import { useSteps } from "./hooks/useRuleData";

/**
 * 规则配置设置页面
 * 包含两个主要功能：
 * 1. 教师不可用时间管理
 * 2. 权重设置管理
 */
const RuleConfigurationSettings: React.FC = () => {
  const { activeStep, handleStepChange } = useSteps(1);

  return (
    <div>
      <div
        style={{ maxWidth: "50%", marginLeft: "24px", marginBottom: "16px" }}
      >
        <StepsComponent current={activeStep} />
      </div>
      <MyTabs activeStep={activeStep} onStepChange={handleStepChange} />
    </div>
  );
};

export default RuleConfigurationSettings;
