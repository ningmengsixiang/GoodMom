import type { Meta, StoryObj } from '@storybook/react-vite'
import GmDescriptions from '../goodmom-ui/src/components/GmDescriptions'

const meta = {
  component: GmDescriptions,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmDescriptions>

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = [
  { label: '出生日期', value: '2023-04-12 · 足月顺产' },
  { label: '出生体重 / 身长', value: '3.2kg / 50cm', num: true },
  { label: '母亲姓名', value: '张敏' },
  { label: '建档机构', value: '市妇幼保健院儿保科' },
  { label: '最近随访', value: '2026-10-08 · 王医生' },
]

export const Basic: Story = { args: { items: ITEMS } }

export const TwoColumns: Story = { args: { items: ITEMS, columns: 2 } }

/** 8.2.13：长文本单行省略 + title 全文 */
export const Ellipsis: Story = {
  args: {
    items: [
      { label: '备注', value: '这是一段非常长的备注文字，用来验证描述列表的单行省略与 title 全文降级方案是否符合 08 · 8.2.13' },
      { label: '体重', value: '11.2kg', num: true },
    ],
  },
}
