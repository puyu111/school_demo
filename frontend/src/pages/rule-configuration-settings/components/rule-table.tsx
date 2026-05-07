import {
  CalendarOutlined,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Flex, message, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { useRuleDataWithApi } from "../hooks/useApiData";
import type { RuleData } from "../types";
import TeacherUnavailableDialog from "./dialog-box";
import RuleEditDialog from "./modify-dialog-box";

const RuleTable: React.FC = () => {
  const [editingRule, setEditingRule] = useState<RuleData | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // 使用 API 获取规则数据
  const { rules, rulesLoading, loadRules, setRules, updateRule } = useRuleDataWithApi();

  // 初始化加载数据
  useMemo(() => {
    loadRules();
  }, []);

  // 格式化时间戳
  const formatTimestamp = (timestamp: number): string => {
    return dayjs(timestamp).isValid()
      ? dayjs(timestamp).format("YYYY-MM-DD")
      : "无效日期";
  };

  const isValidTimestamp = (timestamp: number): boolean => {
    return timestamp > 0 && dayjs(timestamp).isValid();
  };

  // 表格列定义
  const columns: any = useMemo(
    () => [
      {
        title: "规则名称",
        dataIndex: "ruleName",
        key: "ruleName",
        width: 200,
        render: (text: string, record: RuleData) => (
          <Space direction="vertical" size={2}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{text}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {record.description}
            </div>
          </Space>
        ),
      },
      {
        title: "适用教师",
        key: "teachers",
        width: 180,
        render: (_: any, record: RuleData) => (
          <Flex gap="small" align="center" wrap>
            {(record.teachers || []).length > 0 ? (
              <>
                {(record.teachers || []).slice(0, 3).map((teacher: string) => (
                  <Tag key={teacher} color="blue">
                    <Avatar
                      size="small"
                      icon={<UserOutlined />}
                      style={{ marginRight: 4 }}
                    />
                    {teacher}
                  </Tag>
                ))}
                {(record.teachers || []).length > 3 && (
                  <Tag>+{(record.teachers || []).length - 3}</Tag>
                )}
              </>
            ) : (
              <Tag color="default">所有教师</Tag>
            )}
          </Flex>
        ),
      },
      {
        title: "有效期",
        key: "validDate",
        width: 180,
        render: (_: any, record: RuleData) => {
          if (record.validDate && record.validDate.length === 2) {
            const [startTimestamp, endTimestamp] = record.validDate;
            const isStartValid = isValidTimestamp(startTimestamp);
            const isEndValid = isValidTimestamp(endTimestamp);

            if (!isStartValid || !isEndValid) {
              return <Tag color="warning">日期格式错误</Tag>;
            }

            const startDate = formatTimestamp(startTimestamp);
            const endDate = formatTimestamp(endTimestamp);
            const currentTime = Date.now();
            const isExpired = endTimestamp < currentTime;

            return (
              <Space direction="vertical" size={2}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: isExpired ? "#ff4d4f" : "inherit",
                  }}
                >
                  {startDate}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: isExpired ? "#ff7875" : "#666",
                  }}
                >
                  至 {endDate}
                  {isExpired && " (已过期)"}
                </div>
                <div style={{ fontSize: 12, color: "#999" }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {isExpired ? "已过期" : "有效日期"}
                </div>
              </Space>
            );
          }
          return <Tag color="default">永久有效</Tag>;
        },
      },
      {
        title: "操作",
        key: "action",
        width: 100,
        render: (_: any, record: RuleData) => (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record)}
          >
            修改
          </Button>
        ),
      },
    ],
    [isValidTimestamp]
  );

  // 处理编辑
  const handleEditClick = (record: RuleData) => {
    setEditingRule(record);
    setEditDialogVisible(true);
  };

  // 处理保存
  const handleSave = async (updatedRule: RuleData) => {
    setLoading(true);
    try {
      // 调用 API 持久化保存
      await updateRule(updatedRule.key, updatedRule);
      // 重新从后端加载数据，确保数据一致
      await loadRules();
      setEditDialogVisible(false);
      setEditingRule(null);
      message.success("规则更新成功");
    } catch (e) {
      message.error("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (rulesLoading) {
    return <div>加载中...</div>;
  }

  return (
    <>
      <TeacherUnavailableDialog />
      <Table<RuleData>
        columns={columns}
        dataSource={rules}
        rowKey="key"
        size="middle"
        bordered={false}
        loading={rulesLoading}
        scroll={{ x: 900 }}
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条规则`,
        }}
        style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          overflow: "hidden",
        }}
      />

      {/* 编辑对话框 */}
      <RuleEditDialog
        open={editDialogVisible}
        title={`编辑规则 - ${editingRule?.ruleName || ""}`}
        record={editingRule}
        onSave={handleSave}
        onCancel={() => {
          setEditDialogVisible(false);
          setEditingRule(null);
        }}
        loading={loading}
      />
    </>
  );
};

export default RuleTable;
