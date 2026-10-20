import type { Meta, StoryObj } from '@storybook/react-vite'
import GmSwipeAction, { type GmSwipeActionItem } from '../goodmom-ui/src/components/GmSwipeAction'

const ACTIONS: GmSwipeActionItem[] = [
  { key: 'read', label: '已读' },
  { key: 'archive', label: '归档' },
  { key: 'delete', label: '删除', danger: true },
]

const MANY_ACTIONS: GmSwipeActionItem[] = [
  { key: 'read', label: '已读' },
  { key: 'archive', label: '归档' },
  { key: 'transfer', label: '转诊' },
  { key: 'delete', label: '删除', danger: true },
  { key: 'more', label: '更多' },
]

const Row = ({ title, sub }: { title: string; sub: string }) => (
  <div style={{ padding: '14px 20px' }}>
    <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
    <div style={{ fontSize: 14, opacity: 0.65 }}>{sub}</div>
  </div>
)

const meta = {
  component: GmSwipeAction,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    actions: ACTIONS,
    onAction: () => {},
    children: <Row title="王立" sub="孕 24 周 + 2 天 · 产科" />,
  },
} satisfies Meta<typeof GmSwipeAction>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：横向拖拽 >8px 才拦截，松手过半贴靠展开；danger 操作走风险色。 */
export const Basic: Story = { args: {} }

/** 最多 3 项：actions 超过 3 个时只渲染前 3 个（此处传 5 个，仅前 3 个露出）。 */
export const LimitedToThree: Story = {
  args: { actions: MANY_ACTIONS },
}

/** 收起态：操作钮不进 Tab 序列（tabIndex=-1 + aria-hidden），展开后才可键盘操作。 */
export const Closed: Story = {
  args: { children: <Row title="李安安" sub="18 月龄 · 儿保" /> },
}
