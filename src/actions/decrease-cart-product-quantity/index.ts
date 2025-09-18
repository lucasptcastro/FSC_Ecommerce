"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { cartItemTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import {
  DecreaseCartProductQuantitySchema,
  decreaseCartProductQuantitySchema,
} from "./schema";

export const decreaseCartProductQuantity = async (
  data: DecreaseCartProductQuantitySchema,
) => {
  decreaseCartProductQuantitySchema.parse(data); // se os tipos dos valores de data estiverem errados, lança um erro

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // verifica se o item do carrinho existe e busca o id do usuário dono do carrinho
  const cartItem = await db.query.cartItemTable.findFirst({
    where: (cartItem, { eq }) => eq(cartItem.id, data.cartItemId),
    with: {
      cart: true,
    },
  });

  // verifica se o item do carrinho existe
  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  // verifica se o item do carrinho pertence ao usuário logado
  const cartDoesNotBelongToUser = cartItem.cart.userId !== session.user.id;
  if (cartDoesNotBelongToUser) {
    throw new Error("Unauthorized");
  }

  // se a quantidade for 1, remove o item do carrinho
  if (cartItem.quantity === 1) {
    await db.delete(cartItemTable).where(eq(cartItemTable.id, cartItem.id));
    return;
  }

  // se a quantidade for maior que 1, diminui a quantidade em 1
  await db
    .update(cartItemTable)
    .set({ quantity: cartItem.quantity - 1 })
    .where(eq(cartItemTable.id, cartItem.id));
};
