import type { Meta, StoryObj } from '@storybook/react-vite'
import GmProgress from '../goodmom-ui/src/components/GmProgress'

const meta = {
  component: GmProgress,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmProgress>

export default meta
type Story = StoryObj<typeof meta>

export const Line: Story = { args: { percent: 62, style: { maxWidth: 320 } } }
export const WithText: Story = { args: { percent: 62, text: true, style: { maxWidth: 320 } } }

/** positive=true 走薄荷正向档（DesignTokens.mint.600），用于"已完成/健康正向"语境 */
export const Positive: Story = { args: { percent: 96, positive: true, text: true, style: { maxWidth: 320 } } }

export const Circle: Story = { args: { percent: 45, type: 'circle', text: true } }

export const Range: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
      <GmProgress percent={0} text style={{ maxWidth: 320 }} />
      <GmProgress percent={38} text style={{ maxWidth: 320 }} />
      <GmProgress percent={62} text style={{ maxWidth: 320 }} />
      <GmProgress percent={100} text style={{ maxWidth: 320 }} />
    </div>
  ),
}
