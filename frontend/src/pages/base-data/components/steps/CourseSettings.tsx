import React from 'react';
import PresetDataManager from '@/pages/base-data/components/common/table/PresetDataManager';

interface CourseSettingsProps {
  onUpdateStatus?: (completed: boolean) => void;
}

const CourseSettings: React.FC<CourseSettingsProps> = ({ onUpdateStatus }) => {
  return (
    <PresetDataManager type="course-settings" onUpdateStatus={onUpdateStatus} />
  );
};

export default CourseSettings;
