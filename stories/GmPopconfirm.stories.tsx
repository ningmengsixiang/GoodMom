import type { Meta, StoryObj } from '@storybook/react-vite'
import GmPopconfirm from '../goodmom-ui/src/components/GmPopconfirm'

const meta = {
  component: GmPopconfirm,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmPopconfirm>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    title: '确认注销该档案？',
    description: '注销后不可恢复，档案将进入「已注销」状态。',
    children: <span style={{ color: 'var(--lg-sem-risk)', fontWeight: 600 }}>注销档案</span>,
  },
}

export const Danger: Story = {
  args: {
    title: '确认删除该记录？',
    description: '删除后不可恢复（MD-18-03：危险操作重述对象名）。',
    danger: true,
    okText: '确认删除',
    children: <span>删除记录</span>,
  },
}
