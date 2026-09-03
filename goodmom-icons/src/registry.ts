export type GmIconName =
  | "lg-icon-search"
  | "lg-icon-home"
  | "lg-icon-user"
  | "lg-icon-bell"
  | "lg-icon-star"
  | "lg-icon-grid"
  | "lg-icon-layers"
  | "lg-icon-settings"
  | "lg-icon-arrow-right"
  | "lg-icon-arrow-left"
  | "lg-icon-arrow-up"
  | "lg-icon-arrow-down"
  | "lg-icon-chevron-right"
  | "lg-icon-chevron-down"
  | "lg-icon-external-link"
  | "lg-icon-plus"
  | "lg-icon-minus"
  | "lg-icon-check"
  | "lg-icon-close"
  | "lg-icon-more"
  | "lg-icon-edit"
  | "lg-icon-trash"
  | "lg-icon-copy"
  | "lg-icon-download"
  | "lg-icon-upload"
  | "lg-icon-refresh"
  | "lg-icon-send"
  | "lg-icon-info"
  | "lg-icon-warning"
  | "lg-icon-success"
  | "lg-icon-error"
  | "lg-icon-help"
  | "lg-icon-clock"
  | "lg-icon-database"
  | "lg-icon-server"
  | "lg-icon-cloud"
  | "lg-icon-file"
  | "lg-icon-folder"
  | "lg-icon-chart-bar"
  | "lg-icon-chart-line"
  | "lg-icon-chart-pie"
  | "lg-icon-network"
  | "lg-icon-globe"
  | "lg-icon-shield"
  | "lg-icon-shield-check"
  | "lg-icon-lock"
  | "lg-icon-key"
  | "lg-icon-eye"
  | "lg-icon-ai-spark"
  | "lg-icon-ai-bot"
  | "lg-icon-image"
  | "lg-icon-play"
  | "lg-icon-calendar"
  | "lg-icon-pin"
  | "lg-icon-monitor"
  | "lg-icon-list"
  | "lg-icon-baby"
  | "lg-icon-mom"
  | "lg-icon-milk"
  | "lg-icon-vaccine"
  | "lg-icon-vital"
  | "lg-icon-clinic"
  | "lg-icon-preg-prep"
  | "lg-icon-preg-early"
  | "lg-icon-preg-mid"
  | "lg-icon-preg-late"
  | "lg-icon-child-newborn"
  | "lg-icon-child-infant"
  | "lg-icon-child-toddler"
  | "lg-icon-child-preschool"
  | "lg-icon-wj-growth"
  | "lg-icon-wj-nutrition"
  | "lg-icon-wj-develop"
  | "lg-icon-wj-vision"
  | "lg-icon-wj-hearing"
  | "lg-icon-wj-oral"
  | "lg-icon-wj-oral-scope"

export const GM_ICON_IDS: GmIconName[] = ["lg-icon-search", "lg-icon-home", "lg-icon-user", "lg-icon-bell", "lg-icon-star", "lg-icon-grid", "lg-icon-layers", "lg-icon-settings", "lg-icon-arrow-right", "lg-icon-arrow-left", "lg-icon-arrow-up", "lg-icon-arrow-down", "lg-icon-chevron-right", "lg-icon-chevron-down", "lg-icon-external-link", "lg-icon-plus", "lg-icon-minus", "lg-icon-check", "lg-icon-close", "lg-icon-more", "lg-icon-edit", "lg-icon-trash", "lg-icon-copy", "lg-icon-download", "lg-icon-upload", "lg-icon-refresh", "lg-icon-send", "lg-icon-info", "lg-icon-warning", "lg-icon-success", "lg-icon-error", "lg-icon-help", "lg-icon-clock", "lg-icon-database", "lg-icon-server", "lg-icon-cloud", "lg-icon-file", "lg-icon-folder", "lg-icon-chart-bar", "lg-icon-chart-line", "lg-icon-chart-pie", "lg-icon-network", "lg-icon-globe", "lg-icon-shield", "lg-icon-shield-check", "lg-icon-lock", "lg-icon-key", "lg-icon-eye", "lg-icon-ai-spark", "lg-icon-ai-bot", "lg-icon-image", "lg-icon-play", "lg-icon-calendar", "lg-icon-pin", "lg-icon-monitor", "lg-icon-list", "lg-icon-baby", "lg-icon-mom", "lg-icon-milk", "lg-icon-vaccine", "lg-icon-vital", "lg-icon-clinic", "lg-icon-preg-prep", "lg-icon-preg-early", "lg-icon-preg-mid", "lg-icon-preg-late", "lg-icon-child-newborn", "lg-icon-child-infant", "lg-icon-child-toddler", "lg-icon-child-preschool", "lg-icon-wj-growth", "lg-icon-wj-nutrition", "lg-icon-wj-develop", "lg-icon-wj-vision", "lg-icon-wj-hearing", "lg-icon-wj-oral", "lg-icon-wj-oral-scope"];

export const GM_ICON_GLYPH: Record<GmIconName, string> = {
  "lg-icon-search": '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4 21 21"/>',
  "lg-icon-home": '<path d="M4.5 10.5 12 4.2l7.5 6.3"/><path d="M6.3 9.4v9.3a1.6 1.6 0 0 0 1.6 1.6h8.2a1.6 1.6 0 0 0 1.6-1.6V9.4"/><path d="M10 20.3v-4.6h4v4.6"/>',
  "lg-icon-user": '<circle cx="12" cy="8.2" r="3.7"/><path d="M5 20.4c1.3-3.6 4.1-5.3 7-5.3s5.7 1.7 7 5.3"/>',
  "lg-icon-bell": '<path d="M18 8.2a6 6 0 0 0-12 0c0 6.8-2.8 8.8-2.8 8.8h17.6S18 15 18 8.2"/><path d="M13.9 20.4a2 2 0 0 1-3.8 0"/>',
  "lg-icon-star": '<path d="m12 3.6 2.5 5.4 5.9.8-4.3 4.2 1 5.9-5.1-2.7-5.1 2.7 1-5.9L3.6 9.8l5.9-.8z"/>',
  "lg-icon-grid": '<rect x="4" y="4" width="6.6" height="6.6" rx="1.8"/><rect x="13.4" y="4" width="6.6" height="6.6" rx="1.8"/><rect x="4" y="13.4" width="6.6" height="6.6" rx="1.8"/><rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.8"/>',
  "lg-icon-layers": '<path d="m12 3.6 8.4 4.4L12 12.4 3.6 8z"/><path d="M3.6 12.4l8.4 4.4 8.4-4.4"/><path d="M3.6 16.4l8.4 4.4 8.4-4.4"/>',
  "lg-icon-settings": '<path d="M4 7h9.6M18.4 7h1.6"/><path d="M4 17h1.6M9.6 17H20"/><circle cx="16" cy="7" r="1.8"/><circle cx="7.2" cy="17" r="1.8"/>',
  "lg-icon-arrow-right": '<path d="M4 12h14.5"/><path d="m13 6.5 5.5 5.5-5.5 5.5"/>',
  "lg-icon-arrow-left": '<path d="M20 12H5.5"/><path d="m11 6.5-5.5 5.5L11 17.5"/>',
  "lg-icon-arrow-up": '<path d="M12 20V5.5"/><path d="m6.5 11 5.5-5.5L17.5 11"/>',
  "lg-icon-arrow-down": '<path d="M12 4v14.5"/><path d="m6.5 13 5.5 5.5L17.5 13"/>',
  "lg-icon-chevron-right": '<path d="m9.5 6.5 5.5 5.5-5.5 5.5"/>',
  "lg-icon-chevron-down": '<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',
  "lg-icon-external-link": '<path d="M14 4.5h5.5V10"/><path d="M19.5 4.5 11 13"/><path d="M19.5 13.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4.5"/>',
  "lg-icon-plus": '<path d="M12 5.5v13M5.5 12h13"/>',
  "lg-icon-minus": '<path d="M5.5 12h13"/>',
  "lg-icon-check": '<path d="m5 12.5 4.6 4.6L19 7.5"/>',
  "lg-icon-close": '<path d="m6.5 6.5 11 11M17.5 6.5l-11 11"/>',
  "lg-icon-more": '<circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none"/><circle cx="5.5" cy="12" r="1.15" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.15" fill="currentColor" stroke="none"/>',
  "lg-icon-edit": '<path d="M12.5 19.5H20"/><path d="m16.6 4.4a2.1 2.1 0 0 1 3 3L8 19l-4 1 1-4z"/>',
  "lg-icon-trash": '<path d="M4.5 6.8h15"/><path d="M9 6.8V4.8h6v2"/><path d="M6.3 6.8l.8 12.9a2 2 0 0 0 2 1.9h5.8a2 2 0 0 0 2-1.9l.8-12.9"/><path d="M10.2 10.5v5M13.8 10.5v5"/>',
  "lg-icon-copy": '<rect x="8.8" y="8.8" width="10.7" height="10.7" rx="2"/><path d="M15.2 8.8V6.4a1.6 1.6 0 0 0-1.6-1.6H6.4a1.6 1.6 0 0 0-1.6 1.6v7.2a1.6 1.6 0 0 0 1.6 1.6h2.4"/>',
  "lg-icon-download": '<path d="M12 4v10"/><path d="m6.8 9.8 5.2 5.2 5.2-5.2"/><path d="M4.5 19.8h15"/>',
  "lg-icon-upload": '<path d="M12 14.5V4"/><path d="m6.8 8.7 5.2-5.2 5.2 5.2"/><path d="M4.5 19.8h15"/>',
  "lg-icon-refresh": '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4.5h-4.5"/>',
  "lg-icon-send": '<path d="M21.5 2.5 10.5 13.5"/><path d="M21.5 2.5 14.5 21.5l-4-8-8-4z"/>',
  "lg-icon-info": '<circle cx="12" cy="12" r="9"/><path d="M12 10.8v4.8"/><circle cx="12" cy="7.6" r="1" fill="currentColor" stroke="none"/>',
  "lg-icon-warning": '<path d="M12 3.8 21.4 19.7a1.5 1.5 0 0 1-1.3 2.2H3.9a1.5 1.5 0 0 1-1.3-2.2z"/><path d="M12 10.2v4.6"/><circle cx="12" cy="17.3" r=".95" fill="currentColor" stroke="none"/>',
  "lg-icon-success": '<circle cx="12" cy="12" r="9"/><path d="m8.2 12.4 2.6 2.6 5-5.6"/>',
  "lg-icon-error": '<circle cx="12" cy="12" r="9"/><path d="m9.4 9.4 5.2 5.2M14.6 9.4l-5.2 5.2"/>',
  "lg-icon-help": '<circle cx="12" cy="12" r="9"/><path d="M9.7 9.3a2.4 2.4 0 0 1 4.7.8c0 1.7-2.4 2-2.4 3.5"/><circle cx="12" cy="17" r=".95" fill="currentColor" stroke="none"/>',
  "lg-icon-clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>',
  "lg-icon-database": '<ellipse cx="12" cy="5.4" rx="8.4" ry="3"/><path d="M20.4 5.4v13.2c0 1.7-3.8 3-8.4 3s-8.4-1.3-8.4-3V5.4"/><path d="M3.6 12c0 1.7 3.8 3 8.4 3s8.4-1.3 8.4-3"/>',
  "lg-icon-server": '<rect x="3.6" y="3.6" width="16.8" height="7" rx="2"/><rect x="3.6" y="13.4" width="16.8" height="7" rx="2"/><circle cx="7.4" cy="7.1" r=".95" fill="currentColor" stroke="none"/><circle cx="7.4" cy="16.9" r=".95" fill="currentColor" stroke="none"/>',
  "lg-icon-cloud": '<path d="M17.5 19H9a7 7 0 1 1 6.7-9.4A5.5 5.5 0 0 1 17.5 19Z"/>',
  "lg-icon-file": '<path d="M14 3.6H6.8A1.8 1.8 0 0 0 5 5.4v13.2a1.8 1.8 0 0 0 1.8 1.8h10.4a1.8 1.8 0 0 0 1.8-1.8V8z"/><path d="M14 3.6V8h4.4"/><path d="M8.6 12.8h6.8M8.6 16h4.2"/>',
  "lg-icon-folder": '<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
  "lg-icon-chart-bar": '<path d="M3.5 20.5h17"/><path d="M6.8 20.5v-5.4M12 20.5v-11M17.2 20.5v-8"/>',
  "lg-icon-chart-line": '<path d="M3.5 20.5h17"/><path d="m5 16.5 4.2-4.6 3.6 3.4 6-6.8"/>',
  "lg-icon-chart-pie": '<path d="M21.2 15.8A10 10 0 1 1 8.2 2.9"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
  "lg-icon-network": '<circle cx="18.4" cy="5.6" r="2.6"/><circle cx="5.6" cy="12" r="2.6"/><circle cx="18.4" cy="18.4" r="2.6"/><path d="M8 11.1l8.2-4.2M8 12.9l8.2 4.2"/>',
  "lg-icon-globe": '<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2"/><path d="M12 3.4c2.9 2.6 2.9 14.6 0 17.2"/><path d="M12 3.4c-2.9 2.6-2.9 14.6 0 17.2"/>',
  "lg-icon-shield": '<path d="M12 3.2 19 5.7v5.4c0 4.6-3 8.3-7 9.7-4-1.4-7-5.1-7-9.7V5.7z"/>',
  "lg-icon-shield-check": '<path d="M12 3.2 19 5.7v5.4c0 4.6-3 8.3-7 9.7-4-1.4-7-5.1-7-9.7V5.7z"/><path d="m9.2 11.9 2 2 3.6-3.9"/>',
  "lg-icon-lock": '<rect x="5.2" y="10.6" width="13.6" height="9.8" rx="2.2"/><path d="M8.2 10.6V7.8a3.8 3.8 0 0 1 7.6 0v2.8"/><circle cx="12" cy="15.2" r="1" fill="currentColor" stroke="none"/>',
  "lg-icon-key": '<circle cx="8" cy="16" r="3.8"/><path d="M11 13 20.6 3.4"/><path d="m16.4 7.4 2.4 2.4"/>',
  "lg-icon-eye": '<path d="M2.6 12S6.2 5.8 12 5.8 21.4 12 21.4 12 17.8 18.2 12 18.2 2.6 12 2.6 12z"/><circle cx="12" cy="12" r="3.1"/>',
  "lg-icon-ai-spark": '<path d="M12 3.4l2.1 5.2 5.2 2.1-5.2 2.1-2.1 5.2-2.1-5.2-5.2-2.1 5.2-2.1z"/><path d="M18.6 16.2l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>',
  "lg-icon-ai-bot": '<rect x="4.6" y="8.6" width="14.8" height="10.8" rx="4"/><path d="M9.2 8.6V5.8h5.6v2.8"/><circle cx="9.7" cy="13.8" r=".95" fill="currentColor" stroke="none"/><circle cx="14.3" cy="13.8" r=".95" fill="currentColor" stroke="none"/><path d="M9.6 16.8h4.8"/>',
  "lg-icon-image": '<rect x="3.8" y="5" width="16.4" height="14" rx="2.2"/><circle cx="9" cy="10" r="1.5"/><path d="m21 15.2-4.8-4.4-8.6 8"/>',
  "lg-icon-play": '<path d="M9.4 6.4v11.2L18.6 12z"/>',
  "lg-icon-calendar": '<rect x="4" y="5.4" width="16" height="14.6" rx="2.2"/><path d="M4 9.6h16M8.4 3.6v3.6M15.6 3.6v3.6"/><path d="M8.4 13.4h2M13.6 13.4h2M8.4 16.6h2M13.6 16.6h2"/>',
  "lg-icon-pin": '<path d="M12 21.4s-7-6.3-7-11.2a7 7 0 0 1 14 0c0 4.9-7 11.2-7 11.2z"/><circle cx="12" cy="10.2" r="2.7"/>',
  "lg-icon-monitor": '<rect x="3.2" y="4.2" width="17.6" height="12.4" rx="2"/><path d="M9 20.2h6M12 16.6v3.6"/>',
  "lg-icon-list": '<path d="M9 6.6h11M9 12h11M9 17.4h11"/><circle cx="4.8" cy="6.6" r="1" fill="currentColor" stroke="none"/><circle cx="4.8" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4.8" cy="17.4" r="1" fill="currentColor" stroke="none"/>',
  "lg-icon-baby": '<circle cx="12" cy="13.2" r="6.9"/><circle cx="9.6" cy="12.2" r="1" fill="currentColor" stroke="none"/><circle cx="14.4" cy="12.2" r="1" fill="currentColor" stroke="none"/><path d="M9.7 15.8c1.4 1.1 3.2 1.1 4.6 0"/><path d="M8.9 8.2c-.6-1.4.3-2.4 1.8-2.7M15.1 8.2c.6-1.4-.3-2.4-1.8-2.7"/>',
  "lg-icon-mom": '<circle cx="9.4" cy="10.4" r="3.1"/><path d="M3.6 20.4c1.1-2.9 3.3-4.2 5.8-4.2 1.4 0 2.6.4 3.6 1.1"/><path d="m20.6 10.6 1 1.9 2.1.4-1.5 1.5.4 2.1-2-1-2 1 .4-2.1-1.5-1.5 2.1-.4z"/>',
  "lg-icon-milk": '<path d="M12 3.4c3 4.3 5 6.9 5 9.6a5 5 0 0 1-10 0c0-2.7 2-5.3 5-9.6z"/><path d="M9.5 12.8c.6 1.6 4.4 1.6 5 0"/>',
  "lg-icon-vaccine": '<rect x="8.7" y="8.7" width="6.6" height="10.4" rx="2.6"/><path d="M10.3 8.7V6.5h3.4v2.2"/><path d="M9.6 6.5h4.8"/><path d="M9.6 12.5h4.8M10.6 15.5h2.8"/>',
  "lg-icon-vital": '<path d="M3.2 12.4h3.2l1.9-3.4 2.9 6.6 2.1-4.2 1.2 1h6.3"/><path d="M4 20.4h16"/>',
  "lg-icon-clinic": '<path d="M3.2 20.6h17.6"/><path d="M5.6 20.6V7.4a1.8 1.8 0 0 1 1.8-1.8h9.2a1.8 1.8 0 0 1 1.8 1.8v13.2"/><path d="M10.2 20.6v-4h3.6v4"/><path d="M9.4 11.4h5.2M12 8.8v5.2"/>',
  "lg-icon-preg-prep": '<circle cx="12" cy="6.3" r="2.6"/><circle cx="12" cy="13.4" r="2.9"/><path d="M18.9 3.2l.9 1.7 1.9.4-1.4 1.4.4 1.9-1.8-1-1.8 1 .4-1.9-1.4-1.4 1.9-.4z"/>',
  "lg-icon-preg-early": '<circle cx="12" cy="6.3" r="2.6"/><circle cx="12" cy="15.6" r="3.6"/><path d="M8.9 14.6h6.2"/>',
  "lg-icon-preg-mid": '<circle cx="12" cy="6.3" r="2.6"/><circle cx="12" cy="16.9" r="4.3"/><path d="M8.3 16h7.4M8.9 18h6.2"/>',
  "lg-icon-preg-late": '<circle cx="12" cy="6.3" r="2.6"/><circle cx="12" cy="18" r="4.9"/><path d="M7.8 17.2h8.4M8.6 19.6h6.8"/>',
  "lg-icon-child-newborn": '<circle cx="12" cy="8.6" r="2.7"/><rect x="9.1" y="12.4" width="5.8" height="6.8" rx="2.9"/><path d="M9.1 15.2h5.8"/>',
  "lg-icon-child-infant": '<circle cx="12" cy="7.2" r="3.1"/><path d="M9.8 11.6v2.6a2.2 2.2 0 0 0 4.4 0v-2.6"/><path d="M9.9 14.6a2.1 2.1 0 0 0 4.2 0"/>',
  "lg-icon-child-toddler": '<circle cx="12" cy="5.6" r="2.4"/><rect x="10.1" y="9.4" width="3.8" height="4.2" rx="1.9"/><path d="M10.2 10.2 8.8 12M13.8 10.2l1.4 1.8"/><path d="M11 13.8v3.4M13 13.8v3.4"/>',
  "lg-icon-child-preschool": '<circle cx="12" cy="5.2" r="2.4"/><rect x="10" y="8.6" width="4" height="5.6" rx="2"/><path d="M10.2 9.4 8.7 11.4M13.8 9.4l1.5 2"/><path d="M10.8 14.4v5M13.2 14.4v5"/><rect x="15.3" y="8" width="2.5" height="3.8" rx="1"/>',
  "lg-icon-wj-growth": '<circle cx="8.6" cy="6.9" r="2.1"/><path d="M8.6 9.1v3.4"/><path d="M6.9 10.9l1.7.7M10.3 10.9l-1.7.7"/><path d="M8.6 12.5 7.5 15.2M8.6 12.5l1.1 2.7"/><path d="M16.6 5v12"/><path d="M15.2 7.3 16.6 5l1.4 2.3"/><path d="M15.2 14.7 16.6 17l1.4-2.3"/>',
  "lg-icon-wj-nutrition": '<circle cx="11.8" cy="14.6" r="5.4"/><path d="M11.8 9.5c.3-1.9 1.2-3.1 2.9-3.8"/><path d="M14.5 6.1c1.7-.7 3.1-.5 4 .4"/>',
  "lg-icon-wj-develop": '<circle cx="12" cy="12.2" r="6.4"/><circle cx="9.8" cy="11" r=".95" fill="currentColor" stroke="none"/><circle cx="14.2" cy="11" r=".95" fill="currentColor" stroke="none"/><path d="M9.5 14.3c1.5 1.2 3.5 1.2 5 0"/><path d="M18.6 4.8l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/><path d="M4.8 5.6l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z"/>',
  "lg-icon-wj-vision": '<path d="M3.6 13.2s3-6.2 8.4-6.2 8.4 6.2 8.4 6.2-3 6.2-8.4 6.2S3.6 13.2 3.6 13.2z"/><circle cx="12" cy="13.2" r="3.1"/><path d="M15.8 3.8h4.6M15.8 3.8V8.4M15.8 5.3h3.2M15.8 6.9h4.6"/>',
  "lg-icon-wj-hearing": '<path d="M4.4 12.8a7.6 7.6 0 0 1 15.2 0"/><rect x="2.2" y="11.8" width="4.2" height="6" rx="1.9"/><rect x="17.6" y="11.8" width="4.2" height="6" rx="1.9"/><path d="M8.6 8.2a3.4 3.4 0 0 1 6.8 0"/>',
  "lg-icon-wj-oral": '<path d="M17.2 4.6c-1.6 0-2.6.8-3.5 1.8a3 3 0 0 1-3.4 0C9.4 5.4 8.4 4.6 6.8 4.6c-2.1 0-3.7 1.7-3.7 3.8 0 1.6.7 2.8 1.7 3.8 1.3 1.5 2.3 3.2 2.5 5.3.1 1.3.9 2.1 1.9 2.1.9 0 1.3-.6 1.6-1.6.5-1.2.9-2.5 1.9-2.5 1 0 1.5 1.2 2 2.4.3 1 .7 1.7 1.6 1.7 1 0 1.8-.8 1.9-2.1.2-2 1-3.7 2.3-5.1 1-1.1 1.7-2.4 1.7-3.9 0-2.1-1.6-3.9-3.7-3.9z"/>',
  "lg-icon-wj-oral-scope": '<path d="M17.2 4.6c-1.6 0-2.6.8-3.5 1.8a3 3 0 0 1-3.4 0C9.4 5.4 8.4 4.6 6.8 4.6c-2.1 0-3.7 1.7-3.7 3.8 0 1.6.7 2.8 1.7 3.8 1.3 1.5 2.3 3.2 2.5 5.3.1 1.3.9 2.1 1.9 2.1.9 0 1.3-.6 1.6-1.6.5-1.2.9-2.5 1.9-2.5 1 0 1.5 1.2 2 2.4.3 1 .7 1.7 1.6 1.7 1 0 1.8-.8 1.9-2.1.2-2 1-3.7 2.3-5.1 1-1.1 1.7-2.4 1.7-3.9 0-2.1-1.6-3.9-3.7-3.9z" transform="translate(-1.4 4.6) scale(0.62)"/><circle cx="19" cy="5.4" r="3.5"/><path d="M16.5 7.9 13.4 11"/><circle cx="19" cy="5.4" r="1.1"/>',
};

export function gmIcon(name: GmIconName, size = 20): string {
  return `<svg class="gm-i" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${GM_ICON_GLYPH[name]}</svg>`;
}
