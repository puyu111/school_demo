/**
 * base-data 模块 - 主页面：基础数据管理
 * 包含 6 个步骤流程：课程录入 -> 课程设置 -> 专业设置 -> 教师录入 -> 学期日历 -> 提交
 */

import { Spin, message } from 'antd';
import type { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { type StepCompletion, Stepper } from './components';
import { DEFAULT_STEP_COMPLETION, TOTAL_STEPS } from './constants';
import {
  Step1CourseInput,
  Step2CourseSettings,
  Step3MajorSettings,
  Step4TeacherInput,
  Step5Calendar,
  Step6Submission,
} from './pages';
import { submitCalendar } from './services';

/**
 * 基础数据管理主页面组件
 * 管理 6 个步骤的导航和状态
 */
const BaseData: React.FC = () => {
  // 当前步骤索引
  const [currentStep, setCurrentStep] = useState(0);
  // 各步骤完成状态
  const [stepCompletion, setStepCompletion] = useState<StepCompletion>(
    DEFAULT_STEP_COMPLETION,
  );

  // 从后端加载的各步骤数据（不传则使用组件内部的本地生成数据）
  const [courseData, setCourseData] = useState<any[] | undefined>(undefined);
  const [courseSettingData, setCourseSettingData] = useState<any[] | undefined>(undefined);
  const [majorData, setMajorData] = useState<any[] | undefined>(undefined);
  const [teacherData, setTeacherData] = useState<any[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // 从课程数据中提取课程名称，供其他步骤的多选下拉使用
  const courseNameOptions = useMemo(
    () => courseData?.map((c: any) => ({ label: c.name, value: c.name })) || [],
    [courseData],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 直接用 fetch 绕过 UmiJS 请求处理管道
        const baseUrl = '';
        // 后端 pageSize 最大值限制为 9999
        const commonParams = 'page=1&pageSize=9999';

        const [coursesRes, settingsRes, majorsRes, teachersRes] = await Promise.all([
          fetch(`${baseUrl}/api/base-data/courses?${commonParams}`).then(r => r.json()),
          fetch(`${baseUrl}/api/base-data/course-settings?${commonParams}`).then(r => r.json()),
          fetch(`${baseUrl}/api/base-data/majors?${commonParams}`).then(r => r.json()),
          fetch(`${baseUrl}/api/base-data/teachers?${commonParams}`).then(r => r.json()),
        ]);
        // 后端返回 { code, message, data: { list, total }, timestamp, success }
        // 为每条记录添加 key 字段（Ant Design Table 必需），优先使用 dbId
        const mapKey = (item: any) => item ? { ...item, key: item.dbId ?? item.id ?? item.key } : item;
        // 按 id 排序保持顺序稳定
        const sortById = (list: any[]) => list?.sort((a, b) => String(a.id).localeCompare(String(b.id), 'zh', { numeric: true }));
        if (coursesRes.code === 200) setCourseData(sortById(coursesRes.data?.list)?.map(mapKey));
        if (settingsRes.code === 200) setCourseSettingData(sortById(settingsRes.data?.list)?.map(mapKey));
        if (majorsRes.code === 200) setMajorData(sortById(majorsRes.data?.list)?.map(mapKey));
        if (teachersRes.code === 200) setTeacherData(sortById(teachersRes.data?.list)?.map(mapKey));
      } catch (e) {
        console.warn('【base-data】后端数据加载失败，使用本地生成数据', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /** 更新步骤完成状态 */
  const updateStepCompletion = useCallback(
    (step: number, completed: boolean) => {
      setStepCompletion((prev) => ({
        ...prev,
        [step as 0 | 1 | 2 | 3 | 4]: completed,
      }));
    },
    [],
  );

  /** 前进一步：跳转到下一步 */
  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  }, []);

  /** 跳转到指定步骤 */
  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  /** 处理日历提交：保存日历设置并进入下一步 */
  const handleCalendarSubmit = useCallback(
    async (data: {
      selected: string[];
      disabled: string[];
      includeWeekends: boolean;
      termStart: Dayjs | null;
      termEnd: Dayjs | null;
    }) => {
      // 验证学期日期
      if (!data.termStart || !data.termEnd) {
        message.warning('请先选择学期开始和结束日期');
        return;
      }

      try {
        await submitCalendar({
          startDate: data.termStart.format('YYYY-MM-DD'),
          endDate: data.termEnd.format('YYYY-MM-DD'),
          disabledDates: data.disabled.map((date) => ({
            date,
            remark: '',
          })),
        });

        updateStepCompletion(4, true);
        message.success('学期日历设置已保存！');
        goToNextStep();
      } catch (error: any) {
        message.error(error?.message || '保存学期日历失败，请稍后重试');
      }
    },
    [goToNextStep, updateStepCompletion],
  );

  /** 渲染当前步骤内容 */
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1CourseInput
            onUpdateStatus={() => updateStepCompletion(0, true)}
            initialData={courseData}
          />
        );
      case 1:
        return (
          <Step2CourseSettings
            onUpdateStatus={() => updateStepCompletion(1, true)}
            initialData={courseSettingData}
            courseNameOptions={courseNameOptions}
          />
        );
      case 2:
        return (
          <Step3MajorSettings
            onUpdateStatus={() => updateStepCompletion(2, true)}
            initialData={majorData}
            courseNameOptions={courseNameOptions}
          />
        );
      case 3:
        return (
          <Step4TeacherInput
            onUpdateStatus={() => updateStepCompletion(3, true)}
            initialData={teacherData}
            courseNameOptions={courseNameOptions}
          />
        );
      case 4:
        return (
          <Step5Calendar
            onUpdateStatus={() => updateStepCompletion(4, true)}
            onSubmit={handleCalendarSubmit}
          />
        );
      case 5:
        return (
          <Step6Submission
            stepCompletion={stepCompletion}
            setStepCompletion={setStepCompletion}
            setCurrentStep={setCurrentStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* 顶部步骤导航区 */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>基础数据管理</h2>
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fafafa',
            borderRadius: '4px',
          }}
        >
          <Stepper currentStep={currentStep} onStepChange={goToStep} />
        </div>
      </div>

      {/* 步骤内容区 */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          margin: 0,
          padding: 0,
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          renderStepContent()
        )}
      </div>
    </div>
  );
};

export default BaseData;
