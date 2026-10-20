<script setup lang="ts">
/**
 * GmFooter —— 页脚（规范 11.6.11）
 *
 * 与 React 版同契约（链接 / 版权 / 版本逐项对应）：
 * 1. links 是命名接口数组，渲染为真 <a href>（可复制 / 新窗口 / 读屏可识别）；
 *    链接行用 nav 语义 + aria-label「页脚链接」。
 * 2. 点击链接先派发 linkClick(key)，是否阻止默认跳转由调用方决定。
 * 3. 版权与版本合成一行弱化文字（用「·」分隔），两者都空则不渲染。
 */
export interface GmFooterLink {
  key: string;
  label: string;
  href: string;
}

const props = withDefaults(
  defineProps<{
    /** 版权文案，默认空 */
    copyright?: string;
    /** 版本号，默认空 */
    version?: string;
    /** 链接列表，默认空数组 */
    links?: GmFooterLink[];
  }>(),
  {
    copyright: "",
    version: "",
    links: () => [],
  }
);

const emit = defineEmits(["linkClick"]);

const onLink = (key: string) => emit("linkClick", key);
</script>

<template>
  <footer class="gm-footer">
    <nav v-if="links.length > 0" class="gm-footer__links" aria-label="页脚链接">
      <a
        v-for="link in links"
        :key="link.key"
        class="gm-footer__link"
        :href="link.href"
        @click="onLink(link.key)"
      >
        {{ link.label }}
      </a>
    </nav>
    <p v-if="copyright || version" class="gm-footer__meta">
      {{ [copyright, version].filter(Boolean).join(" · ") }}
    </p>
  </footer>
</template>
