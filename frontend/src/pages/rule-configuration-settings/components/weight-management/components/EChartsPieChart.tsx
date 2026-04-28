import * as echarts from "echarts";
import React, { useEffect, useRef } from "react";

// 定义 ECharts 选项类型
type EChartsOption = echarts.EChartsOption;

interface PieChartData {
  value: number;
  name: string;
}

interface EChartsPieChartProps {
  title?: string;
  subtext?: string;
  data?: PieChartData[];
  height?: number | string;
  width?: number | string;
  showLegend?: boolean;
  legendPosition?: "left" | "right" | "top" | "bottom" | "center";
  radius?: string | [string, string]; // 饼图半径，如 '50%' 或 ['40%', '70%']
}

const EChartsPieChart: React.FC<EChartsPieChartProps> = ({
  title = "Referer of a Website",
  data = [
    { value: 1048, name: "Search Engine" },
    { value: 735, name: "Direct" },
    { value: 580, name: "Email" },
    { value: 484, name: "Union Ads" },
    { value: 300, name: "Video Ads" },
  ],
  height = 400,
  width = "100%",
  showLegend = true,
  legendPosition = "left",
  radius = "50%",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 初始化图表
  const initChart = () => {
    if (!chartRef.current) return;

    // 销毁之前的实例
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    // 创建新的实例
    chartInstance.current = echarts.init(chartRef.current);

    const option: EChartsOption = {
      title: {
        text: title,
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      legend: showLegend
        ? {
            orient:
              legendPosition === "left" || legendPosition === "right"
                ? "vertical"
                : "horizontal",
            left: legendPosition === "center" ? "center" : legendPosition,
            top:
              legendPosition === "top"
                ? "top"
                : legendPosition === "bottom"
                ? "bottom"
                : "middle",
            data: data.map((item) => item.name),
          }
        : undefined,
      series: [
        {
          name: "Access From",
          type: "pie" as const,
          radius: radius,
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          label: {
            show: false,
            formatter: "{b}: {c} ({d}%)",
          },
          itemStyle: {
            borderRadius: 4,
            borderColor: "#fff",
            borderWidth: 2,
          },
        },
      ],
    };

    chartInstance.current.setOption(option);
  };

  // 监听窗口大小变化，重新调整图表大小
  const handleResize = () => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  };

  useEffect(() => {
    initChart();

    // 添加窗口大小变化监听
    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, [title, data, showLegend, legendPosition, radius]);

  // 当props变化时更新图表
  useEffect(() => {
    if (chartInstance.current) {
      initChart();
    }
  }, [title, data, showLegend, legendPosition, radius]);

  return (
    <div
      ref={chartRef}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: typeof width === "number" ? `${width}px` : width,
      }}
    />
  );
};

export default EChartsPieChart;
