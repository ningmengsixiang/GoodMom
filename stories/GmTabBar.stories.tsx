import type { Meta, StoryObj } from '@storybook/react-vite'
import GmTabBar, { type GmTabBarItem } from '../goodmom-ui/src/components/GmTabBar'

const ITEMS: GmTabBarItem[] = [
  { key: 'home', label: '首页' },
  { key: 'archive', label: '档案' },
  { key: 'follow', label: '随访', badge: 3 },
  { key: 'me', label: '我的' },
]

const meta = {
  component: GmTabBar,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    items: ITEMS,
    value: 'home',
    safeArea: true,
    onChange: () => {},
  },
} satisfies Meta<typeof GmTabBar>

export default meta
type Story = StoryObj<typeof meta>

/** 默认 4 项：激活项玫瑰渐变胶囊 + 上浮，方向键可在项间移动并切换。 */
export const Basic: Story = { args: {} }

/** 角标态：badge 支持数字与短文案，空值不渲染。 */
export const WithBadge: Story = {
  args: { value: 'follow' },
}

/** 关闭底部安全区：贴底布局（safeArea 默认 true）。 */
export const SafeAreaOff: Story = {
  args: { value: 'archive', safeArea: false },
}
