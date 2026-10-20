import type { Meta, StoryObj } from '@storybook/react-vite'
import GmChildCheckup, { type GmChildCheckupItem } from '../goodmom-ui/src/components/GmChildCheckup'

const ITEMS: GmChildCheckupItem[] = [
  { key: 'k1', monthAge: 1, date: '2026-07-18', status: '已完成', tone: 'positive', summary: '身高 54cm · 体重 4.6kg · 头围 37cm' },
  { key: 'k2', monthAge: 6, date: '2026-12-18', status: '已完成', tone: 'positive', summary: '身高 68cm · 体重 8.2kg · 头围 43cm' },
  { key: 'k3', monthAge: 12, date: '2027-06-18', status: '未到时间', tone: 'neutral' },
]

const ABNORMAL: GmChildCheckupItem[] = [
  { key: 'a1', monthAge: 9, date: '2027-03-18', status: '需复查 · 生长偏缓', tone: 'attention', summary: '身高 70cm · 体重 8.4kg' },
  { key: 'a2', monthAge: 18, date: '2027-12-18', status: '建议转诊', tone: 'risk', summary: '身高 78cm · 体重 10.1kg' },
]

const meta = {
  component: GmChildCheckup,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    items: ITEMS,
    onItem: () => {},
  },
} satisfies Meta<typeof GmChildCheckup>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：月龄节点轴，已完成行显示调用方拼好的身高/体重/头围摘要。 */
export const Basic: Story = { args: {} }

/** 异常节点：data-tone + 状态文字双通道，颜色不单独承担语义。 */
export const WithAbnormal: Story = {
  args: { items: ABNORMAL },
}

/** 无摘要：只显示体检日期。 */
export const WithoutSummary: Story = {
  args: { items: ITEMS.map((item) => ({ ...item, summary: undefined })) },
}
