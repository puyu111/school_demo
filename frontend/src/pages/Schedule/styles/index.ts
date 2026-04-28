// ============================================
// 课程调度系统 - 现代化 UI 样式系统
// 基于 UI-UX Pro Max 设计指南优化
// ============================================

// 设计令牌
const DESIGN_TOKENS = {
  // 主色调 - 教育蓝
  primary: {
    50: '#E8F4FD',
    100: '#BAE0FB',
    200: '#91CAFB',
    300: '#61B4F7',
    400: '#3698F0',
    500: '#1890FF',
    600: '#0E75DD',
    700: '#095DB5',
    800: '#07468C',
    900: '#052D59',
  },
  // 成功色
  success: {
    light: '#95de64',
    main: '#52c41a',
    dark: '#389e0d',
  },
  // 警告色
  warning: {
    light: '#ffd666',
    main: '#faad14',
    dark: '#d48806',
  },
  // 错误色
  error: {
    light: '#ff7875',
    main: '#f5222d',
    dark: '#cf1322',
  },
  // 中性色
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#F0F0F0',
    300: '#D9D9D9',
    400: '#BFBFBF',
    500: '#8C8C8C',
    600: '#595959',
    700: '#434343',
    800: '#262626',
    900: '#141414',
  },
  // 时间段背景色
  timeSlots: {
    morning: 'rgba(230, 247, 255, 0.6)',
    afternoon: 'rgba(255, 247, 219, 0.6)',
    evening: 'rgba(246, 236, 255, 0.6)',
  },
  // 阴影
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.16)',
    hover: '0 8px 24px rgba(24, 144, 255, 0.2)',
  },
  // 圆角
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  // 间距
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
  },
  // 动画
  transitions: {
    fast: 'all 0.15s ease',
    normal: 'all 0.25s ease',
    slow: 'all 0.35s ease',
  },
};

// 课表预览样式
export const schedulePreviewStyles = {
  container: {
    backgroundColor: 'linear-gradient(180deg, #F7F9FC 0%, #F0F2F5 100%)',
    minHeight: '100vh',
    padding: '24px',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #1890FF 0%, #0E75DD 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  scheduleContent: {
    backgroundColor: '#ffffff',
    borderRadius: DESIGN_TOKENS.radius.lg,
    padding: DESIGN_TOKENS.spacing['2xl'],
    marginTop: DESIGN_TOKENS.spacing.lg,
    boxShadow: DESIGN_TOKENS.shadows.md,
    minHeight: '500px',
    border: '1px solid rgba(0,0,0,0.04)',
  },
  footerCard: {
    borderRadius: DESIGN_TOKENS.radius.lg,
    boxShadow: DESIGN_TOKENS.shadows.md,
    border: '1px solid rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: DESIGN_TOKENS.radius.lg,
  },
};

// 统计头部样式
export const statisticsHeaderStyles = {
  card: {
    marginBottom: DESIGN_TOKENS.spacing.lg,
    borderRadius: DESIGN_TOKENS.radius.lg,
    border: '1px solid rgba(0,0,0,0.04)',
    boxShadow: DESIGN_TOKENS.shadows.md,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
  },
  title: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    color: '#ffffff',
    fontWeight: 600,
  },
  icon: {
    marginRight: DESIGN_TOKENS.spacing.sm,
    fontSize: '22px',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '13px',
    marginTop: '4px',
  },
};

// 统计概览卡片样式
export const overviewCardsStyles = {
  row: {
    marginBottom: DESIGN_TOKENS.spacing.lg,
    gutter: [16, 16] as [number, number],
  },
  card: {
    borderRadius: DESIGN_TOKENS.radius.lg,
    textAlign: 'center' as const,
    border: '1px solid rgba(0,0,0,0.04)',
    transition: DESIGN_TOKENS.transitions.normal,
    background: '#ffffff',
  },
  gradientCards: [
    {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
    },
    {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: '#fff',
    },
    {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#fff',
    },
    {
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      color: '#fff',
    },
    {
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      color: '#fff',
    },
    {
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      color: '#333',
    },
  ],
};

// 周视图样式
export const weekScheduleStyles = {
  table: {
    border: '1px solid #f0f0f0',
    borderRadius: DESIGN_TOKENS.radius.md,
    overflow: 'hidden',
  },
  timeSlot: {
    whiteSpace: 'pre-line' as const,
    textAlign: 'center' as const,
    padding: DESIGN_TOKENS.spacing.sm,
  },
  headerGradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
  },
  dayHeader: {
    textAlign: 'center' as const,
    title: {
      fontWeight: 600,
      fontSize: '14px',
    },
    week: {
      fontSize: '11px',
      color: 'rgba(255,255,255,0.9)',
    },
  },
  courseCell: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  empty: {
    textAlign: 'center' as const,
    padding: '40px 0',
    description: {
      fontSize: '16px',
      marginBottom: DESIGN_TOKENS.spacing.sm,
      color: DESIGN_TOKENS.neutral[600],
    },
    hint: {
      color: DESIGN_TOKENS.neutral[400],
      fontSize: '13px',
    },
  },
  todayHighlight: {
    backgroundColor: 'rgba(24, 144, 255, 0.1)',
    borderBottom: '2px solid #1890FF',
  },
};

// 日视图样式
export const dayScheduleStyles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.lg,
    padding: DESIGN_TOKENS.spacing.lg,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    borderRadius: DESIGN_TOKENS.radius.lg,
  },
  container: {
    display: 'flex',
    border: '1px solid DESIGN_TOKENS.neutral[200]',
    borderRadius: DESIGN_TOKENS.radius.lg,
    minHeight: '800px',
    overflow: 'hidden',
  },
  timeColumn: {
    width: '100px',
    flexShrink: 0,
    borderRight: '1px solid #f0f0f0',
    background: DESIGN_TOKENS.neutral[50],
  },
  timeSlot: {
    height: '80px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #f0f0f0',
    transition: DESIGN_TOKENS.transitions.fast,
  },
  courseColumn: {
    flex: 1,
  },
  courseRow: {
    height: '80px',
    padding: DESIGN_TOKENS.spacing.sm,
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
  },
  empty: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: DESIGN_TOKENS.neutral[300],
    fontSize: '14px',
  },
};

// 控制面板样式
export const scheduleControlsStyles = {
  container: {
    marginBottom: DESIGN_TOKENS.spacing.lg,
    padding: DESIGN_TOKENS.spacing.lg,
    backgroundColor: 'rgba(250, 250, 250, 0.8)',
    borderRadius: DESIGN_TOKENS.radius.lg,
    border: '1px solid rgba(0,0,0,0.04)',
  },
  section: {
    display: 'flex',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.md,
  },
  label: {
    fontWeight: 600,
    color: DESIGN_TOKENS.neutral[700],
    fontSize: '14px',
  },
};

// 课程卡片样式 - 现代化设计
export const courseCardStyles = {
  popover: {
    minWidth: '300px',
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.lg,
    boxShadow: DESIGN_TOKENS.shadows.lg,
  },
  popoverRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.sm,
    padding: '6px 0',
  },
  icon: {
    marginRight: DESIGN_TOKENS.spacing.sm,
    fontSize: '16px',
  },
  compact: {
    container: {
      color: '#fff' as const,
      padding: DESIGN_TOKENS.spacing.md,
      borderRadius: DESIGN_TOKENS.radius.md,
      cursor: 'pointer',
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      transition: DESIGN_TOKENS.transitions.normal,
      border: '1px solid rgba(255,255,255,0.3)',
      overflow: 'hidden',
      position: 'relative' as const,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: DESIGN_TOKENS.spacing.xs,
    },
    courseName: {
      fontSize: '14px',
      flex: 1,
      fontWeight: 600,
      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    },
    info: {
      fontSize: '11px',
      opacity: 0.95,
      lineHeight: 1.6,
    },
    badge: {
      position: 'absolute' as const,
      right: DESIGN_TOKENS.spacing.xs,
      bottom: DESIGN_TOKENS.spacing.xs,
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: DESIGN_TOKENS.radius.full,
      background: 'rgba(0,0,0,0.2)',
    },
  },
  hover: {
    transform: 'scale(1.03)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
  full: {
    container: {
      padding: DESIGN_TOKENS.spacing.md,
      borderRadius: DESIGN_TOKENS.radius.md,
      cursor: 'pointer',
      transition: DESIGN_TOKENS.transitions.normal,
      border: '1px solid rgba(0,0,0,0.08)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    info: {
      marginTop: DESIGN_TOKENS.spacing.sm,
      display: 'flex',
      gap: DESIGN_TOKENS.spacing.md,
    },
  },
};

// 统计卡片样式
export const statCardStyles = {
  card: {
    borderRadius: DESIGN_TOKENS.radius.lg,
    boxShadow: DESIGN_TOKENS.shadows.sm,
    border: '1px solid rgba(0,0,0,0.04)',
    transition: DESIGN_TOKENS.transitions.normal,
    background: '#ffffff',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(0,0,0,0.04)',
    transition: DESIGN_TOKENS.transitions.fast,
  },
  statLabel: {
    color: DESIGN_TOKENS.neutral[600],
    fontSize: '14px',
    fontWeight: 500,
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #1890FF 0%, #0E75DD 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  trophy: {
    gold: { color: '#FFD700', icon: '🥇' },
    silver: { color: '#C0C0C0', icon: '🥈' },
    bronze: { color: '#CD7F32', icon: '🥉' },
  },
};

// 导出按钮样式
export const exportStyles = {
  button: {
    borderRadius: DESIGN_TOKENS.radius.md,
    padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.lg}`,
    fontWeight: 500,
    transition: DESIGN_TOKENS.transitions.normal,
  },
  dropdown: {
    borderRadius: DESIGN_TOKENS.radius.md,
    boxShadow: DESIGN_TOKENS.shadows.lg,
    border: '1px solid rgba(0,0,0,0.06)',
  },
};

// 图例样式
export const legendStyles = {
  container: {
    marginTop: DESIGN_TOKENS.spacing.lg,
    padding: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.neutral[50],
    borderRadius: DESIGN_TOKENS.radius.md,
    display: 'flex',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing['2xl'],
    flexWrap: 'wrap' as const,
    border: '1px solid rgba(0,0,0,0.04)',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  swatch: {
    width: '20px',
    height: '20px',
    borderRadius: DESIGN_TOKENS.radius.sm,
    border: '1px solid rgba(0,0,0,0.1)',
  },
  label: {
    fontSize: '13px',
    color: DESIGN_TOKENS.neutral[700],
    fontWeight: 500,
  },
};

// 空状态样式
export const emptyStateStyles = {
  container: {
    marginTop: DESIGN_TOKENS.spacing['2xl'],
    padding: '60px 20px',
    textAlign: 'center' as const,
    backgroundColor: DESIGN_TOKENS.neutral[50],
    borderRadius: DESIGN_TOKENS.radius.xl,
    border: '2px dashed DESIGN_TOKENS.neutral[300]',
  },
  icon: {
    fontSize: '72px',
    marginBottom: DESIGN_TOKENS.spacing.lg,
    opacity: 0.6,
  },
  title: {
    fontSize: '18px',
    color: DESIGN_TOKENS.neutral[600],
    marginBottom: DESIGN_TOKENS.spacing.sm,
    fontWeight: 600,
  },
  description: {
    fontSize: '14px',
    color: DESIGN_TOKENS.neutral[400],
  },
};

// 响应式断点
export const breakpoints = {
  mobile: '@media (max-width: 768px)',
  tablet: '@media (min-width: 769px) and (max-width: 1024px)',
  desktop: '@media (min-width: 1025px)',
};

// 动画关键帧（用于 CSS-in-JS 需转换为 style 标签）
export const animations = {
  fadeIn: {
    from: { opacity: 0, transform: 'translateY(-10px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  slideIn: {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
};
