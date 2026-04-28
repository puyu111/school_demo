import { Card, Col, Divider, Progress, Row, Typography } from "antd";
import React from "react";

const { Text } = Typography;

interface RoomUtilization {
  name: string;
  usage: number;
  capacity: number;
}

interface RoomStatsProps {
  data: RoomUtilization[];
}

const RoomStats: React.FC<RoomStatsProps> = ({ data }) => {
  return (
    <Row gutter={16}>
      <Col span={24}>
        <Card title="教室使用情况" style={{ borderRadius: "8px" }}>
          {data.map((room) => (
            <div key={room.id} style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <Text strong>{room.name}</Text>
                <Text type="secondary">容量: {room.capacity} 人</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Progress
                  percent={room.usage}
                  strokeColor={
                    room.usage > 90
                      ? "#f5222d"
                      : room.usage > 70
                      ? "#fa8c16"
                      : "#52c41a"
                  }
                  style={{ flex: 1, marginRight: "16px" }}
                />
                <Text strong style={{ minWidth: "60px" }}>
                  {room.usage}%
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "4px",
                }}
              >
                <Text type="secondary">
                  使用频率: {Math.round(room.usage * 2.5)} 次/周
                </Text>
                <Text type={room.usage > 85 ? "danger" : "secondary"}>
                  {room.usage > 85
                    ? "使用率过高"
                    : room.usage < 50
                    ? "使用率偏低"
                    : "使用率正常"}
                </Text>
              </div>
              <Divider style={{ margin: "12px 0" }} />
            </div>
          ))}
        </Card>
      </Col>
    </Row>
  );
};
export default RoomStats;
