import type { Meta, StoryObj } from '@storybook/react-vite'
import GmFooter, { type GmFooterLink } from '../goodmom-ui/src/components/GmFooter'

const LINKS: GmFooterLink[] = [
  { key: 'privacy', label: '隐私政策', href: '#privacy' },
  { key: 'terms', label: '服务条款', href: '#terms' },
  { key: 'help', label: '帮助中心', href: '#help' },
]

const meta = {
  component: GmFooter,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    copyright: '© 2026 妈咪好 GoodMom',
    version: 'v2.10.0',
    links: LINKS,
    onLinkClick: () => {},
  },
} satisfies Meta<typeof GmFooter>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：链接行 + 版权/版本弱化文字，顶部 hairline 由 CSS 给。 */
export const Basic: Story = { args: {} }

/** 仅链接：不传版权与版本时不渲染 meta 行。 */
export const LinksOnly: Story = {
  args: { copyright: '', version: '' },
}

/** 仅版权：links 为空时不渲染链接行。 */
export const MetaOnly: Story = {
  args: { links: [] },
}
