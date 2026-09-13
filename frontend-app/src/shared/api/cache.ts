/**
 * 请求结果缓存（19.2）
 *
 * 独立成模块的原因：`useRequest` 与开发期 QA 开关都要操作它，
 * 放在 useRequest 里会让 mock.ts 反向 import useRequest（成环）。
 * 缓存键 = 调用方给的 key（模块 api.ts 里的常量），命中即免请求。
 */
const store = new Map<string, unknown>();

export const getCached = <T>(key: string): T | undefined => store.get(key) as T | undefined;
export const hasCached = (key: string): boolean => store.has(key);
export const setCached = (key: string, v: unknown): void => { store.set(key, v); };
export const dropCached = (key: string): void => { store.delete(key); };
/** 仅开发期 QA 用：手动重放四态时需要清空缓存 */
export const clearCache = (): void => { store.clear(); };
