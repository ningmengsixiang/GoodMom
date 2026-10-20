import type { Meta, StoryObj } from '@storybook/react-vite'
import GmNumberKeyboard from '../goodmom-ui/src/components/GmNumberKeyboard'

const meta = {
  component: GmNumberKeyboard,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    open: true,
    value: '138',
    maxLength: 0,
    onInput: () => {},
    onDelete: () => {},
    onConfirm: () => {},
    onClose: () => {},
  },
} satisfies Meta<typeof GmNumberKeyboard>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：3×4 键位（1–9、删除、0、完成）；删除/完成挂 is-action 状态类。 */
export const Basic: Story = { args: {} }

/** 限长：maxLength=4 时到上限数字键不再追加。 */
export const Limited: Story = {
  args: { value: '1380', maxLength: 4 },
}

/** 关闭态：open=false 返回 null（不占位、不读屏）。 */
export const Closed: Story = {
  args: { open: false },
}
