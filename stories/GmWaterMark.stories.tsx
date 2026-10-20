import type { Meta, StoryObj } from '@storybook/react-vite'
import GmWaterMark from '../goodmom-ui/src/components/GmWaterMark'

const CARD = (
  <div
    style={{
      padding: 20,
      borderRadius: 16,
      background: 'rgba(255, 255, 255, 0.72)',
      minHeight: 220,
    }}
  >
    <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>随访小结</h3>
    <p style={{ margin: 0, fontSize: 14 }}>孕 24 周 + 2 天 · 血压 118/76 mmHg · 体重 56.4 kg</p>
    <p style={{ margin: '8px 0 0', fontSize: 14 }}>下次复诊：2026-11-02，产科门诊 3 诊室。</p>
  </div>
)

const meta = {
  component: GmWaterMark,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    text: '妈咪好 · 内部资料',
    opacity: 0.06,
    gap: 80,
    children: CARD,
  },
} satisfies Meta<typeof GmWaterMark>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：45° 内联 SVG 平铺水印，覆盖层 pointer-events:none 不挡交互。 */
export const Basic: Story = { args: {} }

/** 更密更显：gap 48 + opacity 0.1（变量交给 CSS）。 */
export const Dense: Story = {
  args: { text: '仅限本人查看', gap: 48, opacity: 0.1 },
}

/** text 为空：不渲染水印图层，只留 children。 */
export const NoText: Story = {
  args: { text: '' },
}
