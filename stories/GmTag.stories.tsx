import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import GmTag from '../goodmom-ui/src/adapters/GmTag'

const meta = {
  component: GmTag,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmTag>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 自包含契约：底色/描边由 tint(hex, α) 从语义色推导（α=0.13 / 0.32），
 * 且颜色文字双通道（dot 默认开启）。断言推导结果，证明 tint 数学没有被改坏。
 */
export const TintDerivedFromSemantic: Story = {
  args: { children: '已建档', semantic: 'info' },
  play: async ({ canvasElement }) => {
    const tag = canvasElement.querySelector('.gm-tag')
    await expect(tag).not.toBeNull()
    // SEMANTIC_COLOR.info = #4A76D0 → rgba(74,118,208,.13)
    await expect(getComputedStyle(tag as Element).backgroundColor).toBe('rgba(74, 118, 208, 0.13)')
    await expect(getComputedStyle(tag as Element).color).toBe('rgb(74, 118, 208)')
  },
}

export const Semantics: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <GmTag semantic="positive">正常</GmTag>
      <GmTag semantic="info">进行中</GmTag>
      <GmTag semantic="attention">待处理</GmTag>
      <GmTag semantic="risk">异常</GmTag>
      <GmTag semantic="neutral">已取消</GmTag>
      <GmTag semantic="special">协作</GmTag>
    </div>
  ),
}

export const WithoutDot: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <GmTag semantic="positive" dot={false}>无点</GmTag>
      <GmTag semantic="positive" dot>有点</GmTag>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <GmTag semantic="info" size="small">small</GmTag>
      <GmTag semantic="info" size="default">default</GmTag>
    </div>
  ),
}
