import type { Meta, StoryObj } from '@storybook/react-vite'
import GmCapsuleTabs, { type GmCapsuleTabItem } from '../goodmom-ui/src/components/GmCapsuleTabs'

const ITEMS: GmCapsuleTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'risk', label: '高危', badge: 3 },
  { key: 'follow', label: '随访中' },
  { key: 'done', label: '已完成' },
]

const MANY_ITEMS: GmCapsuleTabItem[] = [
  { key: 'm1', label: '孕产' },
  { key: 'm2', label: '儿保' },
  { key: 'm3', label: '康复' },
  { key: 'm4', label: '营养' },
  { key: 'm5', label: '心理' },
  { key: 'm6', label: '疫苗' },
  { key: 'm7', label: '宣教' },
  { key: 'm8', label: '档案' },
]

const meta = {
  component: GmCapsuleTabs,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    items: ITEMS,
    value: 'all',
    onChange: () => {},
  },
} satisfies Meta<typeof GmCapsuleTabs>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：role=tablist/tab + aria-selected；←/→/Home/End 移动并切换。 */
export const Basic: Story = { args: {} }

/** 角标态：激活项挂白玻璃胶囊 + 玫瑰描边 + 上浮 2px（CSS）。 */
export const WithBadge: Story = {
  args: { value: 'risk' },
}

/** 多标签：横滑容器，超出 375 宽度可横滑（不换行）。 */
export const ManyItems: Story = {
  args: { items: MANY_ITEMS, value: 'm3' },
}
