import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import GmButton from '../goodmom-ui/src/components/GmButton'

const meta = {
  component: GmButton,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmButton>

export default meta
type Story = StoryObj<typeof meta>

/** 主行动。play 断言 Arco 的 type→class 映射真的落到 DOM 上（渲染本身证明不了这点）。 */
export const Primary: Story = {
  args: { type: 'primary', children: '开始随访' },
  play: async ({ canvas }) => {
    const btn = canvas.getByRole('button', { name: '开始随访' })
    await expect(btn.className).toContain('gm-btn')
    await expect(btn.className).toContain('arco-btn-primary')
  },
}

/**
 * 全项目唯一的 CssCheck：证明共享 preview 真的加载了设计系统根样式。
 * 取值来源 goodmom-ui/src/theme.css:20 `.gm-btn.arco-btn-primary{color:#343A46 !important}`
 * （D9 裁决：品牌粉底必须配深字）。若根样式没加载，Arco 默认是白字。
 */
export const CssCheck: Story = {
  args: { type: 'primary', children: '提交' },
  play: async ({ canvas }) => {
    const btn = canvas.getByRole('button', { name: '提交' })
    await expect(getComputedStyle(btn).color).toBe('rgb(52, 58, 70)')
  },
}

export const Secondary: Story = { args: { type: 'secondary', children: '取消' } }
export const Outline: Story = { args: { type: 'outline', children: '导出' } }
export const Large: Story = { args: { type: 'primary', size: 'large', children: '大按钮' } }
export const Long: Story = { args: { type: 'primary', long: true, children: '全宽主行动' } }
export const Danger: Story = { args: { type: 'primary', status: 'danger', children: '删除档案' } }
export const Disabled: Story = { args: { type: 'primary', disabled: true, children: '不可用' } }
