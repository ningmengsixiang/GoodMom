import type { Meta, StoryObj } from '@storybook/react-vite'
import GmSafeArea, { type GmSafeAreaProps } from '../goodmom-ui/src/components/GmSafeArea'

const meta = {
  component: GmSafeArea,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    position: 'bottom',
  },
} satisfies Meta<typeof GmSafeArea>

export default meta
type Story = StoryObj<typeof meta>

const Frame = (args: GmSafeAreaProps) => (
  <div style={{ background: 'rgba(255, 255, 255, 0.6)', borderRadius: 16, padding: 16 }}>
    <div
      style={{
        height: 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.04)',
        borderRadius: 12,
      }}
    >
      页面内容（安全区在有 env 的机型上才有高度）
    </div>
    <GmSafeArea {...args} />
  </div>
)

/** 默认：底部安全区（iPhone 刘海机型底部 home indicator 区域）。 */
export const Bottom: Story = { render: (args) => <Frame {...args} /> }

/** 顶部安全区：适配刘海 / 状态栏。 */
export const Top: Story = {
  args: { position: 'top' },
  render: (args) => <Frame {...args} />,
}

/** 两侧：整屏容器上下都补安全区。 */
export const Both: Story = {
  args: { position: 'both' },
  render: (args) => <Frame {...args} />,
}
