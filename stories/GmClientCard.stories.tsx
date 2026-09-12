import type { Meta, StoryObj } from '@storybook/react-vite'
import GmClientCard from '../goodmom-ui/src/components/GmClientCard'
import GmStatusTag from '../goodmom-ui/src/components/GmStatusTag'
import GmButton from '../goodmom-ui/src/components/GmButton'

const meta = {
  component: GmClientCard,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmClientCard>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    name: '王立',
    sub: '孕 24 周 + 2 天 · 产科',
    avatar: '王',
    tone: 'rose',
    style: { maxWidth: 520 },
  },
}

/** tags 接受 ReactNode 数组；状态色由 GmStatusTag 单源映射提供 */
export const WithStatusTags: Story = {
  args: {
    name: '王立',
    sub: '孕 24 周 + 2 天 · 高危管理',
    avatar: '王',
    tone: 'rose',
    tags: [<GmStatusTag key="1" semantic="risk">已转诊</GmStatusTag>, <GmStatusTag key="2" semantic="attention">待复查</GmStatusTag>],
  },
}

export const WithActions: Story = {
  args: {
    name: '李安安',
    sub: '18 月龄 · 儿保',
    avatar: '安',
    tone: 'mint',
    tags: [<GmStatusTag key="1" semantic="positive">已完成</GmStatusTag>],
    actions: [<GmButton key="1" size="small" type="outline">查看档案</GmButton>, <GmButton key="2" size="small" type="primary">建档</GmButton>],
    style: { maxWidth: 640 },
  },
}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
      <GmClientCard name="王立" sub="孕期" avatar="王" tone="rose" />
      <GmClientCard name="李安安" sub="儿保" avatar="安" tone="mint" />
      <GmClientCard name="米朵" sub="档案" avatar="米" tone="purple" />
    </div>
  ),
}
