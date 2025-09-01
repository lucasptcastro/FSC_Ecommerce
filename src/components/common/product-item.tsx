"use client";

import Image from "next/image";
import Link from "next/link";

import { productTable, productVariantTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";
import { cn } from "@/lib/utils";

interface ProductListProps {
  product: typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  };
  textContainerClassname?: string;
}
export function ProductItem({
  product,
  textContainerClassname,
}: ProductListProps) {
  const firstVariant = product.variants[0];

  return (
    <Link href="#" className="flex flex-col gap-4">
      <Image
        src={firstVariant.imageUrl}
        alt={firstVariant.name}
        // as três propriedades abaixo funcionam como um "hack" para que a imagem ocupe 100% da largura do container
        sizes="100vw"
        width={0}
        height={0}
        className="h-auto w-full rounded-3xl"
      />

      {/* a função cn serve para mergear as classes do tailwind sem conflitos */}
      <div
        className={cn(
          "flex max-w-[200px] flex-col gap-1",
          textContainerClassname,
        )}
      >
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-muted-foreground truncate text-xs font-medium">
          {product.description}
        </p>

        <p className="truncate text-sm font-semibold">
          {formatCentsToBRL(firstVariant.priceInCents)}
        </p>
      </div>
    </Link>
  );
}
