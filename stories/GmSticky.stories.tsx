import type { Meta, StoryObj } from '@storybook/react-vite'
import GmSticky, { type GmStickyProps } from '../goodmom-ui/src/components/GmSticky'

const meta = {
  component: GmSticky,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    top: 0,
    zIndex: 10,
    onStuck: () => {},
  },
} satisfies Meta<typeof GmSticky>

export default meta
type Story = StoryObj<typeof meta>

const List = () => (
  <div>
    {Array.from({ length: 12 }).map((_, i) => (
      <p
        key={i}
        style={{ margin: 0, padding: '14px 16px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}
      >
        随访记录 {i + 1} · 王立 · 孕 24 周 + 2 天
      </p>
    ))}
  </div>
)

const Demo = (args: GmStickyProps) => (
  <div>
    <GmSticky {...args}>
      <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.78)' }}>
        孕产妇随访 · 今日 12 人
      </div>
    </GmSticky>
    <List />
  </div>
)

/** 默认贴顶：页面滚动后标题条吸顶并挂 is-stuck（阴影由 CSS 给）。 */
export const Basic: Story = { render: (args) => <Demo {...args} /> }

/** 偏移吸顶：top=48 时留出上方导航高度。 */
export const WithOffset: Story = {
  args: { top: 48 },
  render: (args) => <Demo {...args} />,
}
