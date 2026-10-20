import type { Meta, StoryObj } from '@storybook/react-vite'
import GmVaccinePlan, { type GmVaccineItem } from '../goodmom-ui/src/components/GmVaccinePlan'

const ITEMS: GmVaccineItem[] = [
  { key: 'v1', name: '乙肝疫苗', dose: '第 1 剂', monthAge: 0, dueDate: '2025-06-18', status: '已完成', tone: 'positive' },
  { key: 'v2', name: '卡介苗', dose: '第 1 剂', monthAge: 0, dueDate: '2025-06-18', status: '已完成', tone: 'positive' },
  { key: 'v3', name: '脊灰疫苗', dose: '第 2 剂', monthAge: 3, dueDate: '2025-09-18', status: '已预约', tone: 'info' },
  { key: 'v4', name: '百白破疫苗', dose: '第 1 剂', monthAge: 3, dueDate: '2025-09-18', status: '可接种', tone: 'attention' },
]

const DELAYED: GmVaccineItem[] = [
  { key: 'd1', name: '麻腮风疫苗', dose: '第 1 剂', monthAge: 8, dueDate: '2026-02-18', status: '延后 · 发热暂缓', tone: 'risk' },
  { key: 'd2', name: '乙脑疫苗', dose: '第 1 剂', monthAge: 8, dueDate: '2026-03-04', status: '未到时间', tone: 'neutral' },
]

const meta = {
  component: GmVaccinePlan,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    items: ITEMS,
    onItem: () => {},
  },
} satisfies Meta<typeof GmVaccinePlan>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：按月龄时间线，徽章 + 名称/剂次 + 月龄·日期 + 状态文字。 */
export const Basic: Story = { args: {} }

/** 延后：risk/attention 只改状态色，延后原因由状态文案承载。 */
export const Delayed: Story = {
  args: { items: DELAYED },
}
