import type { Meta, StoryObj } from '@storybook/react-vite'
import GmErrorBlock from '../goodmom-ui/src/components/GmErrorBlock'

const meta = {
  component: GmErrorBlock,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    status: 'error',
    title: '',
    description: '',
    retryText: '重新加载',
    onRetry: () => {},
  },
} satisfies Meta<typeof GmErrorBlock>

export default meta
type Story = StoryObj<typeof meta>

/** error：标题/说明留空时用状态默认文案，retryText 非空才渲染重试按钮。 */
export const Basic: Story = { args: {} }

/** network：网络异常默认文案 + 重试。 */
export const Network: Story = {
  args: { status: 'network', retryText: '重试' },
}

/** empty：空状态，不传 retryText 时不渲染按钮。 */
export const Empty: Story = {
  args: { status: 'empty', retryText: '' },
}
