import type { Meta, StoryObj } from '@storybook/react-vite'
import GmCell from '../goodmom-ui/src/components/GmCell'

const meta = {
  component: GmCell,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    title: '孕期档案',
    desc: '末次随访 10 月 12 日',
    value: '查看',
    chevron: true,
    danger: false,
    disabled: false,
    href: '',
    onClick: () => {},
  },
} satisfies Meta<typeof GmCell>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：button 语义，点击派发 click；行高 ≥52。 */
export const Basic: Story = { args: {} }

/** 链接态：传 href 渲染真链接，可复制 / 新窗口打开。 */
export const Link: Story = {
  args: { href: '#archive', title: '查看完整档案', desc: '', value: '' },
}

/** 破坏性 + 禁用：danger 走风险语义色，disabled 走原生禁用。 */
export const DisabledDanger: Story = {
  args: { title: '删除档案', desc: '删除后不可恢复', value: '', danger: true, disabled: true },
}
