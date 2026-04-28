import {
  BarChartOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PieChartOutlined,
  SaveOutlined,
  SettingOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Modal,
  message,
  Row,
  Space,
  Tabs,
} from 'antd';
import React, { useEffect, useState } from 'react';
import CustomBarChart from './components/CustomBarChart';
import CustomPieChart from './components/CustomPieChart';
// 导入子组件
import RuleCategorySidebar from './components/RuleCategorySidebar';
import RuleWeightTable from './components/RuleWeightTable';
import StatisticsPanel from './components/StatisticsPanel';
import WeightHistoryTable from './components/WeightHistoryTable';
import WeightPresetCard from './components/WeightPresetCard';
import { defaultRuleWeights } from './constants/defaultRuleWeights';
// 导入常量和类型
import { ruleCategories } from './constants/ruleCategories';
import { weightPresets } from './constants/weightPresets';
import type { RuleWeight, WeightChangeRecord } from './types';

const { TabPane } = Tabs;

const RuleWeightManagement: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [ruleWeights, setRuleWeights] =
    useState<RuleWeight[]>(defaultRuleWeights);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('balanced');
  const [weightChangeHistory, setWeightChangeHistory] = useState<
    WeightChangeRecord[]
  >([]);
  const [resetModalVisible, setResetModalVisible] = useState<boolean>(false);

  // 计算总权重
  useEffect(() => {
    const total = ruleWeights
      .filter((rule) => rule.enabled)
      .reduce((sum, rule) => sum + rule.currentWeight, 0);
    setTotalWeight(total);
  }, [ruleWeights]);

  // 获取当前分类的规则
  const getFilteredRules = (): RuleWeight[] => {
    if (activeCategory === 'all') {
      return ruleWeights;
    }
    return ruleWeights.filter((rule) => rule.category === activeCategory);
  };

  // 处理权重变化
  const handleWeightChange = (id: string, value: number) => {
    const updatedRules = ruleWeights.map((rule) => {
      if (rule.id === id) {
        return { ...rule, currentWeight: value };
      }
      return rule;
    });
    setRuleWeights(updatedRules);

    // 记录变更历史
    const rule = ruleWeights.find((r) => r.id === id);
    if (rule) {
      setWeightChangeHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ruleId: id,
          ruleName: rule.name,
          oldValue: rule.currentWeight,
          newValue: value,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  // 处理启用/禁用规则
  const handleToggleRule = (id: string, enabled: boolean) => {
    const updatedRules = ruleWeights.map((rule) => {
      if (rule.id === id) {
        return { ...rule, enabled };
      }
      return rule;
    });
    setRuleWeights(updatedRules);
  };

  // 应用预设权重
  const applyWeightPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    let updatedRules = [...ruleWeights];

    switch (presetId) {
      case 'teacher-first':
        updatedRules = updatedRules.map((rule) => {
          if (rule.category === 'teacher') {
            return {
              ...rule,
              currentWeight: Math.min(rule.maxWeight, rule.defaultWeight + 5),
            };
          } else if (rule.category === 'resource') {
            return {
              ...rule,
              currentWeight: Math.max(rule.minWeight, rule.defaultWeight - 3),
            };
          }
          return rule;
        });
        break;
      case 'resource-first':
        updatedRules = updatedRules.map((rule) => {
          if (rule.category === 'resource') {
            return {
              ...rule,
              currentWeight: Math.min(rule.maxWeight, rule.defaultWeight + 6),
            };
          } else if (rule.category === 'teacher') {
            return {
              ...rule,
              currentWeight: Math.max(rule.minWeight, rule.defaultWeight - 2),
            };
          }
          return rule;
        });
        break;
      case 'course-first':
        updatedRules = updatedRules.map((rule) => {
          if (rule.category === 'course') {
            return {
              ...rule,
              currentWeight: Math.min(rule.maxWeight, rule.defaultWeight + 4),
            };
          } else if (rule.category === 'time') {
            return {
              ...rule,
              currentWeight: Math.max(rule.minWeight, rule.defaultWeight - 3),
            };
          }
          return rule;
        });
        break;
      default:
        updatedRules = updatedRules.map((rule) => ({
          ...rule,
          currentWeight: rule.defaultWeight,
        }));
        break;
    }

    setRuleWeights(updatedRules);
    message.success(
      `已应用${weightPresets.find((p) => p.id === presetId)?.name}预设`,
    );
  };

  // 保存权重设置
  const saveWeightSettings = () => {
    // 在实际应用中，这里应该调用API保存到后端
    message.success('权重设置已保存');
    setIsEditing(false);
  };

  // 重置为默认值
  const resetToDefaults = () => {
    setRuleWeights(defaultRuleWeights);
    setSelectedPreset('balanced');
    setResetModalVisible(false);
    message.info('已重置为默认权重设置');
  };

  // 重置单个规则
  const handleResetRule = (id: string, defaultWeight: number) => {
    handleWeightChange(id, defaultWeight);
  };

  // 获取分类颜色
  const getCategoryColor = (categoryKey: string): string => {
    const category = ruleCategories.find((c) => c.key === categoryKey);
    return category ? category.color : '#d9d9d9';
  };

  // 准备饼图数据
  const preparePieData = () => {
    const categoryTotals: Record<string, number> = {};

    ruleWeights.forEach((rule) => {
      if (rule.enabled) {
        if (!categoryTotals[rule.category]) {
          categoryTotals[rule.category] = 0;
        }
        categoryTotals[rule.category] += rule.currentWeight;
      }
    });

    return Object.keys(categoryTotals).map((categoryKey) => {
      const category = ruleCategories.find((c) => c.key === categoryKey);
      const value = categoryTotals[categoryKey];

      return {
        name: category ? category.name : categoryKey,
        value,
      };
    });
  };

  // 准备柱状图数据
  const prepareColumnData = () => {
    return ruleWeights
      .filter((rule) => rule.enabled)
      .map((rule) => {
        const category = ruleCategories.find((c) => c.key === rule.category);
        return {
          name: rule.name,
          当前权重: rule.currentWeight,
          默认权重: rule.defaultWeight,
          category: category ? category.name : rule.category,
          color: getCategoryColor(rule.category),
        };
      });
  };

  // 计算各分类规则数量
  // 计算各分类规则数量
  const calculateRuleCounts = (): Record<string, number> => {
    const counts: Record<string, number> = {};

    // 初始化所有分类
    ruleCategories.forEach((category) => {
      counts[category.key] = 0;
    });

    // 统计启用的规则
    ruleWeights.forEach((rule) => {
      if (rule.enabled && counts[rule.category] !== undefined) {
        counts[rule.category]++;
      }
    });

    return counts;
  };

  const ruleCounts = calculateRuleCounts();

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SettingOutlined style={{ marginRight: '8px' }} />
                <span>排课系统软规则权重占比管理</span>
              </div>
            }
            extra={
              <Space>
                <Button
                  icon={<UndoOutlined />}
                  onClick={() => setResetModalVisible(true)}
                >
                  重置
                </Button>
                {!isEditing ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                  >
                    编辑权重
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => setIsEditing(false)}>取消</Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={saveWeightSettings}
                    >
                      保存设置
                    </Button>
                  </>
                )}
              </Space>
            }
          >
            <Alert
              message={
                <div>
                  <InfoCircleOutlined style={{ marginRight: '8px' }} />
                  <span>
                    软规则权重决定了排课算法中各项规则的优先级。总权重越高，该规则对排课结果的影响越大。当前总权重：
                  </span>
                  <span
                    style={{
                      fontWeight: 'bold',
                      color:
                        totalWeight === 100
                          ? '#52c41a'
                          : totalWeight > 100
                            ? '#fa8c16'
                            : '#1890ff',
                    }}
                  >
                    {totalWeight}%
                  </span>
                  {totalWeight > 100 && (
                    <span style={{ color: '#fa8c16', marginLeft: '8px' }}>
                      (总权重已超过100%，可能影响算法平衡)
                    </span>
                  )}
                </div>
              }
              type="info"
              showIcon={false}
              style={{ marginBottom: '16px' }}
            />

            <Row gutter={16}>
              <Col span={6}>
                <WeightPresetCard
                  selectedPreset={selectedPreset}
                  onPresetChange={applyWeightPreset}
                />

                <RuleCategorySidebar
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  ruleCounts={ruleCounts}
                />
              </Col>

              <Col span={18}>
                <Tabs defaultActiveKey="management">
                  <TabPane tab="权重管理" key="management">
                    <RuleWeightTable
                      data={getFilteredRules()}
                      isEditing={isEditing}
                      onWeightChange={handleWeightChange}
                      onToggleRule={handleToggleRule}
                      onResetRule={handleResetRule}
                    />
                  </TabPane>
                  <TabPane tab="权重分布" key="distribution">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Card
                          title={
                            <div
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              <PieChartOutlined
                                style={{ marginRight: '8px' }}
                              />
                              权重分类占比
                            </div>
                          }
                          size="small"
                        >
                          <CustomPieChart websiteData={preparePieData()} />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card
                          title={
                            <div
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              <BarChartOutlined
                                style={{ marginRight: '8px' }}
                              />
                              规则权重对比
                            </div>
                          }
                          size="small"
                        >
                          <CustomBarChart data={prepareColumnData()} />
                        </Card>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tab="权重历史" key="history">
                    <WeightHistoryTable
                      data={weightChangeHistory.slice(-10).reverse()}
                    />
                  </TabPane>
                </Tabs>
              </Col>
            </Row>

            <Divider />

            <StatisticsPanel
              totalWeight={totalWeight}
              enabledRuleCount={ruleWeights.filter((r) => r.enabled).length}
              totalRuleCount={ruleWeights.length}
              weightChangeCount={weightChangeHistory.length}
            />
          </Card>
        </Col>
      </Row>

      {/* 重置确认模态框 */}
      <Modal
        title="重置权重设置"
        open={resetModalVisible}
        onOk={resetToDefaults}
        onCancel={() => setResetModalVisible(false)}
        okText="确认重置"
        cancelText="取消"
      >
        <Alert
          message="此操作将把所有规则权重恢复为默认值，是否继续？"
          type="warning"
          showIcon
        />
      </Modal>

      <style>
        {`
          .disabled-row {
            background-color: #f5f5f5;
            color: #999;
          }
          .disabled-row .ant-switch {
            opacity: 0.6;
          }
          .ant-table-row.disabled-row:hover td {
            background-color: #f5f5f5 !important;
          }
        `}
      </style>
    </div>
  );
};

export default RuleWeightManagement;
