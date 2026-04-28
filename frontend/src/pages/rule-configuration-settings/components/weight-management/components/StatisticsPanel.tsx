import { Card, Col, Progress, Row, Statistic } from 'antd';
import React from 'react';

interface StatisticsPanelProps {
  totalWeight: number;
  enabledRuleCount: number;
  totalRuleCount: number;
  weightChangeCount: number;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  totalWeight,
  enabledRuleCount,
  totalRuleCount,
  weightChangeCount,
}) => {
  return (
    <Row gutter={16} style={{ marginTop: '16px' }}>
      <Col span={8}>
        <Card size="small">
          <Statistic
            title="当前总权重"
            value={totalWeight}
            suffix="%"
            valueStyle={{
              color:
                totalWeight === 100
                  ? '#52c41a'
                  : totalWeight > 100
                    ? '#fa8c16'
                    : '#1890ff',
            }}
          />
          <Progress
            percent={totalWeight}
            status={
              totalWeight === 100
                ? 'normal'
                : totalWeight > 100
                  ? 'exception'
                  : 'active'
            }
            size="small"
            style={{ marginTop: '8px' }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card size="small">
          <Statistic
            title="启用规则数"
            value={enabledRuleCount}
            suffix={`/${totalRuleCount}`}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card size="small">
          <Statistic title="权重调整次数" value={weightChangeCount} />
        </Card>
      </Col>
    </Row>
  );
};

export default StatisticsPanel;
