import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import GmButton from '../goodmom-ui/src/components/GmButton'
import GmButtonGroup from '../goodmom-ui/src/components/GmButtonGroup'

const meta = {
  component: GmButtonGroup,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

/** attached（默认）：兄弟相连，首左末右保留外圆角，中间直角共享边。 */
export const Attached: Story = {
  args: { ariaLabel: '导出选项' },
  render: (args) => (
    <GmButtonGroup {...args}>
      <GmButton type="secondary">今日</GmButton>
      <GmButton type="secondary">本周</GmButton>
      <GmButton type="secondary">本月</GmButton>
    </GmButtonGroup>
  ),
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group')
    await expect(group.className).toContain('gm-btn-group')
    await expect(group.className).not.toContain('gm-btn-group--segmented')
  },
}

/** round：两端全圆角胶囊组。 */
export const Round: Story = {
  args: { shape: 'round', ariaLabel: '时间范围' },
  render: (args) => (
    <GmButtonGroup {...args}>
      <GmButton type="outline">日</GmButton>
      <GmButton type="outline">周</GmButton>
      <GmButton type="outline">月</GmButton>
    </GmButtonGroup>
  ),
}

/**
 * segmented：分段控件 —— 多选一，用 radio 语义（`role="radiogroup"` +
 * `role="radio"` + `aria-checked`），键盘 ←/→/Home/End 移动并激活。
 * 这里用受控写法演示正确的语义组合。
 */
export const Segmented: Story = {
  args: { shape: 'segmented', ariaLabel: '视图切换' },
  render: () => {
    const items = ['列表', '看板', '日历']
    return (
      <GmButtonGroup shape="segmented" ariaLabel="视图切换">
        {items.map((t, i) => (
          <GmButton
            key={t}
            type="default"
            role="radio"
            aria-checked={i === 0}
            tabIndex={i === 0 ? 0 : -1}
          >
            {t}
          </GmButton>
        ))}
      </GmButtonGroup>
    )
  },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('radiogroup')
    await expect(group.className).toContain('gm-btn-group--segmented')
    const radios = canvas.getAllByRole('radio')
    await expect(radios.length).toBe(3)
    await expect(radios[0].getAttribute('aria-checked')).toBe('true')
  },
}
