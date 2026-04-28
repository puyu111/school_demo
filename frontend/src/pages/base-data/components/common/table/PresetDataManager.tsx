import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import CommonDataManager from './CommonDataManager';

export type PresetDataManagerType =
  | 'course-input'
  | 'course-settings'
  | 'major-settings'
  | 'teacher-input';

export interface PresetDataManagerProps {
  type: PresetDataManagerType;
  onUpdateStatus?: (completed: boolean) => void;
  tableTitle?: string;
  searchPlaceholder?: string;
  initialData?: any[];
}

interface FieldConfig {
  name: string;
  label: string;
  type: 'input' | 'select' | 'number';
  required: boolean;
  mode?: 'multiple';
  options?: { label: string; value: string }[];
}

interface PresetConfig {
  initialData: any[];
  tableTitle: string;
  searchPlaceholder: string;
  formFields: FieldConfig[];
  columns: {
    title: string;
    dataIndex: string;
    key: string;
    render?: (value: any) => React.ReactNode;
  }[];
  validateData: (formData: any) => string | null;
  batchImportExample: string;
  modalTitles: { new: string; edit: string };
}

const createCourseInputConfig = (
  initialData?: any[],
  tableTitle?: string,
  searchPlaceholder?: string,
): PresetConfig => {
  const data =
    initialData ||
    Array.from({ length: 46 }).map((_, i) => ({
      key: i,
      id: `COURSE${i + 1}`,
      name: `课程 ${i + 1}`,
      credits: Math.floor(Math.random() * 4) + 1,
      type: i % 3 === 0 ? '必修' : i % 3 === 1 ? '选修' : '限选',
      totalHours: Math.floor(Math.random() * 64) + 16,
    }));

  return {
    initialData: data,
    tableTitle: tableTitle || '课程录入表',
    searchPlaceholder: searchPlaceholder || '请输入课程 ID 或课程名称进行搜索',
    formFields: [
      { name: 'id', label: '课程 ID', type: 'input', required: true },
      { name: 'name', label: '课程名称', type: 'input', required: true },
      { name: 'credits', label: '课程学分', type: 'number', required: true },
      {
        name: 'type',
        label: '课程类型',
        type: 'select',
        required: true,
        options: [
          { label: '必修', value: '必修' },
          { label: '选修', value: '选修' },
          { label: '限选', value: '限选' },
        ],
      },
      { name: 'totalHours', label: '总课时', type: 'number', required: true },
    ],
    columns: [
      { title: '课程 ID', dataIndex: 'id', key: 'id' },
      { title: '课程名称', dataIndex: 'name', key: 'name' },
      { title: '课程学分', dataIndex: 'credits', key: 'credits' },
      { title: '课程类型', dataIndex: 'type', key: 'type' },
      { title: '总课时', dataIndex: 'totalHours', key: 'totalHours' },
    ],
    validateData: (formData) => {
      if (
        !formData.name ||
        !formData.id ||
        !formData.credits ||
        !formData.totalHours
      ) {
        return '请填写所有必填字段';
      }
      return null;
    },
    batchImportExample: '高等数学，数学系，64，必修，4',
    modalTitles: { new: '新建课程', edit: '编辑课程' },
  };
};

const createCourseSettingsConfig = (
  initialData?: any[],
  tableTitle?: string,
  searchPlaceholder?: string,
): PresetConfig => {
  const allCourseNames = Array.from({ length: 20 }).map(
    (_, i) => `课程 ${i + 1}`,
  );
  const data =
    initialData ||
    Array.from({ length: 20 }).map((_, i) => ({
      key: i,
      name: `课程 ${i + 1}`,
      priority: (i % 4) + 1,
      prerequisites: i > 0 ? allCourseNames.slice(Math.max(0, i - 3), i) : [],
      semester: `第${(i % 4) + 1}学期`,
    }));

  const renderPrerequisites = (value: any) => {
    if (!value || (Array.isArray(value) && value.length === 0))
      return <span>-</span>;
    const prereqs = Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value.split(',')
        : [];
    const validPrereqs = prereqs.filter((p) => p && p.trim() !== '');
    if (validPrereqs.length === 0) return <span>-</span>;
    return (
      <div>
        {validPrereqs.map((prereq, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 前置课程名称可能重复，且无唯一 ID
          <div key={`${prereq}-${index}`}>
            第{index + 1}前置：{prereq.trim()}
          </div>
        ))}
      </div>
    );
  };

  return {
    initialData: data,
    tableTitle: tableTitle || '课程设置表',
    searchPlaceholder: searchPlaceholder || '请输入课程名称或开设学期进行搜索',
    formFields: [
      { name: 'name', label: '课程名称', type: 'input', required: true },
      {
        name: 'priority',
        label: '课程优先等级',
        type: 'number',
        required: true,
      },
      {
        name: 'prerequisites',
        label: '前置课程（可多选）',
        type: 'select',
        required: false,
        mode: 'multiple',
        options: allCourseNames.map((courseName) => ({
          label: courseName,
          value: courseName,
        })),
      },
      {
        name: 'semester',
        label: '开设学期',
        type: 'select',
        required: true,
        options: [
          { label: '第一学期', value: '第一学期' },
          { label: '第二学期', value: '第二学期' },
          { label: '第三学期', value: '第三学期' },
          { label: '第四学期', value: '第四学期' },
        ],
      },
    ],
    columns: [
      { title: '课程名称', dataIndex: 'name', key: 'name' },
      { title: '课程优先等级', dataIndex: 'priority', key: 'priority' },
      {
        title: '前置课程（可多选）',
        dataIndex: 'prerequisites',
        key: 'prerequisites',
        render: renderPrerequisites,
      },
      { title: '开设学期', dataIndex: 'semester', key: 'semester' },
    ],
    validateData: (formData) => {
      if (!formData.name || !formData.priority || !formData.semester) {
        return '请填写所有必填字段';
      }
      return null;
    },
    batchImportExample: '课程 1,1,课程 2,课程 3,课程 4,第一学期',
    modalTitles: { new: '新建课程设置', edit: '编辑课程设置' },
  };
};

const createMajorSettingsConfig = (
  initialData?: any[],
  tableTitle?: string,
  searchPlaceholder?: string,
): PresetConfig => {
  const availableCourses = [
    '高等数学',
    '线性代数',
    '概率论',
    '大学物理',
    '计算机基础',
    '数据结构',
    '算法设计',
    '软件工程',
    '数据库原理',
    '网络技术',
    '操作系统',
    '编译原理',
    '计算机网络',
    '软件测试',
    '人工智能',
  ];
  const data =
    initialData ||
    Array.from({ length: 15 }).map((_, i) => ({
      key: i,
      id: `MAJOR${String(i + 1).padStart(3, '0')}`,
      name: `专业 ${i + 1}`,
      courses: [
        availableCourses[i % availableCourses.length],
        availableCourses[(i + 3) % availableCourses.length],
      ],
      classSize: Math.floor(Math.random() * 10) + 5,
      duration: Math.floor(Math.random() * 2) + 3,
    }));

  const renderCourses = (value: string[]) => {
    if (!value || value.length === 0) return <span>-</span>;
    return (
      <div>
        {value.map((course, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 课程名称可能重复，且无唯一 ID
          <div key={`${course}-${index}`}>{course}</div>
        ))}
      </div>
    );
  };

  return {
    initialData: data,
    tableTitle: tableTitle || '专业设置表',
    searchPlaceholder: searchPlaceholder || '请输入专业名称或 ID 进行搜索',
    formFields: [
      { name: 'id', label: '专业 ID', type: 'input', required: true },
      { name: 'name', label: '专业名称', type: 'input', required: true },
      {
        name: 'courses',
        label: '开设课程（多选）',
        type: 'select',
        required: false,
        mode: 'multiple',
        options: availableCourses.map((course) => ({
          label: course,
          value: course,
        })),
      },
      { name: 'classSize', label: '班级数', type: 'number', required: true },
      { name: 'duration', label: '年制', type: 'number', required: true },
    ],
    columns: [
      { title: '专业 ID', dataIndex: 'id', key: 'id' },
      { title: '专业名称', dataIndex: 'name', key: 'name' },
      {
        title: '开设课程（多选）',
        dataIndex: 'courses',
        key: 'courses',
        render: renderCourses,
      },
      { title: '班级数', dataIndex: 'classSize', key: 'classSize' },
      { title: '年制', dataIndex: 'duration', key: 'duration' },
    ],
    validateData: (formData) => {
      if (
        !formData.id ||
        !formData.name ||
        !formData.classSize ||
        !formData.duration
      ) {
        return '请填写所有必填字段';
      }
      return null;
    },
    batchImportExample:
      'MAJOR001，计算机科学与技术，高等数学，数据结构，算法设计，5,4',
    modalTitles: { new: '新建专业', edit: '编辑专业' },
  };
};

const createTeacherInputConfig = (
  initialData?: any[],
  tableTitle?: string,
  searchPlaceholder?: string,
): PresetConfig => {
  const availableCourses = Array.from({ length: 10 }).map(
    (_, i) => `课程 ${i + 1}`,
  );
  const degreeOptions = [
    { label: '专科', value: '专科' },
    { label: '本科', value: '本科' },
    { label: '硕士', value: '硕士' },
    { label: '博士', value: '博士' },
  ];
  const data =
    initialData ||
    Array.from({ length: 30 }).map((_, i) => ({
      key: i,
      id: `TCH${String(i + 1).padStart(4, '0')}`,
      name: `教师 ${i + 1}`,
      gender: i % 2 === 0 ? '男' : '女',
      courses:
        i % 2 === 0
          ? [availableCourses[i % 10], availableCourses[(i + 1) % 10]]
          : [availableCourses[i % 10]],
      degree: degreeOptions[i % 4].value,
    }));

  const renderCourses = (value: string[]) => {
    if (!value || value.length === 0) return <span>-</span>;
    return (
      <div>
        {value.map((course, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 课程名称可能重复，且无唯一 ID
          <div key={`${course}-${index}`}>{course}</div>
        ))}
      </div>
    );
  };

  return {
    initialData: data,
    tableTitle: tableTitle || '教师录入表',
    searchPlaceholder: searchPlaceholder || '请输入教师姓名或 ID 进行搜索',
    formFields: [
      { name: 'id', label: '教师 ID', type: 'input', required: true },
      { name: 'name', label: '姓名', type: 'input', required: true },
      {
        name: 'gender',
        label: '性别',
        type: 'select',
        required: true,
        options: [
          { label: '男', value: '男' },
          { label: '女', value: '女' },
        ],
      },
      {
        name: 'courses',
        label: '可授课程（多选）',
        type: 'select',
        required: false,
        mode: 'multiple',
        options: availableCourses.map((course) => ({
          label: course,
          value: course,
        })),
      },
      {
        name: 'degree',
        label: '学历',
        type: 'select',
        required: true,
        options: degreeOptions,
      },
    ],
    columns: [
      { title: '教师 ID', dataIndex: 'id', key: 'id' },
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '性别', dataIndex: 'gender', key: 'gender' },
      {
        title: '可授课程（多选）',
        dataIndex: 'courses',
        key: 'courses',
        render: renderCourses,
      },
      { title: '学历', dataIndex: 'degree', key: 'degree' },
    ],
    validateData: (formData) => {
      if (
        !formData.id ||
        !formData.name ||
        !formData.gender ||
        !formData.degree
      ) {
        return '请填写所有必填字段';
      }
      return null;
    },
    batchImportExample:
      'TCH0001，李老师，男，课程 高等数学，课程 线性代数，本科',
    modalTitles: { new: '新建教师', edit: '编辑教师' },
  };
};

const PRESET_CONFIG_FACTORIES: Record<
  PresetDataManagerType,
  typeof createCourseInputConfig
> = {
  'course-input': createCourseInputConfig,
  'course-settings': createCourseSettingsConfig,
  'major-settings': createMajorSettingsConfig,
  'teacher-input': createTeacherInputConfig,
};

const PresetDataManager: React.FC<PresetDataManagerProps> = ({
  type,
  onUpdateStatus,
  tableTitle,
  searchPlaceholder,
  initialData,
}) => {
  const [data, setData] = useState<any[]>([]);

  const configFactory = PRESET_CONFIG_FACTORIES[type];
  const config = configFactory(initialData, tableTitle, searchPlaceholder);

  useEffect(() => {
    setData(config.initialData);
  }, []);

  const handleDataChange = (newData: any[]) => {
    setData(newData);
  };

  const handleManagerSubmit = () => {
    if (data.length === 0) {
      message.error('请先添加数据！');
      return;
    }
    if (onUpdateStatus) {
      onUpdateStatus(true);
    }
    message.success(`${config.tableTitle}提交成功！`);
  };

  return (
    <CommonDataManager
      initialData={config.initialData}
      tableTitle={config.tableTitle}
      columns={config.columns}
      formFields={config.formFields}
      searchPlaceholder={config.searchPlaceholder}
      modalTitleNew={config.modalTitles.new}
      modalTitleEdit={config.modalTitles.edit}
      batchImportExample={config.batchImportExample}
      validateData={config.validateData}
      onDataChanged={handleDataChange}
      onSubmit={handleManagerSubmit}
    />
  );
};

export default PresetDataManager;
