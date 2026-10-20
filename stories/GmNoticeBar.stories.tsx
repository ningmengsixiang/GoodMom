import type { Meta, StoryObj } from '@storybook/react-vite'
import GmNoticeBar from '../goodmom-ui/src/components/GmNoticeBar'

const meta = {
  component: GmNoticeBar,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    text: '您有 2 条随访提醒，请及时处理',
    icon: true,
    closable: true,
    tone: 'info',
    onClose: () => {},
    onClick: () => {},
  },
} satisfies Meta<typeof GmNoticeBar>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：info 语义色 + 图标 + 关闭钮；整条可点，关闭钮只派发 close。 */
export const Basic: Story = { args: {} }

/** warning 语义：tonal 色随 tone 切换，文案超宽单行省略。 */
export const Warning: Story = {
  args: { tone: 'warning', text: '本周随访任务还剩 3 项未完成，请尽快安排' },
}

/** 无图标 / 不可关闭：只读通知。 */
export const NoIconNoClose: Story = {
  args: { icon: false, closable: false, text: '数据每日 06:00 自动同步' },
}
