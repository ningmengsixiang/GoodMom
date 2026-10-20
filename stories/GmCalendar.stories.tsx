import type { Meta, StoryObj } from '@storybook/react-vite'
import GmCalendar from '../goodmom-ui/src/components/GmCalendar'

const meta = {
  component: GmCalendar,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    value: '2026-10-19',
    month: '2026-10',
    events: ['2026-10-08', '2026-10-12', '2026-10-19', '2026-10-26'],
    onChange: () => {},
    onMonthChange: () => {},
  },
} satisfies Meta<typeof GmCalendar>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：选中日 + 事件点；左右箭头切月派发 monthChange。 */
export const Basic: Story = { args: {} }

/** 无选中：value 为空时只显示今天与事件点。 */
export const NoSelection: Story = {
  args: { value: '', events: [] },
}

/** 只给 value：month 为空时自动取 value 所在月（2026-10）。 */
export const MonthFromValue: Story = {
  args: { month: '' },
}
