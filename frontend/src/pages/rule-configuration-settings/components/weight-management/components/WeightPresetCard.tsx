import { InfoCircleOutlined } from '@ant-design/icons';
import { Card, Radio, Space, Tooltip } from 'antd';
import React from 'react';
import { weightPresets } from '../constants/weightPresets';

interface WeightPresetCardProps {
  selectedPreset: string;
  onPresetChange: (presetId: string) => void;
}

const WeightPresetCard: React.FC<WeightPresetCardProps> = ({
  selectedPreset,
  onPresetChange,
}) => {
  return (
    <Card
      title="权重预设"
      size="small"
      extra={
        <Tooltip title="选择预设模式快速设置权重">
          <InfoCircleOutlined />
        </Tooltip>
      }
    >
      <Radio.Group
        value={selectedPreset}
        onChange={(e) => onPresetChange(e.target.value)}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {weightPresets.map((preset) => (
            <Radio.Button
              key={preset.id}
              value={preset.id}
              style={{
                display: 'block',
                textAlign: 'left',
                height: 'auto',
                padding: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{preset.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {preset.description}
              </div>
            </Radio.Button>
          ))}
        </Space>
      </Radio.Group>
    </Card>
  );
};

export default WeightPresetCard;
