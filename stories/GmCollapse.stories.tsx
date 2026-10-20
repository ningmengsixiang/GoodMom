import type { Meta, StoryObj } from '@storybook/react-vite'
import GmCollapse from '../goodmom-ui/src/components/GmCollapse'

const meta = {
  component: GmCollapse,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmCollapse>

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = [
  { key: 'a', title: '2024-10 儿保随访记录', tone: 'positive' as const, content: '身高体重头围均正常，喂养指导完成；下次重点关注语言发育。' },
  { key: 'b', title: '疫苗接种提示', tone: 'attention' as const, content: '13 价肺炎第 3 剂次到期，请携带接种本。' },
  { key: 'c', title: '喂养记录', content: '近 7 天奶量均值 720ml/日，夜醒 1 次。' },
  { key: 'd', title: '高危提醒', tone: 'risk' as const, content: '24 月龄体重低于 P3，建议 2 周内复测。' },
]

export const Basic: Story = { args: { items: ITEMS, defaultOpenKeys: ['a'] } }

export const Accordion: Story = { args: { items: ITEMS, accordion: true, defaultOpenKeys: ['b'] } }

/** 一屏 ≤3：maxOpen 默认 3，超出自动收最早展开的（11 · 11.2.6） */
export const MaxOpenCapped: Story = { args: { items: ITEMS, defaultOpenKeys: ['a', 'b', 'c', 'd'] } }
