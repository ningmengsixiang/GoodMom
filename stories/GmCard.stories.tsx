import type { Meta, StoryObj } from '@storybook/react-vite'
import GmCard from '../goodmom-ui/src/components/GmCard'

const meta = {
  component: GmCard,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmCard>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: { title: '本周随访', extra: '共 12 人', children: <p style={{ margin: 0 }}>待随访 8 · 已完成 4</p> },
}

export const TitleOnly: Story = {
  args: { title: '产检计划', children: <p style={{ margin: 0 }}>下次产检：孕 24 周 + 2 天</p> },
}

export const BodyOnly: Story = {
  args: { children: <p style={{ margin: 0 }}>无标题玻璃卡片，用于承载自定义内容。</p> },
}

/** 圆角默认 22（02 · 2.4 常规卡片），可按门店/嵌套层级覆写 */
export const Radii: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ width: 220 }}><GmCard title="默认 22" radius={22}>半径 22</GmCard></div>
      <div style={{ width: 220 }}><GmCard title="大卡 28" radius={28}>半径 28</GmCard></div>
      <div style={{ width: 220 }}><GmCard title="小卡 16" radius={16}>半径 16</GmCard></div>
    </div>
  ),
}
