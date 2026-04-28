import type { TreeProps } from 'antd';
import { Flex, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { createStyles } from 'antd-style';
import React from 'react';
import { TREE_DATA } from '../constants';

// ✅ 修正：使用正确的 hook 名称
const useStyles = createStyles(({ css }) => ({
  root: css`
    padding: 8px;
    border-radius: 4px;
  `,
  item: css`
    border-radius: 2px;
  `,
  itemTitle: css`
    font-size: 14px;
  `,
}));

interface TreeControlProps {
  treeData?: DataNode[];
  defaultExpandedKeys?: string[];
  defaultSelectedKeys?: string[];
  defaultCheckedKeys?: string[];
  onCheck?: (checkedKeys: string[]) => void;
  onSelect?: (selectedKeys: string[]) => void;
}

const TreeControl: React.FC<TreeControlProps> = ({
  treeData = TREE_DATA,
  defaultExpandedKeys = ['0-0-0'],
  defaultSelectedKeys = ['0-0-0-1'],
  defaultCheckedKeys = ['0-0-0'],
  onCheck,
  onSelect,
}) => {
  const { styles } = useStyles(); // ✅ 现在正确了

  // ✅ 移除 checkable，避免冲突
  const sharedProps: TreeProps = {
    treeData,
    autoExpandParent: true,
  };

  return (
    <Flex vertical gap="middle" className={styles.root}>
      <Tree
        {...sharedProps}
        checkable={false} // ✅ 统一在这里设置
        defaultExpandedKeys={defaultExpandedKeys}
        defaultSelectedKeys={defaultSelectedKeys}
        defaultCheckedKeys={defaultCheckedKeys}
        onCheck={(checkedKeys) => onCheck?.(checkedKeys as string[])}
        onSelect={(selectedKeys) => onSelect?.(selectedKeys as string[])}
      />
    </Flex>
  );
};

export default TreeControl;
