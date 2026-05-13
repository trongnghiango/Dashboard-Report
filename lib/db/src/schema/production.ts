import { pgTable, serial, integer, text, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productionTable = pgTable("production", {
  id: serial("id").primaryKey(),
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
  mayTSCa1: text("may_ts_ca1"),
  thoiGianTSCa1: numeric("thoi_gian_ts_ca1"),
  sanLuongCa1: numeric("san_luong_ca1"),
  mayTSCa2: text("may_ts_ca2"),
  thoiGianTSCa2: numeric("thoi_gian_ts_ca2"),
  sanLuongCa2: numeric("san_luong_ca2"),
  mayTSCa3: text("may_ts_ca3"),
  thoiGianTSCa3: numeric("thoi_gian_ts_ca3"),
  sanLuongCa3: numeric("san_luong_ca3"),
  tongSLNgay: numeric("tong_sl_ngay"),
  slDonHangDaSX: numeric("sl_don_hang_da_sx"),
  slLuyKeTuan: numeric("sl_luy_ke_tuan"),
  luyKeTHang: numeric("luy_ke_thang"),
  canSXTiep: numeric("can_sx_tiep"),
  dvt: text("dvt"),
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
  tyLeHoanThanh: numeric("ty_le_hoan_thanh"),
  ghiChu: text("ghi_chu"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductionSchema = createInsertSchema(productionTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduction = z.infer<typeof insertProductionSchema>;
export type Production = typeof productionTable.$inferSelect;
