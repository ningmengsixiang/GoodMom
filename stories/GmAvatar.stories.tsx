import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import GmAvatar from '../goodmom-ui/src/components/GmAvatar'

const meta = {
  component: GmAvatar,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmAvatar>

export default meta
type Story = StoryObj<typeof meta>

/**
 * tone 必须解析到 DesignTokens 的渐变（tokens/design.ts gradRose = #FFA9C2→#E85D8F）。
 * 断言首端色证明组件走的是 token 层，而不是自己写死色值（D10 收口的正是这类绕过）。
 */
export const ToneIsTokenDriven: Story = {
  args: { text: '朵', tone: 'rose', size: 46 },
  play: async ({ canvasElement }) => {
    const av = canvasElement.querySelector('.gm-avatar')
    await expect(av).not.toBeNull()
    await expect(getComputedStyle(av as Element).backgroundImage).toContain('rgb(255, 169, 194)')
  },
}

/** 只取首字（服务对象首字头像契约） */
export const TakesFirstCharacter: Story = {
  args: { text: '王立', size: 40 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.gm-avatar')?.textContent).toBe('王')
  },
}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <GmAvatar text="朵" tone="rose" size={46} />
      <GmAvatar text="安" tone="mint" size={46} />
      <GmAvatar text="米" tone="purple" size={46} />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <GmAvatar text="朵" size={28} />
      <GmAvatar text="朵" size={36} />
      <GmAvatar text="朵" size={46} />
      <GmAvatar text="朵" size={64} />
    </div>
  ),
}
