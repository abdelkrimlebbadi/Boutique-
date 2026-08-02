"use client";

import {
  createContext,
  useContext,
  useOptimistic,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { addToCart as addToCartAction } from "@/actions/cart";
import type { CartItemView, CartView } from "@/lib/cart/types";

export type AddToCartInput = {
  variantId: string;
  sku: string;
  size: string | null;
  color: string | null;
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  priceCents: number;
};

type CartContextValue = {
  cart: CartView;
  isOpen: boolean;
  isPending: boolean;
  open: () => void;
  close: () => void;
  addItem: (input: AddToCartInput, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function applyOptimisticAdd(
  state: CartView,
  input: AddToCartInput,
  quantity: number
): CartView {
  const existing = state.items.find((item) => item.variantId === input.variantId);

  const items: CartItemView[] = existing
    ? state.items.map((item) =>
        item.variantId === input.variantId
          ? {
              ...item,
              quantity: item.quantity + quantity,
              lineTotalCents: (item.quantity + quantity) * item.unitPriceCents,
            }
          : item
      )
    : [
        ...state.items,
        {
          id: `optimistic-${input.variantId}`,
          variantId: input.variantId,
          quantity,
          sku: input.sku,
          size: input.size,
          color: input.color,
          productSlug: input.productSlug,
          productName: input.productName,
          imageUrl: input.imageUrl,
          imageAlt: input.productName,
          unitPriceCents: input.priceCents,
          lineTotalCents: input.priceCents * quantity,
        },
      ];

  return {
    ...state,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
  };
}

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: CartView;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticCart, setOptimisticCart] = useOptimistic(
    initialCart,
    (state: CartView, action: { input: AddToCartInput; quantity: number }) =>
      applyOptimisticAdd(state, action.input, action.quantity)
  );

  function addItem(input: AddToCartInput, quantity: number) {
    setIsOpen(true);
    setError(null);
    startTransition(async () => {
      setOptimisticCart({ input, quantity });
      const result = await addToCartAction({ variantId: input.variantId, quantity });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <CartContext.Provider
      value={{
        cart: optimisticCart,
        isOpen,
        isPending,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        addItem,
      }}
    >
      {/* Temporary diagnostic banner: surfaces the real addToCart failure,
          which Next.js otherwise replaces with an opaque digest in
          production. Remove together with the try/catch in actions/cart.ts. */}
      {error && (
        <div className="fixed inset-x-0 top-0 z-[100] bg-red-700 p-3 text-center text-sm text-white">
          {error}
        </div>
      )}
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
