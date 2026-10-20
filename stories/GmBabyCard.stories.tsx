import type { Meta, StoryObj } from '@storybook/react-vite'
import GmBabyCard, { type GmBabyMetric } from '../goodmom-ui/src/components/GmBabyCard'

const METRICS: GmBabyMetric[] = [
  { key: 'height', label: '身高', value: '82.5', unit: 'cm' },
  { key: 'weight', label: '体重', value: '11.2', unit: 'kg' },
  { key: 'head', label: '头围', value: '47.0', unit: 'cm' },
]

const meta = {
  component: GmBabyCard,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    name: '豆豆',
    birthday: '2025-06-18',
    monthAge: 16,
    avatar: '豆',
    gender: 'boy',
    metrics: METRICS,
    onEdit: () => {},
  },
} satisfies Meta<typeof GmBabyCard>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：文字头像 + 姓名/月龄/生日 + 指标三连 + 44 编辑钮。 */
export const Basic: Story = { args: {} }

/** 图片头像 + 女宝：avatar 是图片地址时渲染 img，gender 挂 data-gender。 */
export const WithImageAvatar: Story = {
  args: { name: '米朵', avatar: 'https://picsum.photos/seed/gm-baby/200/200', gender: 'girl' },
}

/** 无指标：metrics 为空时不渲染指标区。 */
export const NoMetrics: Story = {
  args: { metrics: [] },
}
