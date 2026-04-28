import { Col, Row } from 'antd';
import React from 'react';
import RuleTable from './rule-table';
import TreeControl from './tree-con';

const TeacherAvailableTime: React.FC = () => (
  <div style={{ minHeight: '100vh', background: '#ffffff' }}>
    <Row gutter={16}>
      <Col span={5}>
        <div
          style={{
            border: '1px solid #eee',
            borderRadius: '8px',
            background: '#fff',
            padding: '16px',
          }}
        >
          <TreeControl />
        </div>
      </Col>
      <Col span={19}>
        <RuleTable />
      </Col>
    </Row>
  </div>
);

export default TeacherAvailableTime;
