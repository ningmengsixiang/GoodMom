import type { Meta, StoryObj } from '@storybook/react-vite'
import GmModal from '../goodmom-ui/src/components/GmModal'

const meta = {
  component: GmModal,
  tags: ['ai-generated'],
} satisfies Meta<typeof GmModal>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    open: true,
    title: '随访确认',
    okText: '确定',
    cancelText: '取消',
    children: '随访记录已保存，是否提交审核？',
    onCancel: () => {},
  },
}

export const Closable: Story = {
  args: {
    open: true,
    title: '危险操作确认',
    okText: '确认注销',
    cancelText: '取消',
    children: '注销后不可恢复，档案将进入「已注销」状态。',
    onCancel: () => {},
  },
}

export const CustomFooter: Story = {
  args: {
    open: true,
    title: '自定义按钮区',
    children: 'footer 覆盖默认 ok/cancel 按钮组（MD-18-03 危险操作可自定义文案重述对象名）。',
    footer: (
      <button type="button" className="gm-modal__btn gm-modal__btn--danger" style={{ marginLeft: 'auto' }}>
        删除并重述对象名
      </button>
    ),
    onCancel: () => {},
  },
}
