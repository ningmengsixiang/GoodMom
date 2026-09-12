import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import GmButton from '../goodmom-ui/src/components/GmButton'

const meta = {
  component: GmButton,
  tags: ['ai-generated'],
  args: { children: '开始随访' },
} satisfies Meta<typeof GmButton>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 主行动 —— 03 · 3.2.4「品牌粉底 + 深字」（D9）。
 * play 断言两件事：① 契约类名真的落到 DOM 上（渲染本身证明不了命名契约）；
 * ② 字色是深字而不是白字（白字在亮粉上仅 2.9:1，属违规）。
 */
export const Primary: Story = {
  args: { type: 'primary' },
  play: async ({ canvas }) => {
    const btn = canvas.getByRole('button', { name: '开始随访' })
    await expect(btn.className).toContain('gm-btn--primary')
    await expect(btn.className).toContain('gm-btn--sz-default')
    await expect(getComputedStyle(btn).color).toBe('rgb(52, 58, 70)')
  },
}

/** 默认外观：`type` 不传时必须是 primary（与 @goodmom/vue 同契约，不允许各写各的默认值）。 */
export const DefaultAppearance: Story = {
  args: {},
  play: async ({ canvas }) => {
    const btn = canvas.getByRole('button', { name: '开始随访' })
    await expect(btn.className).toContain('gm-btn--primary')
  },
}

export const Secondary: Story = { args: { type: 'secondary', children: '取消' } }
export const Outline: Story = { args: { type: 'outline', children: '导出' } }
export const Dashed: Story = { args: { type: 'dashed', children: '添加成员' } }
export const Text: Story = { args: { type: 'text', children: '查看全部' } }

/** 状态谱：实底一律走 D5 深档（小字号白字 AA 达标）。 */
export const Status: Story = {
  args: { type: 'primary', status: 'danger', children: '删除档案' },
  play: async ({ canvas }) => {
    const btn = canvas.getByRole('button', { name: '删除档案' })
    await expect(btn.className).toContain('gm-btn--danger')
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <GmButton size="large">Large 48</GmButton>
      <GmButton size="default">Default 40</GmButton>
      <GmButton size="small">Small 32</GmButton>
      <GmButton size="mini">Mini 26</GmButton>
    </div>
  ),
}

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <GmButton shape="round">Round</GmButton>
      <GmButton shape="square">Square</GmButton>
      <GmButton shape="circle" ariaLabel="搜索" icon={<span>⌕</span>} />
    </div>
  ),
}

export const Long: Story = {
  args: { long: true, children: '全宽主行动' },
  parameters: { layout: 'padded' },
}

/** 加载中：`aria-busy` + 保留原宽度（内容不换、宽度不跳）。 */
export const Loading: Story = {
  args: { loading: true, children: '提交中' },
  play: async ({ canvas }) => {
    const btn = canvas.getByRole('button')
    await expect(btn.getAttribute('aria-busy')).toBe('true')
    await expect(btn).toBeDisabled()
  },
}

export const Disabled: Story = { args: { disabled: true, children: '不可用' } }

/** 前置图标：图标槽位固定 16px，不随文字挤压（03 · 3.2.5）。 */
export const WithIcon: Story = {
  args: { icon: <span>＋</span>, children: '新建档案' },
  play: async ({ canvas }) => {
    const btn = canvas.getByRole('button', { name: '新建档案' })
    await expect(btn.querySelector('.gm-btn__icon')).toBeTruthy()
  },
}
