import type { Meta, StoryObj } from '@storybook/react-vite'
import GmNavBar from '../goodmom-ui/src/components/GmNavBar'

const meta = {
  component: GmNavBar,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    title: '孕期档案',
    back: true,
    backLabel: '返回',
    scrolled: false,
    sticky: true,
    onBack: () => {},
  },
} satisfies Meta<typeof GmNavBar>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：吸顶 + 返回钮，标题 18/600 单行省略。 */
export const Basic: Story = { args: {} }

/** 滚动态：页面滚动 120px 后把 scrolled 置 true，玻璃底与描边由状态类切换。 */
export const Scrolled: Story = {
  args: { title: '随访记录', scrolled: true },
}

/** 无返回钮：一级页面只用标题，sticky 仍默认开启。 */
export const NoBack: Story = {
  args: { title: '个人中心', back: false },
}
