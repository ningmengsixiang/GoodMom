import type { Meta, StoryObj } from '@storybook/react-vite'
import GmActionSheet, { type GmActionSheetItem } from '../goodmom-ui/src/components/GmActionSheet'

const ITEMS: GmActionSheetItem[] = [
  { key: 'call', label: '拨打电话' },
  { key: 'sms', label: '发送短信' },
  { key: 'referral', label: '转诊登记' },
]

const DANGER_ITEMS: GmActionSheetItem[] = [
  { key: 'archive', label: '归档档案' },
  { key: 'delete', label: '删除档案', danger: true },
  { key: 'transfer', label: '转出（需上级审批）', danger: true, disabled: true },
]

const meta = {
  component: GmActionSheet,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    open: true,
    title: '选择操作',
    items: ITEMS,
    cancelText: '取消',
    maskClosable: true,
    onSelect: () => {},
    onClose: () => {},
  },
} satisfies Meta<typeof GmActionSheet>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：标题 + 三条操作 + 独立取消行；操作行派发 select。 */
export const Basic: Story = { args: {} }

/** 危险/禁用：danger 走风险语义色，disabled 走原生 disabled（不可聚焦）。 */
export const DangerDisabled: Story = {
  args: { title: '危险操作', items: DANGER_ITEMS },
}

/** 无标题：对话框可访问名回退为「操作」。 */
export const NoTitle: Story = {
  args: { title: '' },
}
