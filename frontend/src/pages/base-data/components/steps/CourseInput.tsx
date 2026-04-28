import React from 'react';
import PresetDataManager from '@/pages/base-data/components/common/table/PresetDataManager';

interface CourseInputProps {
  onUpdateStatus?: (completed: boolean) => void;
}

const CourseInput: React.FC<CourseInputProps> = ({ onUpdateStatus }) => {
  return (
    <PresetDataManager type="course-input" onUpdateStatus={onUpdateStatus} />
  );
};

export default CourseInput;
