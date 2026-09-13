/**
 * 断点（10.2 收敛规则）：只允许 767 / 1024 / 1366 三档。
 * 组件里不要写魔法数字，一律读这里或 CSS 媒体查询。
 */
export const BP = { mobile: 767, tablet: 1023, desktop: 1024, wide: 1366 } as const;

export const MQ = {
  mobile: `(max-width:${BP.mobile}px)`,
  desktop: `(min-width:${BP.desktop}px)`,
  wide: `(min-width:${BP.wide}px)`,
} as const;
