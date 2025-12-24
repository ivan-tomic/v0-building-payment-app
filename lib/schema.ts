import {
  pgTable,
  serial,
  integer,
  text,
  decimal,
  boolean,
  timestamp,
  date,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// =============================================
// TABLES
// =============================================

export const apartments = pgTable('apartments', {
  id: serial('id').primaryKey(),
  buildingNumber: integer('building_number').notNull(),
  apartmentNumber: integer('apartment_number').notNull(),
  floor: integer('floor').notNull(),
  sizeSqm: decimal('size_sqm', { precision: 5, scale: 2 }),
  monthlyFee: decimal('monthly_fee', { precision: 10, scale: 2 }).notNull().default('0.20'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueApartment: unique().on(table.buildingNumber, table.apartmentNumber),
}))

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('tenant').$type<'admin' | 'tenant'>(),
  apartmentId: integer('apartment_id').references(() => apartments.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  apartmentId: integer('apartment_id').notNull().references(() => apartments.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentDate: date('payment_date').notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  paymentMethod: text('payment_method'),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniquePayment: unique().on(table.apartmentId, table.month, table.year),
}))

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(),
  description: text('description'),
  expenseDate: date('expense_date').notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  createdBy: integer('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const lateFees = pgTable('late_fees', {
  id: serial('id').primaryKey(),
  apartmentId: integer('apartment_id').notNull().references(() => apartments.id, { onDelete: 'cascade' }),
  paymentId: integer('payment_id').references(() => payments.id, { onDelete: 'cascade' }),
  feeAmount: decimal('fee_amount', { precision: 10, scale: 2 }).notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  paid: boolean('paid').default(false),
  paidDate: date('paid_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueLateFee: unique().on(table.apartmentId, table.month, table.year),
}))

export const invitationCodes = pgTable('invitation_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  apartmentId: integer('apartment_id').notNull().references(() => apartments.id, { onDelete: 'cascade' }),
  createdBy: integer('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  usedBy: integer('used_by').references(() => users.id, { onDelete: 'set null' }),
  usedAt: timestamp('used_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
})

// =============================================
// RELATIONS
// =============================================

export const apartmentsRelations = relations(apartments, ({ many, one }) => ({
  users: many(users),
  payments: many(payments),
  lateFees: many(lateFees),
  invitationCodes: many(invitationCodes),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  apartment: one(apartments, {
    fields: [users.apartmentId],
    references: [apartments.id],
  }),
  payments: many(payments),
  expenses: many(expenses),
  createdInvitations: many(invitationCodes, { relationName: 'createdBy' }),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  apartment: one(apartments, {
    fields: [payments.apartmentId],
    references: [apartments.id],
  }),
  creator: one(users, {
    fields: [payments.createdBy],
    references: [users.id],
  }),
}))

export const expensesRelations = relations(expenses, ({ one }) => ({
  creator: one(users, {
    fields: [expenses.createdBy],
    references: [users.id],
  }),
}))

export const lateFeesRelations = relations(lateFees, ({ one }) => ({
  apartment: one(apartments, {
    fields: [lateFees.apartmentId],
    references: [apartments.id],
  }),
  payment: one(payments, {
    fields: [lateFees.paymentId],
    references: [payments.id],
  }),
}))

export const invitationCodesRelations = relations(invitationCodes, ({ one }) => ({
  apartment: one(apartments, {
    fields: [invitationCodes.apartmentId],
    references: [apartments.id],
  }),
  creator: one(users, {
    fields: [invitationCodes.createdBy],
    references: [users.id],
    relationName: 'createdBy',
  }),
  usedByUser: one(users, {
    fields: [invitationCodes.usedBy],
    references: [users.id],
  }),
}))

// =============================================
// TYPES
// =============================================

export type Apartment = typeof apartments.$inferSelect
export type NewApartment = typeof apartments.$inferInsert

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert

export type Expense = typeof expenses.$inferSelect
export type NewExpense = typeof expenses.$inferInsert

export type LateFee = typeof lateFees.$inferSelect
export type NewLateFee = typeof lateFees.$inferInsert

export type InvitationCode = typeof invitationCodes.$inferSelect
export type NewInvitationCode = typeof invitationCodes.$inferInsert
