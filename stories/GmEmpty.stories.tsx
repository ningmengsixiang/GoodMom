import type { Meta, StoryObj } from '@storybook/react-vite'
import GmEmpty from '../goodmom-ui/src/components/GmEmpty'
import GmButton from '../goodmom-ui/src/components/GmButton'

const meta = {
  component: GmEmpty,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmEmpty>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: { title: '暂无随访记录', desc: '本月还没有产生随访数据', style: { maxWidth: 360 } },
}

export const TitleOnly: Story = { args: { title: '暂无数据', style: { maxWidth: 360 } } }

/** 带引导行动：空态必须给下一步，而不是只报空 */
export const WithAction: Story = {
  args: {
    title: '还没有宝宝档案',
    desc: '建档后可查看生长曲线与疫苗计划',
    children: <GmButton type="primary" size="small">立即建档</GmButton>,
    style: { maxWidth: 360 },
  },
}

export const CustomIcon: Story = {
  args: {
    title: '疫苗计划已完成',
    desc: '全部剂次均已接种',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l5 5L20 7" />
      </svg>
    ),
    style: { maxWidth: 360 },
  },
}
