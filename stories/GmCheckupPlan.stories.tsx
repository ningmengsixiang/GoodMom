import type { Meta, StoryObj } from '@storybook/react-vite'
import GmCheckupPlan, { type GmCheckupItem } from '../goodmom-ui/src/components/GmCheckupPlan'

const ITEMS: GmCheckupItem[] = [
  { key: 'c1', week: 12, title: 'NT 检查 · 建档', date: '2026-05-18', status: '已完成', tone: 'positive' },
  { key: 'c2', week: 20, title: '大排畸超声', date: '2026-07-06', status: '已完成', tone: 'positive' },
  { key: 'c3', week: 24, title: '糖耐量筛查', date: '2026-08-17', status: '待预约', tone: 'attention' },
  { key: 'c4', week: 30, title: '常规产检', date: '2026-09-28', status: '未到时间', tone: 'neutral' },
]

const ABNORMAL: GmCheckupItem[] = [
  { key: 'a1', week: 28, title: '血压复测', date: '2026-10-21', status: '需复查 · 血压偏高', tone: 'risk' },
  { key: 'a2', week: 32, title: '胎心监护', date: '2026-11-04', status: '建议加做', tone: 'attention' },
]

const meta = {
  component: GmCheckupPlan,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    items: ITEMS,
    onItem: () => {},
  },
} satisfies Meta<typeof GmCheckupPlan>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：竖版时间线，周数徽章 + 项目 + 日期 + 状态，整行可点。 */
export const Basic: Story = { args: {} }

/** 异常节点：data-tone 换状态色，但「需复查 / 建议加做」文字仍是主要通道。 */
export const WithAbnormal: Story = {
  args: { items: ABNORMAL },
}
