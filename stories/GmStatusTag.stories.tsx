import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import GmStatusTag from '../goodmom-ui/src/components/GmStatusTag'

const meta = {
  component: GmStatusTag,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmStatusTag>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 双通道校验（14 · 4.4.5 / 15.5）：色点必须取语义单源映射的真实色值。
 * #2F8F76 来自 goodmom-ui/src/tokens/status.ts SEMANTIC_COLOR.positive。
 */
export const SemanticDotIsSingleSourced: Story = {
  args: { children: '已完成', semantic: 'positive' },
  play: async ({ canvasElement }) => {
    const dot = canvasElement.querySelector('.gm-status-dot')
    await expect(dot).not.toBeNull()
    await expect(getComputedStyle(dot as Element).backgroundColor).toBe('rgb(47, 143, 118)')
  },
}

export const Semantics: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <GmStatusTag semantic="positive">已完成</GmStatusTag>
      <GmStatusTag semantic="info">随访中</GmStatusTag>
      <GmStatusTag semantic="attention">待复查</GmStatusTag>
      <GmStatusTag semantic="risk">已转诊</GmStatusTag>
      <GmStatusTag semantic="neutral">未开始</GmStatusTag>
      <GmStatusTag semantic="special">重点管理</GmStatusTag>
    </div>
  ),
}

/** 孕产妇五色分级（02 · 2.10）——只在妊娠风险语境使用 */
export const FiveLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <GmStatusTag five="m1">绿 · 低风险</GmStatusTag>
      <GmStatusTag five="m2">黄 · 一般风险</GmStatusTag>
      <GmStatusTag five="m3">橙 · 较高风险</GmStatusTag>
      <GmStatusTag five="m4">红 · 高风险</GmStatusTag>
      <GmStatusTag five="m5">紫 · 合并传染病</GmStatusTag>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <GmStatusTag size="small" semantic="positive">small</GmStatusTag>
      <GmStatusTag size="default" semantic="positive">default</GmStatusTag>
      <GmStatusTag size="large" semantic="positive">large</GmStatusTag>
    </div>
  ),
}
