import type { Meta, StoryObj } from '@storybook/react-vite'
import GmSelector, { type GmSelectorItem } from '../goodmom-ui/src/components/GmSelector'

const ITEMS: GmSelectorItem[] = [
  { key: 'phone', label: '电话随访', desc: '10 分钟内完成' },
  { key: 'clinic', label: '门诊随访', desc: '需预约挂号' },
  { key: 'home', label: '上门随访', desc: '限行动不便' },
  { key: 'video', label: '视频随访', desc: '暂未开通', disabled: true },
]

const meta = {
  component: GmSelector,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    items: ITEMS,
    value: ['phone'],
    multiple: false,
    onChange: () => {},
  },
} satisfies Meta<typeof GmSelector>

export default meta
type Story = StoryObj<typeof meta>

/** 单选：radiogroup + radio 语义，选中项显示玫瑰渐变底与勾徽。 */
export const Single: Story = { args: {} }

/** 多选：group + checkbox 语义，value 是选中 key 数组。 */
export const Multiple: Story = {
  args: { multiple: true, value: ['phone', 'clinic'] },
}

/** 无选中 + 禁用项：disabled 走原生禁用，不参与键盘与点击。 */
export const EmptyWithDisabled: Story = {
  args: { value: [] },
}
