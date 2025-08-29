import Image from "next/image";

import { Header } from "@/components/common/header";
import { ProductList } from "@/components/common/product-list";
import { db } from "@/db";

export default async function Home() {
  const productsWithVariants = await db.query.productTable.findMany({
    with: {
      variants: true,
    },
  });

  return (
    <>
      <Header />

      <div className="space-y-6">
        <div className="px-5">
          <Image
            className="h-auto w-full" // este classname e a propriedade sizes fazem com que a imagem se redimensione conforme o tamanho da tela para manter qualidade
            src="/banner-01.png"
            alt="Leve uma vida com estilo"
            width={0}
            height={0}
            sizes="100vw"
          />
        </div>

        <ProductList products={productsWithVariants} title="Mais vendidos" />

        <div className="px-5">
          <Image
            className="h-auto w-full" // este classname e a propriedade sizes fazem com que a imagem se redimensione conforme o tamanho da tela para manter qualidade
            src="/banner-02.png"
            alt="Leve uma vida com estilo"
            width={0}
            height={0}
            sizes="100vw"
          />
        </div>
      </div>
    </>
  );
}
