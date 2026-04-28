import * as echarts from "echarts";
import React, { useEffect, useRef } from "react";

interface ChartComponentProps {
  chartId: string;
  options: any;
  height?: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  chartId,
  options,
  height = 250,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // 销毁之前的实例
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // 创建新的图表实例
      chartInstance.current = echarts.init(chartRef.current);
      chartInstance.current.setOption(options);

      // 添加窗口大小变化监听
      const handleResize = () => {
        chartInstance.current?.resize();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }
      };
    }
  }, [options]);

  return (
    <div
      ref={chartRef}
      style={{ width: "100%", height: `${height}px` }}
      id={chartId}
    />
  );
};

export default ChartComponent;
