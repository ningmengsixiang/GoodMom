import type { Preview } from '@storybook/react-vite'
import type { ReactElement } from 'react'
// Storybook 10 内置 viewport（无需 @storybook/addon-viewport），仅从这里取官方预设做合并。
import { INITIAL_VIEWPORTS } from 'storybook/viewport'

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

    // 移动端视口预设：在官方 INITIAL_VIEWPORTS 之上合并设计系统常用的三档宽度。
    // 桌面 story 不设置 viewport globals，保持 responsive 全宽，不受影响。
    viewport: {
      options: {
        ...INITIAL_VIEWPORTS,
        mobile320: {
          name: '移动端 320 × 568',
          styles: { width: '320px', height: '568px' },
          type: 'mobile',
        },
        mobile375: {
          name: '移动端 375 × 812',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
        mobile414: {
          name: '移动端 414 × 896',
          styles: { width: '414px', height: '896px' },
          type: 'mobile',
        },
      },
      // 未显式声明 viewport globals 的 story 使用 responsive（桌面组件不受影响）。
      // Storybook 10.6 运行时以 globals 为准；此键作为显式默认声明保留，兼容旧配置写法。
      defaultViewport: 'responsive',
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