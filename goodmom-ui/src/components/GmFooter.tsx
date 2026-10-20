import React from "react";

/**
 * GmFooter —— 页脚（规范 11 · 11.6.11）
 *
 * 与 `@goodmom/vue` 同契约：copyright / version / links，事件 linkClick（(key)）。
 * 视觉（顶部 hairline 玻璃细条、弱化文字）由组件 CSS 提供，本文件无色值。
 *
 * 行为：
 * 1. links 是命名 interface 数组，渲染为真 `<a href>`（可复制 / 新窗口 / 读屏可识别）。
 * 2. 点击链接先派发 linkClick(key)，是否阻止默认跳转由调用方决定。
 * 3. 版权与版本合成一行弱化文字（用「·」分隔），两者都空则不渲染。
 */
export interface GmFooterLink {
  key: string;
  label: string;
  href: string;
}
export interface GmFooterProps {
  /** 版权文案，默认 "" */
  copyright?: string;
  /** 版本号，默认 "" */
  version?: string;
  /** 链接列表，默认 [] */
  links?: GmFooterLink[];
  onLinkClick?: (key: string) => void;
}

const GmFooter = ({
  copyright = "",
  version = "",
  links = [],
  onLinkClick,
}: GmFooterProps) => {
  const meta = [copyright, version].filter(Boolean).join(" · ");
  return (
    <footer className="gm-footer">
      {links.length > 0 ? (
        <nav className="gm-footer__links" aria-label="页脚链接">
          {links.map((link) => (
            <a
              key={link.key}
              className="gm-footer__link"
              href={link.href}
              onClick={() => onLinkClick?.(link.key)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
      {meta ? <p className="gm-footer__meta">{meta}</p> : null}
    </footer>
  );
};
export default GmFooter;
