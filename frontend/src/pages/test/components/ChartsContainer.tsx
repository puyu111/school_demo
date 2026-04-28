import { Card, Col, Row } from "antd";
import React from "react";
import {
  getCourseTypeOptions,
  getRoomUsageOptions,
  getTimeDistributionOptions,
  getWeekDistributionOptions,
} from "../constants/chartOptions";
import ChartComponent from "./ChartComponent";

interface ChartsContainerProps {
  data: any;
  count: any;
}

const ChartsContainer: React.FC<ChartsContainerProps> = ({ data, count }) => {
  console.log("ChartsContainer count:", count);
  const charts = [
    {
      id: "timeDistributionChart",
      title: "时间分布",
      options: getTimeDistributionOptions(data.timeDistribution),
      span: { xs: 24, sm: 12, md: 12, lg: 6 },
    },
    {
      id: "courseTypeChart",
      title: "课程类型分布",
      options: getCourseTypeOptions(data.courseType),
      span: { xs: 24, sm: 12, md: 12, lg: 6 },
    },
    {
      id: "weekDistributionChart",
      title: "周次课程分布",
      options: getWeekDistributionOptions(data.weekDistribution),
      span: { xs: 24, sm: 12, md: 12, lg: 6 },
    },
    {
      id: "roomUsageChart",
      title: "教室使用率TOP5",
      options: getRoomUsageOptions(data.roomUtilization),
      span: { xs: 24, sm: 12, md: 12, lg: 6 },
    },
  ];

  return (
    <Row gutter={16}>
      {charts.map((chart) => (
        <Col {...chart.span} key={chart.id}>
          <Card style={{ borderRadius: "8px", height: "300px" }}>
            <ChartComponent
              chartId={chart.id}
              options={chart.options}
              height={250}
              count={count}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ChartsContainer;
