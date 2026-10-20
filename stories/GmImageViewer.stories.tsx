import type { Meta, StoryObj } from '@storybook/react-vite'
import GmImageViewer from '../goodmom-ui/src/components/GmImageViewer'

const IMAGES = [
  'https://picsum.photos/seed/gm-img-1/900/1400',
  'https://picsum.photos/seed/gm-img-2/900/1400',
  'https://picsum.photos/seed/gm-img-3/900/1400',
]

const meta = {
  component: GmImageViewer,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    open: true,
    images: IMAGES,
    index: 0,
    onChange: () => {},
    onClose: () => {},
  },
} satisfies Meta<typeof GmImageViewer>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：全屏深幕 + contain 居中；>1 张显示左右切换与计数，ESC / 遮罩关闭。 */
export const Basic: Story = { args: {} }

/** 指定索引：打开时定位到第 2 张（首张时「上一张」原生 disabled）。 */
export const SecondImage: Story = { args: { index: 1 } }

/** 单张：不渲染左右切换钮，只留关闭与计数。 */
export const SingleImage: Story = { args: { images: [IMAGES[0]] } }
