import type { Meta, StoryObj } from '@storybook/react-vite'
import GmSteps from '../goodmom-ui/src/components/GmSteps'

const meta = {
  component: GmSteps,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmSteps>

export default meta
type Story = StoryObj<typeof meta>

const VACCINE = [
  { title: '建档', description: '已完成' },
  { title: '预约', description: '已预约' },
  { title: '接种', description: '进行中' },
  { title: '留观', description: '待开始' },
]

export const Process: Story = { args: { items: VACCINE, current: 2 } }

export const AllFinished: Story = {
  args: { items: VACCINE.map((i) => ({ ...i, description: '已完成' })), current: 4 },
}

/** 显式 status 优先于 current 推断（组件契约：items[i].status || 由 current 推导） */
export const ExplicitStatus: Story = {
  args: {
    items: [
      { title: '建档', status: 'finish' },
      { title: '预约', status: 'error', description: '信息不完整' },
      { title: '接种', status: 'wait' },
    ],
    current: 0,
  },
}

export const Small: Story = { args: { items: VACCINE, current: 1, size: 'small' } }

export const NotStarted: Story = { args: { items: VACCINE, current: 0 } }
