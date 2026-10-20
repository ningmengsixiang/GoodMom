import type { Meta, StoryObj } from '@storybook/react-vite'
import GmTable from '../goodmom-ui/src/components/GmTable'
import GmStatusTag from '../goodmom-ui/src/components/GmStatusTag'

const meta = {
  component: GmTable,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmTable>

export default meta
type Story = StoryObj<typeof meta>

const COLS = [
  { key: 'name', title: '服务对象', sortable: true },
  { key: 'gest', title: '孕周' },
  { key: 'status', title: '状态' },
  { key: 'ops', title: '操作', align: 'right', render: () => <span className="ops"><a href="#x">随访</a><a href="#x">详情</a></span> },
]

const DATA = [
  { key: 1, name: '张敏', gest: '28 周', status: <GmStatusTag five="m2">黄 · 一般风险</GmStatusTag> },
  { key: 2, name: '李华', gest: '32 周', status: <GmStatusTag five="m1">绿 · 低风险</GmStatusTag> },
  { key: 3, name: '王芳', gest: '24 周', status: <GmStatusTag semantic="attention">待随访</GmStatusTag> },
]

export const Basic: Story = { args: { columns: COLS, data: DATA, caption: '孕产妇随访队列（示意）' } }

export const Sortable: Story = {
  args: { columns: COLS, data: DATA, sortKey: 'name', sortOrder: 'asc', onSortChange: () => {} },
}

export const Empty: Story = { args: { columns: COLS, data: [] } }
