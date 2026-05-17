import { useEffect, useReducer } from "react";
import type { Product } from "@/lib/types";
import { getProductById } from "@/lib/api";

type State = {
  product: Product | null;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Product }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { product: null, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, product: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "RESET":
      return { product: null, loading: false, error: null };
    default:
      return state;
  }
}

export function useProductDetail(id: string | undefined) {
  const [state, dispatch] = useReducer(reducer, {
    product: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      dispatch({ type: "RESET" });
      return;
    }
    dispatch({ type: "FETCH_START" });
    getProductById(id)
      .then((res) => dispatch({ type: "FETCH_SUCCESS", payload: res.data }))
      .catch((err) => dispatch({ type: "FETCH_ERROR", payload: err.message }));
  }, [id]);

  return state;
}
