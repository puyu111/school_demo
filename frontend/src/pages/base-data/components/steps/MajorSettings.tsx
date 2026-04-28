import React from 'react';
import PresetDataManager from '@/pages/base-data/components/common/table/PresetDataManager';

interface MajorSettingsProps {
  onUpdateStatus?: (completed: boolean) => void;
}

const MajorSettings: React.FC<MajorSettingsProps> = ({ onUpdateStatus }) => {
  return (
    <PresetDataManager type="major-settings" onUpdateStatus={onUpdateStatus} />
  );
};

export default MajorSettings;
