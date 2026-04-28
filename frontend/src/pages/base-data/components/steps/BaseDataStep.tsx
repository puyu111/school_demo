import React from 'react';
import { PresetDataManager } from '../common';
import type { PresetDataManagerType } from '../common/table/PresetDataManager';

interface BaseDataStepProps {
  type: PresetDataManagerType;
  onUpdateStatus?: (completed: boolean) => void;
}

const BaseDataStep: React.FC<BaseDataStepProps> = ({
  type,
  onUpdateStatus,
}) => {
  return <PresetDataManager type={type} onUpdateStatus={onUpdateStatus} />;
};

export default BaseDataStep;
