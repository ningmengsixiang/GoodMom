import type { Meta, StoryObj } from '@storybook/react-vite'
import GmSearchBar from '../goodmom-ui/src/components/GmSearchBar'

const meta = {
  component: GmSearchBar,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    value: '',
    placeholder: '搜索服务对象',
    cancelText: '取消',
    showCancel: false,
    disabled: false,
    onChange: () => {},
    onSearch: () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof GmSearchBar>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：胶囊 44 高、输入 16px；回车提交走 search。 */
export const Basic: Story = { args: {} }

/** 有值态：出现清空键，清空后焦点送回输入框。 */
export const WithValue: Story = {
  args: { value: '王立' },
}

/** 取消态：showCancel 打开后出现 44 热区的取消键。 */
export const CancelMode: Story = {
  args: { value: '孕 24 周', showCancel: true },
}
