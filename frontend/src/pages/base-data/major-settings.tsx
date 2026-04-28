import React from 'react';
import { PresetDataManager } from './component';

interface MajorSettingsProps {
  onUpdateStatus?: (completed: boolean) => void;
}

const MajorSettings: React.FC<MajorSettingsProps> = ({ onUpdateStatus }) => {
  return (
    <PresetDataManager type="major-settings" onUpdateStatus={onUpdateStatus} />
  );
};

export default MajorSettings;
