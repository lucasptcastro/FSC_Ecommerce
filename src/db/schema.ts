import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// a convenção sql para nomear colunas/tabelas sugere usar snake_case

export const userTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
});

export const categoryTable = pgTable("category", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categoryRelations = relations(categoryTable, ({ many }) => ({
  products: many(productTable), // uma categoria pode ter vários produtos
}));

export const productTable = pgTable("product", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique(), // url friendly
  description: text().notNull(),
  priceInCents: integer("price_in_cents").notNull(), // R$10,00 = 1000
  createdAt: timestamp("created_at").notNull().defaultNow(),

  // chaves estrangeiras
  categoryId: uuid()
    .notNull()
    .references(() => categoryTable.id),
});

export const productRelations = relations(productTable, ({ one, many }) => ({
  // um produto pertence a uma categoria
  category: one(categoryTable, {
    fields: [productTable.categoryId], // o campo categoryId referencia o id da categoria (valor do references)
    references: [categoryTable.id],
  }),

  // um produto pode ter várias variantes
  variants: many(productVariantTable),
}));

export const productVariantTable = pgTable("product_variant", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  color: text().notNull(),
  priceInCents: integer("price_in_cents").notNull(), // o preço do produto pode variar de acordo com a variante
  imageUrl: text("image_url").notNull(), // é interessante adicionar a imagem em algum serviço externo (s3, cloudflare) e salva a url no banco
  createdAt: timestamp("created_at").notNull().defaultNow(),

  // chaves estrangeiras
  productId: uuid()
    .notNull()
    .references(() => productTable.id),
});

export const productVariantRelations = relations(
  productVariantTable,
  ({ one }) => ({
    // uma variante de produto pertence a um produto
    product: one(productTable, {
      fields: [productVariantTable.productId],
      references: [productTable.id],
    }),
  }),
);
