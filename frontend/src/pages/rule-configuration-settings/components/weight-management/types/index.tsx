export interface RuleCategory {
  key: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

export interface RuleWeight {
  id: string;
  category: string;
  name: string;
  description?: string;
  defaultWeight: number;
  currentWeight: number;
  minWeight: number;
  maxWeight: number;
  enabled: boolean;
}

export interface WeightPreset {
  id: string;
  name: string;
  description: string;
}

export interface WeightChangeRecord {
  id: string;
  ruleId: string;
  ruleName: string;
  oldValue: number;
  newValue: number;
  time: string;
}

export interface PieChartData {
  name: string;
  value: number;
}

export interface BarChartData {
  name: string;
  当前权重: number;
  默认权重: number;
  category: string;
  color: string;
}
