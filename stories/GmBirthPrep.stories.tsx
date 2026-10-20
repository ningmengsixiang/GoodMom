import type { Meta, StoryObj } from '@storybook/react-vite'
import GmBirthPrep, { type GmBirthPrepItem } from '../goodmom-ui/src/components/GmBirthPrep'

const ITEMS: GmBirthPrepItem[] = [
  { key: 'b1', label: '待产包（证件 / 衣物 / 洗漱）', done: true, note: '已放玄关' },
  { key: 'b2', label: '生育服务单 / 医保卡', done: true },
  { key: 'b3', label: '预约入院床位', done: false, note: '孕 38 周前完成' },
  { key: 'b4', label: '产后随访联系人', done: false },
]

const meta = {
  component: GmBirthPrep,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    items: ITEMS,
    onToggle: () => {},
  },
} satisfies Meta<typeof GmBirthPrep>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：原生 checkbox 语义，done 行删除线/弱化，切换派发 toggle(key, next)。 */
export const Basic: Story = { args: {} }

/** 全部完成：所有行都带 is-done / data-done。 */
export const AllDone: Story = {
  args: { items: ITEMS.map((item) => ({ ...item, done: true })) },
}

/** 无备注：只显示勾选钮与文案，≤3 行内不折叠。 */
export const NoNotes: Story = {
  args: { items: ITEMS.map((item) => ({ ...item, note: undefined })) },
}
