import { Avatar, Card, Col, Progress, Row, Tag, Typography } from "antd";
import React from "react";

const { Title } = Typography;

interface TeacherWorkload {
  name: string;
  courses: number;
  hours: number;
}

interface TeacherStatsProps {
  data: TeacherWorkload[];
}

const TeacherStats: React.FC<TeacherStatsProps> = ({ data }) => {
  const colors = ["#1890ff", "#52c41a", "#fa8c16", "#722ed1", "#13c2c2"];

  return (
    <Row gutter={16}>
      <Col span={24}>
        <Card title="教师工作量分布" style={{ borderRadius: "8px" }}>
          <Row gutter={16}>
            {data.map((teacher) => (
              <Col xs={24} sm={12} md={8} lg={4.8} key={teacher.name}>
                <Card
                  size="small"
                  style={{ textAlign: "center", borderRadius: "8px" }}
                >
                  <Avatar
                    size={48}
                    style={{ backgroundColor: colors[index % colors.length] }}
                  >
                    {teacher.name.charAt(0)}
                  </Avatar>
                  <Title level={5} style={{ margin: "8px 0" }}>
                    {teacher.name}
                  </Title>
                  <div>
                    <Tag color="blue">{teacher.courses} 门课程</Tag>
                    <Tag color="green">{teacher.hours} 课时</Tag>
                  </div>
                  <Progress
                    percent={Math.min((teacher.courses / 10) * 100, 100)}
                    size="small"
                    style={{ marginTop: "8px" }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default TeacherStats;
