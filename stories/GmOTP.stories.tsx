import type { Meta, StoryObj } from '@storybook/react-vite'
import GmOTP from '../goodmom-ui/src/components/GmOTP'

const meta = {
  component: GmOTP,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    length: 6,
    value: '',
    disabled: false,
    onChange: () => {},
    onComplete: () => {},
  },
} satisfies Meta<typeof GmOTP>

export default meta
type Story = StoryObj<typeof meta>

/** 默认 6 位：输入自动跳格、退格回上一格、整串粘贴自动分发。 */
export const Basic: Story = { args: {} }

/** 部分填写：已填格显示数字，焦点自动停在下一空格。 */
export const PartiallyFilled: Story = {
  args: { value: '1234' },
}

/** 禁用：所有格不可编辑。 */
export const Disabled: Story = {
  args: { value: '123456', disabled: true },
}
