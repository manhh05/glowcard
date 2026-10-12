import { useCallback, useEffect, useMemo, useState, type DependencyList } from 'react';
import { ApiError } from '../api/client';
import { toProduct } from '../api/adapters';
import { getProduct, listProducts } from '../api/products';

export function useAsync<T>(load: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: ApiError | null;
  }>({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    load()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((e) => {
        if (!cancelled) {
          const error = e instanceof ApiError ? e : new ApiError(0, 'Có lỗi xảy ra');
          setState({ data: null, loading: false, error });
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

export function useProductList() {
  const { data, loading, error, reload } = useAsync(() => listProducts(), []);

  const products = useMemo(() => (data ?? []).map(toProduct), [data]);

  // Danh sách mùi cho bộ lọc, cùng hình dạng với STANDARD_SCENTS cũ
  const scents = useMemo(() => {
    const map = new Map<number, { id: string; nameVi: string; nameEn: string }>();
    for (const p of data ?? []) {
      for (const s of p.scents) {
        if (!map.has(s.id)) map.set(s.id, { id: s.slug, nameVi: s.name_vi, nameEn: s.name_en });
      }
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  }, [data]);

  return { products, scents, loading, error, reload };
}

export function useProductDetail(slug: string | undefined) {
  return useAsync(
    () => (slug ? getProduct(slug) : Promise.reject(new ApiError(404, 'Not found'))),
    [slug],
  );
}