import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright="2024 智能排课系统 版权所有"
      links={[
        {
          key: '智能排课系统',
          title: '智能排课系统',
          href: 'https://github.com/puyu111/Class-Scheduling-System',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/puyu111/Class-Scheduling-System',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
