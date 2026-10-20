import type { Meta, StoryObj } from '@storybook/react-vite'
import GmPicker from '../goodmom-ui/src/components/GmPicker'

const COLUMNS = [
  ['电话', '门诊', '上门', '视频'],
  ['上午', '下午'],
  ['08:00', '09:00', '10:00', '14:00', '15:00'],
]

const meta = {
  component: GmPicker,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    open: true,
    title: '随访方式',
    columns: COLUMNS,
    value: ['门诊', '下午', '09:00'],
    onConfirm: () => {},
    onClose: () => {},
  },
} satisfies Meta<typeof GmPicker>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：多列滚动选择，打开时滚到 value 对应项；确定派发 confirm 并关闭。 */
export const Basic: Story = { args: {} }

/** 无初始值：每列自动选第一项（value 默认 []）。 */
export const NoValue: Story = { args: { value: [] } }

/** 单列：无标题时对话框可访问名回退为「选择器」。 */
export const SingleColumn: Story = {
  args: { title: '', columns: [['今天', '明天', '后天']], value: ['明天'] },
}
