import type { Meta, StoryObj } from '@storybook/react-vite'
import GmStepper from '../goodmom-ui/src/components/GmStepper'

const meta = {
  component: GmStepper,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    value: 2,
    min: 0,
    max: 99,
    step: 1,
    disabled: false,
    onChange: () => {},
  },
} satisfies Meta<typeof GmStepper>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：点按或长按连发步进（首动 200ms 后每 60ms 一次），↑/↓ 键盘等价。 */
export const Basic: Story = { args: {} }

/** 下边界：value 等于 min 时减少钮原生 disabled（上边界同理在 value>=max 时禁用增加钮）。 */
export const AtMin: Story = {
  args: { value: 0 },
}

/** 禁用：整体 disabled，数值仍可读。 */
export const Disabled: Story = {
  args: { disabled: true },
}
