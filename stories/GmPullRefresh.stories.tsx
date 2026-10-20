import type { Meta, StoryObj } from '@storybook/react-vite'
import GmPullRefresh from '../goodmom-ui/src/components/GmPullRefresh'

const ROWS = [
  '王立 · 孕 24 周 + 2 天 · 产科',
  '李安安 · 18 月龄 · 儿保',
  '米朵 · 产后 42 天 · 康复',
  '张敏 · 孕 32 周 · 高危管理',
]

const meta = {
  component: GmPullRefresh,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    refreshing: false,
    disabled: false,
    text: '下拉刷新',
    refreshingText: '刷新中…',
    onRefresh: () => {},
    children: (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {ROWS.map((row) => (
          <li key={row} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0, 0, 0, .06)' }}>
            {row}
          </li>
        ))}
      </ul>
    ),
  },
} satisfies Meta<typeof GmPullRefresh>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：从顶部下拉跟手（上限 96px），松手位移 ≥64px 触发一次 refresh。 */
export const Basic: Story = { args: {} }

/** 刷新中：指示器保持展开，spinner + refreshingText 常驻。 */
export const Refreshing: Story = { args: { refreshing: true } }

/** 禁用：不响应下拉手势，内容照常滚动。 */
export const Disabled: Story = { args: { disabled: true } }
