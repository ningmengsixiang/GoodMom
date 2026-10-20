import type { Meta, StoryObj } from '@storybook/react-vite'
import GmPopover from '../goodmom-ui/src/components/GmPopover'
import GmTooltip from '../goodmom-ui/src/components/GmTooltip'

const meta = {
  component: GmPopover,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmPopover>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    title: '高危随访说明',
    content: '高危孕产妇需在 7 天内完成复访，逾期自动升级预警。',
    children: <span style={{ color: 'var(--lg-link)' }}>高危随访</span>,
  },
}

export const TooltipOnly: Story = {
  render: () => (
    <GmTooltip title="实时防护已开启">
      <span style={{ color: 'var(--lg-sem-special)' }}>防护状态</span>
    </GmTooltip>
  ),
}
