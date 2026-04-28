import {
  BarChartOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudOutlined,
  DesktopOutlined,
  SafetyOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Divider, List, Row, Steps, Typography } from "antd";
import React from "react";
import styles from "./Welcomell.less";

const { Title, Paragraph, Text } = Typography;

const WelcomePage: React.FC = () => {
  // 系统功能列表
  const features = [
    {
      icon: <ScheduleOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
      title: "智能排课",
      description: "基于先进算法自动生成最优课程安排",
    },
    {
      icon: <TeamOutlined style={{ fontSize: 24, color: "#52c41a" }} />,
      title: "资源管理",
      description: "统一管理教师、教室、时间等教学资源",
    },
    {
      icon: <BookOutlined style={{ fontSize: 24, color: "#faad14" }} />,
      title: "课程管理",
      description: "完整的课程体系管理与维护",
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: "#722ed1" }} />,
      title: "时间规划",
      description: "科学合理的时间安排与调度",
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: "#13c2c2" }} />,
      title: "冲突检测",
      description: "智能检测并避免排课冲突",
    },
    {
      icon: <BarChartOutlined style={{ fontSize: 24, color: "#f759ab" }} />,
      title: "数据统计",
      description: "全面的数据分析与报表生成",
    },
  ];

  // 系统特点
  const characteristics = [
    { title: "智能算法", desc: "采用先进的排课算法，确保最优资源分配" },
    { title: "操作简便", desc: "界面友好，操作简单，上手快速" },
    { title: "稳定可靠", desc: "系统稳定运行，数据安全有保障" },
    { title: "扩展性强", desc: "支持多种教学模式，适应不同学校需求" },
  ];

  // 适用对象
  const targetUsers = [
    { name: "中小学校", color: "blue" },
    { name: "高等院校", color: "green" },
    { name: "培训机构", color: "orange" },
    { name: "企业内训", color: "purple" },
  ];

  return (
    <div className={styles.welcomeContainer}>
      {/* 主标题区域 */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.logoArea}>
            <div className={styles.logo}>
              <ScheduleOutlined style={{ fontSize: 64, color: "#1890ff" }} />
            </div>
            <Title level={1} className={styles.mainTitle}>
              智能排课管理系统
            </Title>
            <Title level={3} className={styles.subTitle}>
              专业的课程安排解决方案
            </Title>
          </div>

          <Divider style={{ borderColor: "rgba(255,255,255,0.2)" }} />

          <Paragraph className={styles.description}>
            基于人工智能算法的智能排课系统，帮助教育机构实现高效、合理的课程安排，
            优化教学资源配置，提升教学质量和管理效率。
          </Paragraph>
        </div>
      </div>

      {/* 核心功能区域 */}
      <div className={styles.section}>
        <Title level={2} className={styles.sectionTitle}>
          <ScheduleOutlined style={{ marginRight: 12 }} />
          核心功能
        </Title>

        <Row gutter={[24, 24]} className={styles.featuresGrid}>
          {features.map((feature) => (
            <Col xs={24} sm={12} lg={8} key={feature.title}>
              <Card hoverable className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <Title level={4} className={styles.featureTitle}>
                  {feature.title}
                </Title>
                <Paragraph className={styles.featureDesc}>
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 系统特点 */}
      <div className={styles.section} style={{ backgroundColor: "#fafafa" }}>
        <Title level={2} className={styles.sectionTitle}>
          <SafetyOutlined style={{ marginRight: 12 }} />
          系统特点
        </Title>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={14}>
            <div className={styles.characteristicsList}>
              {characteristics.map((item) => (
                <div key={item.title} className={styles.characteristicItem}>
                  <div className={styles.charIndex}>
                    {characteristics.indexOf(item) + 1}
                  </div>
                  <div className={styles.charContent}>
                    <Title level={4}>{item.title}</Title>
                    <Paragraph>{item.desc}</Paragraph>
                  </div>
                </div>
              ))}
            </div>
          </Col>

          <Col xs={24} lg={10}>
            <Card className={styles.overviewCard}>
              <Title level={4} style={{ marginBottom: 24 }}>
                <DesktopOutlined style={{ marginRight: 8 }} />
                系统概述
              </Title>

              <div className={styles.overviewContent}>
                <Paragraph>
                  <Text strong>智能排课管理系统</Text>{" "}
                  是一款专为教育机构设计的课程安排解决方案，
                  集成了先进的排课算法和资源管理功能。
                </Paragraph>

                <Paragraph>
                  系统支持多种排课模式，能够自动处理复杂的约束条件，如：
                </Paragraph>

                <List
                  size="small"
                  dataSource={[
                    "教师时间偏好",
                    "教室容量限制",
                    "课程先后顺序",
                    "专业课程分布",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined
                        style={{ color: "#52c41a", marginRight: 8 }}
                      />
                      {item}
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 适用对象 */}
      <div className={styles.section}>
        <Title level={2} className={styles.sectionTitle}>
          <TeamOutlined style={{ marginRight: 12 }} />
          适用对象
        </Title>

        <div className={styles.targetUsers}>
          {targetUsers.map((user) => (
            <div key={user.name} className={styles.userCard}>
              <div
                className={styles.userIcon}
                style={{ backgroundColor: `var(--ant-${user.color}-1)` }}
              >
                <UserOutlined
                  style={{ fontSize: 32, color: `var(--ant-${user.color}-6)` }}
                />
              </div>
              <Title level={4} style={{ color: `var(--ant-${user.color}-6)` }}>
                {user.name}
              </Title>
              <Paragraph type="secondary">
                适用于{user.name}的课程安排需求
              </Paragraph>
            </div>
          ))}
        </div>
      </div>

      {/* 技术架构 */}
      <div className={styles.section} style={{ backgroundColor: "#f0f5ff" }}>
        <Title level={2} className={styles.sectionTitle}>
          <CloudOutlined style={{ marginRight: 12 }} />
          技术架构
        </Title>

        <div className={styles.techArchitecture}>
          <Steps
            direction="vertical"
            current={-1}
            items={[
              {
                title: "前端界面",
                description: "基于 React + Ant Design 构建，提供优雅的用户体验",
                icon: <DesktopOutlined />,
              },
              {
                title: "业务逻辑",
                description: "智能排课算法与业务规则引擎",
                icon: <ScheduleOutlined />,
              },
              {
                title: "数据处理",
                description: "高效的数据处理与存储机制",
                icon: <BarChartOutlined />,
              },
              {
                title: "系统集成",
                description: "支持与现有教务系统无缝集成",
                icon: <SafetyOutlined />,
              },
            ]}
          />
        </div>
      </div>

      {/* 页脚 */}
    </div>
  );
};

export default WelcomePage;
