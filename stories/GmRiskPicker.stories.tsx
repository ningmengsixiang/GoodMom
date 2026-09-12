import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import GmRiskPicker from '../goodmom-ui/src/components/GmRiskPicker'

const meta = {
  component: GmRiskPicker,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmRiskPicker>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 键盘可达性（D 审查 P0-2）：方向键必须把选择推进到下一档并同步移动焦点。
 * 这是组件自身的可访问性契约，单看渲染结果无法证明。
 */
export const KeyboardNavigation: Story = {
  args: { value: 'm1', onChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const m1 = canvas.getByRole('radio', { name: '绿 · 低风险' })
    await userEvent.click(m1)
    await userEvent.keyboard('{ArrowRight}')
    await expect(args.onChange).toHaveBeenCalledWith('m2')
    await expect(document.activeElement).toBe(canvas.getByRole('radio', { name: '黄 · 一般风险' }))
  },
}

/** End 键应直接跳到最后一档（五色分级的末级） */
export const JumpToLast: Story = {
  args: { value: 'm1', onChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('radio', { name: '绿 · 低风险' }))
    await userEvent.keyboard('{End}')
    await expect(args.onChange).toHaveBeenCalledWith('m5')
  },
}

/** 未选中项不进 Tab 序列，选中项独占 tabindex=0（radiogroup 规范行为） */
export const RovingTabIndex: Story = {
  args: { value: 'm3' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: '橙 · 较高风险' }).getAttribute('tabindex')).toBe('0')
    await expect(canvas.getByRole('radio', { name: '绿 · 低风险' }).getAttribute('tabindex')).toBe('-1')
  },
}

export const Selected: Story = { args: { value: 'm4' } }
export const Disabled: Story = { args: { value: 'm2', disabled: true } }
