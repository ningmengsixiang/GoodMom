import type { Meta, StoryObj } from '@storybook/react-vite'
import GmBottomSheet from '../goodmom-ui/src/components/GmBottomSheet'

const meta = {
  component: GmBottomSheet,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    open: true,
    title: '随访方式',
    closable: true,
    maskClosable: true,
    onClose: () => {},
    children: '请选择本次随访方式：电话、门诊或上门。',
  },
} satisfies Meta<typeof GmBottomSheet>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：标题 + 关闭钮，ESC / 点遮罩 / 关闭钮都走 onClose。 */
export const Basic: Story = { args: {} }

/** 长内容：面板最高 92%，内部滚动且 overscroll 不穿透。 */
export const LongBody: Story = {
  args: {
    title: '随访记录详情',
    children: (
      <div>
        <p>孕 24 周 + 2 天 · 产科随访</p>
        <p>血压 118/76 mmHg，体重 56.4 kg，宫高 22 cm。</p>
        <p>主诉：偶有腰酸，夜间睡眠一般。</p>
        <p>建议：2 周后复诊，出现腹痛 / 出血随时就诊。</p>
      </div>
    ),
  },
}

/** 遮罩锁定：必须通过关闭钮或 ESC 关闭（maskClosable=false）。 */
export const MaskLocked: Story = {
  args: { title: '选择复诊日期', maskClosable: false },
}
