"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { addProductCart } from "@/actions/add-cart-product";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  productVariantId: string;
  quantity: number;
}

export function AddToCartButton({
  productVariantId,
  quantity,
}: AddToCartButtonProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["addProductToCart", productVariantId, quantity], // o primeiro parâmetro é o identificador único da mutação, os outros são os dados que a mutação vai usar (há uma convenção que diz para passar os mesmos parâmetros da função que faz a mutação)
    mutationFn: () =>
      addProductCart({
        productVariantId,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] }); // faz com que todas as queries que utilizem esse queryKey sejam atualizadas
    },
  });

  return (
    <Button
      className="rounded-full"
      size="lg"
      variant="outline"
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isPending && <Loader2 className="size-4 animate-spin" />}
      Adicionar à sacola
    </Button>
  );
}
