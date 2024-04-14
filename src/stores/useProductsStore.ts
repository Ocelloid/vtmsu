import { create } from "zustand";

import type { Product } from "~/server/api/routers/shop";

interface State {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: State = {
  products: [],
  isLoading: false,
  error: null,
};

export const useProductsStore = create<State>(() => ({
  products: INITIAL_STATE.products,
  isLoading: INITIAL_STATE.isLoading,
  error: INITIAL_STATE.error,
}));
