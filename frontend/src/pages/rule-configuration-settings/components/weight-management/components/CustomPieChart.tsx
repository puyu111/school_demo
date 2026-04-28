import React from 'react';
import type { PieChartData } from '../types';
import EChartsPieChart from './EChartsPieChart';

interface ExampleComponentProps {
  websiteData: PieChartData[];
}
const CustomPieChart: React.FC<ExampleComponentProps> = ({ websiteData }) => {
  return (
    <EChartsPieChart
      title="权重分类占比"
      data={websiteData}
      height={300}
      showLegend={false}
      legendPosition="right"
      radius={'50%'} // 环形图
    />
  );
};

export default CustomPieChart;
