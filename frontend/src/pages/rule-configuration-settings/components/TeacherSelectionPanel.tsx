import { SearchOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, Space, Tag } from "antd";
import React, { useMemo } from "react";
import type { Teacher } from "../types";
import TeacherCard from "./TeacherCard";

interface TeacherSelectionPanelProps {
  teachers: Teacher[];
  selectedTeacherIds: string[];
  searchText: string;
  activeTab: "select" | "manage";
  onTeacherSelect: (teacherId: string) => void;
  onSearchChange: (value: string) => void;
  onTabChange: (tab: "select" | "manage") => void;
  onClearSelection: () => void;
}

/**
 * 教师选择面板组件
 */
const TeacherSelectionPanel: React.FC<TeacherSelectionPanelProps> = ({
  teachers,
  selectedTeacherIds,
  searchText,
  activeTab,
  onTeacherSelect,
  onSearchChange,
  onTabChange,
  onClearSelection,
}) => {
  // 筛选教师列表
  const filteredTeachers = useMemo(() => {
    const searchLower = searchText.toLowerCase();
    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchLower) ||
        teacher.id.toLowerCase().includes(searchLower) ||
        teacher.employeeId.toLowerCase().includes(searchLower)
    );
  }, [teachers, searchText]);

  // 已选教师信息
  const selectedTeachers = useMemo(() => {
    return teachers.filter((t) => selectedTeacherIds.includes(t.id));
  }, [teachers, selectedTeacherIds]);

  return (
    <div
      style={{
        background: "#f0f9ff",
        padding: 20,
        borderRadius: 8,
        border: "1px solid #91d5ff",
        marginBottom: 16,
      }}
    >
      <h4 style={{ marginBottom: 16 }}>
        <TeamOutlined style={{ marginRight: 8 }} />
        选择教师
      </h4>

      <Space direction="vertical" style={{ width: "100%" }}>
        {/* 搜索和操作按钮 */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索教师姓名、部门或工号"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Button
            type={activeTab === "select" ? "primary" : "default"}
            onClick={() => onTabChange("select")}
          >
            选择教师
          </Button>
          <Button
            type={activeTab === "manage" ? "primary" : "default"}
            onClick={() => onTabChange("manage")}
          >
            管理日期
          </Button>

          {selectedTeacherIds.length > 0 && (
            <Tag color="blue">
              已选择 {selectedTeacherIds.length} 位教师
              <Button
                type="text"
                size="small"
                onClick={onClearSelection}
                style={{ marginLeft: 8 }}
              >
                清空
              </Button>
            </Tag>
          )}
        </Space>

        {/* 已选教师标签 */}
        {selectedTeachers.length > 0 && (
          <div
            style={{
              background: "#fff",
              padding: 12,
              borderRadius: 6,
              marginBottom: 16,
            }}
          >
            <h5>已选教师列表：</h5>
            <Space wrap>
              {selectedTeachers.map((teacher) => (
                <Tag
                  key={teacher.id}
                  closable
                  onClose={() => onTeacherSelect(teacher.id)}
                  style={{ padding: "4px 8px" }}
                >
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{ marginRight: 4 }}
                  />
                  {teacher.name}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {/* 教师卡片列表 */}
        {activeTab === "select" && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              maxHeight: 300,
              overflowY: "auto",
              padding: 8,
              background: "#fff",
              borderRadius: 6,
            }}
          >
            {filteredTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                isSelected={selectedTeacherIds.includes(teacher.id)}
                onClick={() => onTeacherSelect(teacher.id)}
              />
            ))}
          </div>
        )}
      </Space>
    </div>
  );
};

export default TeacherSelectionPanel;
