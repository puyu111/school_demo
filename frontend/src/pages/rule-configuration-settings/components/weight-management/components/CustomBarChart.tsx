import { Empty } from "antd";
import React from "react";

interface BarChartData {
  name: string;
  当前权重: number;
  默认权重: number;
  category: string;
  color: string;
}

interface CustomBarChartProps {
  data: BarChartData[];
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({ data }) => {
  if (!data.length) {
    return <Empty description="暂无数据" />;
  }

  const maxValue = Math.max(
    ...data.map((item) => item.当前权重),
    ...data.map((item) => item.默认权重)
  );

  return (
    <div style={{ height: "300px", padding: "10px" }}>
      {data.map((item) => {
        const barWidth = (item.当前权重 / maxValue) * 100;
        const defaultBarWidth = (item.默认权重 / maxValue) * 100;

        return (
          <div key={item.name} style={{ marginBottom: "15px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: item.color,
                  marginRight: "8px",
                  borderRadius: "2px",
                }}
              />
              <div style={{ flex: 1, fontSize: "12px", fontWeight: "bold" }}>
                {item.name}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#1890ff",
                  fontWeight: "bold",
                }}
              >
                {item.当前权重}%
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "60px",
                  fontSize: "10px",
                  color: "#666",
                  textAlign: "right",
                  paddingRight: "8px",
                }}
              >
                当前
              </div>
              <div style={{ flex: 1, position: "relative", height: "20px" }}>
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    backgroundColor: item.color,
                    borderRadius: "3px",
                    transition: "width 0.3s",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: "0",
                    top: "0",
                    width: `${100 - barWidth}%`,
                    height: "100%",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "0 3px 3px 0",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "3px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  fontSize: "10px",
                  color: "#666",
                  textAlign: "right",
                  paddingRight: "8px",
                }}
              >
                默认
              </div>
              <div style={{ flex: 1, position: "relative", height: "10px" }}>
                <div
                  style={{
                    width: `${defaultBarWidth}%`,
                    height: "100%",
                    backgroundColor: "#d9d9d9",
                    borderRadius: "2px",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomBarChart;
