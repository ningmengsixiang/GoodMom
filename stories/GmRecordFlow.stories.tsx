import type { Meta, StoryObj } from '@storybook/react-vite'
import GmRecordFlow, { type GmRecordLog } from '../goodmom-ui/src/components/GmRecordFlow'

const FETAL: GmRecordLog[] = [
  { key: 'f1', time: '21:10', value: '32', unit: '次/小时', note: '睡前安静状态' },
  { key: 'f2', time: '14:30', value: '28', unit: '次/小时' },
  { key: 'f3', time: '09:05', value: '30', unit: '次/小时', note: '早餐后' },
]

const FEED: GmRecordLog[] = [
  { key: 'd1', time: '20:40', value: '150', unit: 'ml', note: '配方奶' },
  { key: 'd2', time: '16:10', value: '15', unit: '分钟', note: '母乳 · 左侧' },
  { key: 'd3', time: '08:20', value: '140', unit: 'ml', note: '配方奶' },
]

const meta = {
  component: GmRecordFlow,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    kind: 'fetal',
    logs: FETAL,
    onAdd: () => {},
    onItem: () => {},
  },
} satisfies Meta<typeof GmRecordFlow>

export default meta
type Story = StoryObj<typeof meta>

/** 胎动：列表按时间倒序，每行是 button，点击派发 item(key)。 */
export const Fetal: Story = { args: {} }

/** 喂养：kind 切换标题与图标，56 大圆钮派发 add(kind)。 */
export const Feed: Story = {
  args: { kind: 'feed', logs: FEED },
}

/** 空态：无记录时显示「暂无记录」，快捷记录钮仍可用。 */
export const Empty: Story = {
  args: { kind: 'sleep', logs: [] },
}
