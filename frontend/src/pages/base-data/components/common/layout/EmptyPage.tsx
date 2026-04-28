import { Card } from 'antd';
import React from 'react';

export interface EmptyPageProps {
  title?: string;
  description?: string;
}

const EmptyPage: React.FC<EmptyPageProps> = ({
  title = '功能待开发...',
  description = '此功能正在开发中，敬请期待...',
}) => {
  return (
    <Card title={title} style={{ width: '100%' }}>
      <div
        style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          minHeight: '600px',
        }}
      >
        <div
          style={{
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#888', fontWeight: 'normal' }}>{title}</h3>
            {description && (
              <p style={{ color: '#aaa', marginTop: '8px' }}>{description}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmptyPage;
