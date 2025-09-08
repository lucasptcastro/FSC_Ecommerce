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

/* -------------------------------------------------------------------------- */
/*                                   Tables                                   */
/* -------------------------------------------------------------------------- */

export const categoryTable = pgTable("category", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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

export const shippingAddressTable = pgTable("shipping_address", {
  id: uuid().primaryKey().defaultRandom(),
  recipientName: text().notNull(),
  street: text().notNull(),
  number: text().notNull(),
  complement: text(),
  city: text().notNull(),
  state: text().notNull(),
  neighborhood: text().notNull(),
  zipCode: text().notNull(),
  country: text().notNull(),
  phone: text().notNull(),
  email: text().notNull(),
  cpfOrCnpj: text().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),

  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }), // referência ao usuário dono do endereço
});

export const cartTable = pgTable("cart", {
  id: uuid().primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }), // referência ao usuário dono do carrinho
  shippingAddressId: uuid("shipping_address_id").references(
    () => shippingAddressTable.id,
    {
      onDelete: "set null",
    },
  ), // referência ao endereço de entrega selecionado
});

export const cartItemTable = pgTable("cart_item", {
  id: uuid().primaryKey().defaultRandom(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  cartId: uuid("cart_id")
    .notNull()
    .references(() => cartTable.id, { onDelete: "cascade" }), // se o carrinho for deletado, os itens também serão
  productVariantId: uuid("product_variant_id")
    .notNull()
    .references(() => productVariantTable.id, { onDelete: "cascade" }), // se a variante for deletada, o item do carrinho também será
});

/* -------------------------------- Relations ------------------------------- */

export const categoryRelations = relations(categoryTable, ({ many }) => ({
  products: many(productTable), // uma categoria pode ter vários produtos
}));

export const productRelations = relations(productTable, ({ one, many }) => ({
  // um produto pertence a uma categoria
  category: one(categoryTable, {
    fields: [productTable.categoryId], // o campo categoryId referencia o id da categoria (valor do references)
    references: [categoryTable.id],
  }),

  // um produto pode ter várias variantes
  variants: many(productVariantTable),
}));

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

export const shippingAddressRelations = relations(
  shippingAddressTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [shippingAddressTable.userId], // o campo userId referencia o id do usuário da tabela de usuários
      references: [userTable.id],
    }),
    cart: one(cartTable, {
      fields: [shippingAddressTable.id],
      references: [cartTable.shippingAddressId],
    }),
  }),
);

export const cartRelations = relations(cartTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [cartTable.userId],
    references: [userTable.id],
  }),
  shippingAddress: one(shippingAddressTable, {
    fields: [cartTable.shippingAddressId],
    references: [shippingAddressTable.id],
  }),
  items: many(cartItemTable), // um carrinho pode ter vários itens
}));

export const cartItemRelations = relations(cartItemTable, ({ one }) => ({
  cart: one(cartTable, {
    fields: [cartItemTable.cartId],
    references: [cartTable.id],
  }),
  productVariant: one(productVariantTable, {
    fields: [cartItemTable.productVariantId],
    references: [productVariantTable.id],
  }),
}));

/* -------------------------------------------------------------------------- */
/*                             Better Auth tables                             */
/* -------------------------------------------------------------------------- */

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

export const verificationTable = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

/* -------------------------------- Relations ------------------------------- */

export const userRelations = relations(userTable, ({ many, one }) => ({
  shippingAddresses: many(shippingAddressTable), // um usuário pode ter vários endereços de entrega
  cart: one(cartTable, {
    fields: [userTable.id],
    references: [cartTable.userId],
  }), // um usuário tem apenas um carrinho
}));
