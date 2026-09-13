/**
 * 最小的数据请求 hook（19.2）
 *
 * 为什么不用 react-query / swr：本工程要求**离线可构建**（无外网 npm），
 * 而依赖已固定为 react / react-dom / arco / dayjs。这里用 40 行覆盖产品真正需要的四件事：
 * 加载态、错误态（三通道）、空态判定、手动重试；缓存交给 `key` 去重。
 * 需要跨页缓存/失效/乐观更新时，按 19.2 的升级路径换库，页面代码不用动。
 */
import { useCallback, useEffect, useState } from "react";
import { ApiError, request, type RequestOptions } from "./client";
import { clearCache, dropCached, getCached, hasCached, setCached } from "./cache";

export interface AsyncState<T> {
  data?: T;
  loading: boolean;
  error?: ApiError;
  /** 请求成功但结果为空 —— 空态与错误态必须分开（08.2.12 / 8.2.15） */
  empty: boolean;
  reload: () => void;
}

export function useRequest<T>(
  key: string,
  opt: RequestOptions,
  isEmpty?: (d: T) => boolean
): AsyncState<T> {
  const [data, setData] = useState<T | undefined>(() => getCached<T>(key));
  const [loading, setLoading] = useState(!hasCached(key));
  const [error, setError] = useState<ApiError | undefined>();
  const [tick, setTick] = useState(0);

  /* ⚠️ 只用一个"每次运行独立"的 cancelled 标志，**不要**再加组件级 alive ref。
     实测踩到的坑：为防卸载后 setState 而加的 `alive` ref，在 React 18 StrictMode 下
     会 mount → cleanup(把 alive 置 false) → 再 mount，而重新挂载时没人把它置回 true，
     于是后续所有 `.then` 都被拦下 —— 表现为**永远停在骨架、且不报任何错**
     （控制台干净，页面看着"就是没数据"）。StrictMode 只在开发期双调用，
     所以这类缺陷只在 dev 复现、生产正常，最容易带病上线。 */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    request<T>(opt)
      .then((d) => {
        if (cancelled) return;
        setCached(key, d);
        setData(d);
      })
      .catch((e: ApiError) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // opt 由调用方以常量字面量传入（模块 api.ts），这里按 key 去重
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick]);

  const reload = useCallback(() => { dropCached(key); setTick((t) => t + 1); }, [key]);
  const empty = !loading && !error && data !== undefined && (isEmpty ? isEmpty(data) : false);
  return { data, loading, error, empty, reload };
}
