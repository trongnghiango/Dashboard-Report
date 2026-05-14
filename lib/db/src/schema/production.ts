import { pgTable, serial, integer, text, numeric, date, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  donHang: text("don_hang"),
  maSoi: text("ma_soi"),
  tenSoi: text("ten_soi"),
  slDonHang: numeric("sl_don_hang"),
  tyLeNhua: numeric("ty_le_nhua"),
  dvt: text("dvt"),
  ngayBanHanhLXK: text("ngay_ban_hanh_lxk"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("idx_orders_don_hang").on(t.donHang),
  index("idx_orders_ma_soi").on(t.maSoi),
]);

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

export const productionTable = pgTable("production", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").references(() => ordersTable.id),
  stt: integer("stt"),
  ngayNhap: date("ngay_nhap").notNull(),
  ngaySanXuat: date("ngay_san_xuat").notNull(),
  lenhXK: text("lenh_xk"),
  ngayBanHanhLXK: text("ngay_ban_hanh_lxk"),
  maSoi: text("ma_soi").notNull(),
  tenSoi: text("ten_soi").notNull(),
  tenSoiMoi: text("ten_soi_moi"),
  donHang: text("don_hang").notNull(),
  tyLeNhua: numeric("ty_le_nhua"),
  ngaySanXuatGanNhat: text("ngay_san_xuat_gan_nhat"),
  tongSLNgay: numeric("tong_sl_ngay"),
  slDonHangDaSX: numeric("sl_don_hang_da_sx"),
  slLuyKeTuan: numeric("sl_luy_ke_tuan"),
  luyKeTHang: numeric("luy_ke_thang"),
  canSXTiep: numeric("can_sx_tiep"),
  dvt: text("dvt"),
  tyLeHoanThanh: numeric("ty_le_hoan_thanh"),
  ghiChu: text("ghi_chu"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("idx_production_lenh_xk").on(t.lenhXK),
  index("idx_production_don_hang").on(t.donHang),
  index("idx_production_ngay_sx").on(t.ngaySanXuat),
  index("idx_production_order_id").on(t.orderId),
  index("idx_production_ma_soi").on(t.maSoi),
]);

export const insertProductionSchema = createInsertSchema(productionTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduction = z.infer<typeof insertProductionSchema>;
export type Production = typeof productionTable.$inferSelect;

export const productionRecordsTable = pgTable("production_records", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").references(() => ordersTable.id),
  ngaySanXuat: date("ngay_san_xuat").notNull(),
  ca: integer("ca").notNull(),
  mayTS: text("may_ts"),
  thoiGian: numeric("thoi_gian"),
  sanLuong: numeric("san_luong"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("idx_prod_records_order_id").on(t.orderId),
  index("idx_prod_records_ngay_sx").on(t.ngaySanXuat),
]);

export const insertProductionRecordSchema = createInsertSchema(productionRecordsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProductionRecord = z.infer<typeof insertProductionRecordSchema>;
export type ProductionRecord = typeof productionRecordsTable.$inferSelect;

export const productionWasteTable = pgTable("production_waste", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").references(() => ordersTable.id),
  ngaySanXuat: date("ngay_san_xuat").notNull(),
  phekeoMay: numeric("phe_keo_may"),
  pheChayMay: numeric("phe_chay_may"),
  pheChuyenDoi: numeric("phe_chuyen_doi"),
  pheSuCo: numeric("phe_su_co"),
  pheDungMay: numeric("phe_dung_may"),
  pheXuLy: numeric("phe_xu_ly"),
  tongPheNgay: numeric("tong_phe_ngay"),
  pheDonHang: numeric("phe_don_hang"),
  pheLuyKeTuan: numeric("phe_luy_ke_tuan"),
  pheLuyKeTHang: numeric("phe_luy_ke_thang"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("idx_prod_waste_order_id").on(t.orderId),
  index("idx_prod_waste_ngay_sx").on(t.ngaySanXuat),
]);

export const insertProductionWasteSchema = createInsertSchema(productionWasteTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProductionWaste = z.infer<typeof insertProductionWasteSchema>;
export type ProductionWaste = typeof productionWasteTable.$inferSelect;
