import type { Meta, StoryObj } from '@storybook/react-vite'
import GmLoadMore from '../goodmom-ui/src/components/GmLoadMore'

const meta = {
  component: GmLoadMore,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    status: 'idle',
    loadingText: '加载中…',
    doneText: '没有更多了',
    idleText: '上拉加载更多',
    onLoad: () => {},
  },
} satisfies Meta<typeof GmLoadMore>

export default meta
type Story = StoryObj<typeof meta>

/** 待加载：进入视口自动派发一次 load；idle 文案本身是按钮，可点击/回车。 */
export const Idle: Story = { args: {} }

/** 加载中：细环 spinner + loadingText，读屏通过 role=status 播报。 */
export const Loading: Story = { args: { status: 'loading' } }

/** 加载完：显示 doneText，不再派发 load。 */
export const Done: Story = { args: { status: 'done' } }
