import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// a convenção sql para nomear colunas/tabelas sugere usar snake_case

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
    .references(() => categoryTable.id, { onDelete: "set null" }), // se a categoria for deletada, a categoria do produto será setada como null
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
    .references(() => productTable.id, { onDelete: "cascade" }), // se o produto for deletado, as variantes também serão
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

// ----------- Better Auth tables

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const accountTable = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
