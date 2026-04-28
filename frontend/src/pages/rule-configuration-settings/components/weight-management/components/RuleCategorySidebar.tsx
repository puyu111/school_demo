import { PieChartOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import React from 'react';
import { ruleCategories } from '../constants/ruleCategories';

interface RuleCategorySidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  ruleCounts: Record<string, number>;
}

const RuleCategorySidebar: React.FC<RuleCategorySidebarProps> = ({
  activeCategory,
  onCategoryChange,
  ruleCounts,
}) => {
  return (
    <Card title="规则分类" size="small" style={{ marginTop: '16px' }}>
      <div style={{ marginBottom: '8px' }}>
        <Button
          type={activeCategory === 'all' ? 'primary' : 'default'}
          block
          onClick={() => onCategoryChange('all')}
          style={{ textAlign: 'left', marginBottom: '8px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PieChartOutlined style={{ marginRight: '8px' }} />
            全部规则
          </div>
        </Button>
      </div>
      {ruleCategories.map((category) => (
        <Button
          key={category.key}
          type={activeCategory === category.key ? 'primary' : 'default'}
          block
          onClick={() => onCategoryChange(category.key)}
          style={{
            textAlign: 'left',
            marginBottom: '8px',
            borderLeft: `4px solid ${category.color}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>{category.icon}</span>
            <div>
              <div style={{ fontWeight: 'bold' }}>{category.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {/* 使用可选链操作符防止undefined错误 */}
                {ruleCounts?.[category.key] || 0} 条规则启用
              </div>
            </div>
          </div>
        </Button>
      ))}
    </Card>
  );
};

export default RuleCategorySidebar;
