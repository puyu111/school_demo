import React from 'react';
import { PresetDataManager } from './component';

interface TeacherInputProps {
  onUpdateStatus?: (completed: boolean) => void;
}

const TeacherInput: React.FC<TeacherInputProps> = ({ onUpdateStatus }) => {
  return (
    <PresetDataManager type="teacher-input" onUpdateStatus={onUpdateStatus} />
  );
};

export default TeacherInput;
