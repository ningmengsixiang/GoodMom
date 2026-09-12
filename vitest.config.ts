import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * ⚠️ 已知阻塞（本仓库路径含中文，实测确认）：
 * `@storybook/addon-vitest` 把 setup-file 以**绝对路径**交给浏览器加载，
 * 中文被百分号编码后浏览器取不到 → 全部 stories 报 "No test suite found"。
 *   实测：仓库原位 13 文件全失败；把同一份代码（含 node_modules 真实拷贝）放到纯 ASCII 路径
 *   后 `npx vitest --project storybook run` → 10 文件 / 47 项全通过。
 * 规避：在纯 ASCII 路径运行（如 `ln -s` 无效，vitest 会 realpath 回中文；需真实拷贝或改用 ASCII 路径的检出）。
 * 另：playwright 已固定为 1.62.0，以复用本机已装的 chromium-1234，避免再下载 200MB 浏览器。
 */
import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
