import type { Preview } from '@storybook/react-vite'
import type { ReactElement } from 'react'

// 真实根样式：Arco 基底必须先于主题覆盖引入（见 theme.css 头部注释与 02 · 2.9）
import '@arco-design/web-react/dist/css/arco.css'
import '../goodmom-ui/src/theme.css'

// 设计系统的页面底色 token（02 · 2.1 / theme.css --lg-page-bg）。
// 组件按"暖石底 + 玻璃面板"设计，白底会同时失真玻璃层次与品牌色观感，故按 token 铺底。
const PageBackground = (Story: () => ReactElement) => (
  <div
    style={{
      background: 'var(--lg-page-bg, #E6D9D0)',
      color: 'var(--lg-text-primary, #343A46)',
      padding: 24,
      minHeight: '100vh',
      boxSizing: 'border-box',
    }}
  >
    <Story />
  </div>
)

const preview: Preview = {
  decorators: [PageBackground],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;