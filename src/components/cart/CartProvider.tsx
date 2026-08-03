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
import type { DesignState } from "@/lib/customize/types";

export type AddToCartInput = {
  variantId: string;
  sku: string;
  size: string | null;
  color: string | null;
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  priceCents: number;
  customDesign?: { imageUrl: string | null; state: DesignState };
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
  // A customized line is never merged into an existing row — each
  // personalization is its own line (see the partial unique index in
  // 20260728140200_cart_item_customization.sql, which only dedups plain,
  // non-customized rows).
  const existing = input.customDesign
    ? undefined
    : state.items.find(
        (item) => item.variantId === input.variantId && !item.customDesignImageUrl
      );

  const items: CartItemView[] = existing
    ? state.items.map((item) =>
        item.id === existing.id
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
          id: `optimistic-${input.variantId}-${Date.now()}`,
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
          customDesignImageUrl: input.customDesign?.imageUrl ?? null,
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
  const [isPending, startTransition] = useTransition();
  const [optimisticCart, setOptimisticCart] = useOptimistic(
    initialCart,
    (state: CartView, action: { input: AddToCartInput; quantity: number }) =>
      applyOptimisticAdd(state, action.input, action.quantity)
  );

  function addItem(input: AddToCartInput, quantity: number) {
    setIsOpen(true);
    startTransition(async () => {
      setOptimisticCart({ input, quantity });
      await addToCartAction({
        variantId: input.variantId,
        quantity,
        customDesignImageUrl: input.customDesign?.imageUrl ?? null,
        customDesignState: input.customDesign?.state,
      });
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
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
