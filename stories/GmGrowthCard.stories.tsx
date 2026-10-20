import type { Meta, StoryObj } from '@storybook/react-vite'
import GmGrowthCard, { type GmGrowthData } from '../goodmom-ui/src/components/GmGrowthCard'

const meta = {
  component: GmGrowthCard,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmGrowthCard>

export default meta
type Story = StoryObj<typeof meta>

const DATA: GmGrowthData = {
  title: '体重生长曲线', tone: 'mint', seriesName: '宝宝实测',
  source: 'WHO 2006 · 0–24 月龄', bandLabel: 'P3–P97 · 示意数据',
  xName: '月龄', xUnit: '月', yName: '体重', yUnit: 'kg',
  x: [0, 3, 6, 9, 12, 15, 18, 21, 24], xTicks: [0, 6, 12, 18, 24], yTicks: [6, 8, 10, 12, 14],
  p3: [2.5, 4.6, 6.1, 7.1, 7.7, 8.3, 8.8, 9.2, 9.7],
  p50: [3.3, 6.4, 7.9, 8.9, 9.6, 10.3, 10.9, 11.5, 12.2],
  p97: [4.3, 7.1, 9.2, 10.5, 11.5, 12.4, 13.2, 13.9, 14.6],
  actual: [3.4, 6.2, 7.9, 8.9, 9.7, 10.5, 11.5, 12.0, 9.4],
  focus: 18,
  advisories: [{ x: 24, tone: 'attention', text: '24 月龄 · 体重 9.4kg 低于 P3（9.7kg）：建议 2 周内复测并评估喂养（示意）' }],
}

export const Basic: Story = { args: { data: DATA } }

/** 13.2 M 家长端形态：只留参考带 / 主曲线 / 端点 */
export const Mini: Story = { args: { data: { ...DATA, mini: true, x: [0, 6, 12, 18, 24], xTicks: [], yTicks: [], advisories: [] } } }

export const Rose: Story = { args: { data: { ...DATA, tone: 'rose' } } }
