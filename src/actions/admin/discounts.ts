"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const discountCodeSchema = z
  .object({
    id: z.string().uuid().nullable(),
    code: z.string().trim().min(1).max(40),
    type: z.enum(["fixed", "percentage"]),
    amountCents: z.number().int().nonnegative().nullable(),
    percentage: z.number().positive().max(100).nullable(),
    maxUses: z.number().int().positive().nullable(),
    expiresAt: z.string().nullable(),
    active: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "fixed" && value.amountCents == null) {
      ctx.addIssue({ code: "custom", path: ["amountCents"], message: "Requis pour un montant fixe" });
    }
    if (value.type === "percentage" && value.percentage == null) {
      ctx.addIssue({ code: "custom", path: ["percentage"], message: "Requis pour un pourcentage" });
    }
  });

export type SaveDiscountCodeInput = z.input<typeof discountCodeSchema>;

export async function saveDiscountCode(
  rawInput: SaveDiscountCodeInput
): Promise<{ error: string } | never> {
  await requireAdmin();
  const input = discountCodeSchema.parse(rawInput);
  const serviceRole = createServiceRoleClient();

  // The table's CHECK constraint requires mutual exclusivity between
  // amount_cents and percentage — explicitly null out whichever doesn't
  // apply to this type rather than omitting it, so switching a code's
  // type on edit doesn't leave a stale value from before.
  const row = {
    code: input.code,
    type: input.type,
    amount_cents: input.type === "fixed" ? input.amountCents : null,
    percentage: input.type === "percentage" ? input.percentage : null,
    max_uses: input.maxUses,
    expires_at: input.expiresAt,
    active: input.active,
  };

  const { error } = input.id
    ? await serviceRole.from("discount_codes").update(row).eq("id", input.id)
    : await serviceRole.from("discount_codes").insert(row);

  if (error) {
    console.error("saveDiscountCode failed:", error);
    return { error: "Impossible d'enregistrer le code. Ce code existe peut-être déjà." };
  }

  redirect("/admin/discounts");
}

const deleteDiscountCodeSchema = z.object({ discountId: z.string().uuid() });

export async function deleteDiscountCode(
  rawInput: z.input<typeof deleteDiscountCodeSchema>
): Promise<void> {
  await requireAdmin();
  const { discountId } = deleteDiscountCodeSchema.parse(rawInput);
  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole.from("discount_codes").delete().eq("id", discountId);
  if (error) throw new Error(error.message);
  redirect("/admin/discounts");
}

const toggleDiscountActiveSchema = z.object({
  discountId: z.string().uuid(),
  active: z.boolean(),
});

export async function toggleDiscountActive(
  rawInput: z.input<typeof toggleDiscountActiveSchema>
): Promise<void> {
  await requireAdmin();
  const { discountId, active } = toggleDiscountActiveSchema.parse(rawInput);
  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole
    .from("discount_codes")
    .update({ active })
    .eq("id", discountId);
  if (error) throw new Error(error.message);
  redirect("/admin/discounts");
}
