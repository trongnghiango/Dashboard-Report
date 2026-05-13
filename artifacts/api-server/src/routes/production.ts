import { Router } from "express";
import { db, productionTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, sql, desc } from "drizzle-orm";
import {
  ListProductionQueryParams,
  CreateProductionBody,
  UpdateProductionBody,
  GetProductionParams,
  UpdateProductionParams,
  DeleteProductionParams,
  GetSummaryQueryParams,
  GetOutputTrendQueryParams,
  GetWasteBreakdownQueryParams,
  GetOrderCompletionQueryParams,
  GetShiftPerformanceQueryParams,
} from "@workspace/api-zod";

const router = Router();

function toNum(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function toDateStr(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (val instanceof Date) return val.toISOString().split("T")[0]!;
  return String(val);
}

function mapRow(row: typeof productionTable.$inferSelect) {
  return {
    id: row.id,
    stt: row.stt,
    ngayNhap: row.ngayNhap,
    ngaySanXuat: row.ngaySanXuat,
    lenhXK: row.lenhXK,
    ngayBanHanhLXK: row.ngayBanHanhLXK,
    maSoi: row.maSoi,
    tenSoi: row.tenSoi,
    tenSoiMoi: row.tenSoiMoi,
    donHang: row.donHang,
    tyLeNhua: toNum(row.tyLeNhua),
    ngaySanXuatGanNhat: row.ngaySanXuatGanNhat,
    mayTSCa1: row.mayTSCa1,
    thoiGianTSCa1: toNum(row.thoiGianTSCa1),
    sanLuongCa1: toNum(row.sanLuongCa1),
    mayTSCa2: row.mayTSCa2,
    thoiGianTSCa2: toNum(row.thoiGianTSCa2),
    sanLuongCa2: toNum(row.sanLuongCa2),
    mayTSCa3: row.mayTSCa3,
    thoiGianTSCa3: toNum(row.thoiGianTSCa3),
    sanLuongCa3: toNum(row.sanLuongCa3),
    tongSLNgay: toNum(row.tongSLNgay),
    slDonHangDaSX: toNum(row.slDonHangDaSX),
    slLuyKeTuan: toNum(row.slLuyKeTuan),
    luyKeTHang: toNum(row.luyKeTHang),
    canSXTiep: toNum(row.canSXTiep),
    dvt: row.dvt,
    phekeoMay: toNum(row.phekeoMay),
    pheChayMay: toNum(row.pheChayMay),
    pheChuyenDoi: toNum(row.pheChuyenDoi),
    pheSuCo: toNum(row.pheSuCo),
    pheDungMay: toNum(row.pheDungMay),
    pheXuLy: toNum(row.pheXuLy),
    tongPheNgay: toNum(row.tongPheNgay),
    pheDonHang: toNum(row.pheDonHang),
    pheLuyKeTuan: toNum(row.pheLuyKeTuan),
    pheLuyKeTHang: toNum(row.pheLuyKeTHang),
    tyLeHoanThanh: toNum(row.tyLeHoanThanh),
    ghiChu: row.ghiChu,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function dateRangeWhere(from: string | null | undefined, to: string | null | undefined) {
  const conditions = [];
  if (from) conditions.push(gte(productionTable.ngaySanXuat, from));
  if (to) conditions.push(lte(productionTable.ngaySanXuat, to));
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function todayStr() {
  return new Date().toISOString().split("T")[0]!;
}

function weekStartStr() {
  return new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0]!;
}

function monthStartStr() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0]!;
}

router.get("/production", async (req, res) => {
  const parsed = ListProductionQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { page = 1, limit = 50, dateFrom, dateTo, maySoi, donHang, lenhXK } = parsed.data;

  const conditions = [];
  if (dateFrom) conditions.push(gte(productionTable.ngaySanXuat, toDateStr(dateFrom)!));
  if (dateTo) conditions.push(lte(productionTable.ngaySanXuat, toDateStr(dateTo)!));
  if (maySoi) conditions.push(ilike(productionTable.maSoi, `%${maySoi}%`));
  if (donHang) conditions.push(ilike(productionTable.donHang, `%${donHang}%`));
  if (lenhXK) conditions.push(ilike(productionTable.lenhXK, `%${lenhXK}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(productionTable)
      .where(where)
      .orderBy(desc(productionTable.ngaySanXuat))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(productionTable)
      .where(where),
  ]);

  res.json({
    data: rows.map(mapRow),
    total: countResult[0]?.count ?? 0,
    page,
    limit,
  });
});

router.post("/production", async (req, res) => {
  const parsed = CreateProductionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const d = parsed.data as Record<string, unknown>;
  if (d.ngayNhap) d.ngayNhap = toDateStr(d.ngayNhap);
  if (d.ngaySanXuat) d.ngaySanXuat = toDateStr(d.ngaySanXuat);
  const [row] = await (db.insert(productionTable) as ReturnType<typeof db.insert>)
    .values(d)
    .returning();
  res.status(201).json(mapRow(row as typeof productionTable.$inferSelect));
});

router.get("/production/:id", async (req, res) => {
  const parsed = GetProductionParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db.select().from(productionTable).where(eq(productionTable.id, parsed.data.id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(mapRow(row));
});

router.patch("/production/:id", async (req, res) => {
  const idParsed = UpdateProductionParams.safeParse({ id: Number(req.params.id) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateProductionBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { ngayNhap, ngaySanXuat, ...rest } = bodyParsed.data;
  const setData: Record<string, unknown> = {
    ...rest,
    updatedAt: new Date(),
  };
  if (ngayNhap !== undefined) setData.ngayNhap = toDateStr(ngayNhap);
  if (ngaySanXuat !== undefined) setData.ngaySanXuat = toDateStr(ngaySanXuat);

  const rows = await (db
    .update(productionTable) as ReturnType<typeof db.update>)
    .set(setData)
    .where(eq(productionTable.id, idParsed.data.id))
    .returning();
  if (!rows[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(mapRow(rows[0] as typeof productionTable.$inferSelect));
});

router.delete("/production/:id", async (req, res) => {
  const parsed = DeleteProductionParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(productionTable).where(eq(productionTable.id, parsed.data.id));
  res.status(204).send();
});

router.get("/analytics/summary", async (req, res) => {
  const parsed = GetSummaryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const today = todayStr();
  const weekStart = weekStartStr();
  const monthStart = monthStartStr();

  const fromFilter = parsed.data.dateFrom ? toDateStr(parsed.data.dateFrom)! : monthStart;
  const toFilter = parsed.data.dateTo ? toDateStr(parsed.data.dateTo)! : today;

  const [allRows, todayRows, weekRows] = await Promise.all([
    db.select().from(productionTable).where(
      and(gte(productionTable.ngaySanXuat, fromFilter), lte(productionTable.ngaySanXuat, toFilter))
    ),
    db.select().from(productionTable).where(eq(productionTable.ngaySanXuat, today)),
    db.select().from(productionTable).where(
      and(gte(productionTable.ngaySanXuat, weekStart), lte(productionTable.ngaySanXuat, today))
    ),
  ]);

  const sumField = (rows: typeof allRows, field: keyof typeof allRows[0]) =>
    rows.reduce((acc, r) => acc + (toNum(r[field]) ?? 0), 0);

  const avgHT = allRows.length > 0
    ? allRows.reduce((acc, r) => acc + (toNum(r.tyLeHoanThanh) ?? 0), 0) / allRows.length
    : 0;

  res.json({
    tongSLNgayHienTai: sumField(todayRows, "tongSLNgay"),
    tongSLTuan: sumField(weekRows, "tongSLNgay"),
    tongSLThang: sumField(allRows, "tongSLNgay"),
    tongPheNgay: sumField(todayRows, "tongPheNgay"),
    tongPheTuan: sumField(weekRows, "tongPheNgay"),
    tongPheThang: sumField(allRows, "tongPheNgay"),
    soLenhDangSX: allRows.filter(r => (toNum(r.tyLeHoanThanh) ?? 0) < 100).length,
    tyLeHoanThanhTB: Math.round(avgHT * 10) / 10,
    soRecordHomNay: todayRows.length,
    soRecordTuan: weekRows.length,
  });
});

router.get("/analytics/output-trend", async (req, res) => {
  const parsed = GetOutputTrendQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const fromFilter = parsed.data.dateFrom ? toDateStr(parsed.data.dateFrom)! : monthStartStr();
  const toFilter = parsed.data.dateTo ? toDateStr(parsed.data.dateTo)! : todayStr();

  const rows = await db
    .select()
    .from(productionTable)
    .where(and(gte(productionTable.ngaySanXuat, fromFilter), lte(productionTable.ngaySanXuat, toFilter)))
    .orderBy(productionTable.ngaySanXuat);

  const byDate = new Map<string, { tongSL: number; tongPhe: number; slCa1: number; slCa2: number; slCa3: number }>();
  for (const r of rows) {
    const d = r.ngaySanXuat;
    if (!byDate.has(d)) byDate.set(d, { tongSL: 0, tongPhe: 0, slCa1: 0, slCa2: 0, slCa3: 0 });
    const entry = byDate.get(d)!;
    entry.tongSL += toNum(r.tongSLNgay) ?? 0;
    entry.tongPhe += toNum(r.tongPheNgay) ?? 0;
    entry.slCa1 += toNum(r.sanLuongCa1) ?? 0;
    entry.slCa2 += toNum(r.sanLuongCa2) ?? 0;
    entry.slCa3 += toNum(r.sanLuongCa3) ?? 0;
  }

  res.json(Array.from(byDate.entries()).map(([date, v]) => ({ date, ...v })));
});

router.get("/analytics/waste-breakdown", async (req, res) => {
  const parsed = GetWasteBreakdownQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const fromFilter = parsed.data.dateFrom ? toDateStr(parsed.data.dateFrom)! : monthStartStr();
  const toFilter = parsed.data.dateTo ? toDateStr(parsed.data.dateTo)! : todayStr();

  const rows = await db
    .select()
    .from(productionTable)
    .where(and(gte(productionTable.ngaySanXuat, fromFilter), lte(productionTable.ngaySanXuat, toFilter)));

  const sumField = (field: keyof typeof rows[0]) => rows.reduce((acc, r) => acc + (toNum(r[field]) ?? 0), 0);

  res.json({
    phekeoMay: sumField("phekeoMay"),
    pheChayMay: sumField("pheChayMay"),
    pheChuyenDoi: sumField("pheChuyenDoi"),
    pheSuCo: sumField("pheSuCo"),
    pheDungMay: sumField("pheDungMay"),
    pheXuLy: sumField("pheXuLy"),
  });
});

router.get("/analytics/order-completion", async (req, res) => {
  const parsed = GetOrderCompletionQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const fromFilter = parsed.data.dateFrom ? toDateStr(parsed.data.dateFrom)! : monthStartStr();
  const toFilter = parsed.data.dateTo ? toDateStr(parsed.data.dateTo)! : todayStr();

  const rows = await db
    .select()
    .from(productionTable)
    .where(and(gte(productionTable.ngaySanXuat, fromFilter), lte(productionTable.ngaySanXuat, toFilter)));

  const byOrder = new Map<string, { donHang: string; maSoi: string; tenSoi: string; slDonHangDaSX: number; canSXTiep: number; tyLeHoanThanh: number[] }>();
  for (const r of rows) {
    const key = `${r.donHang}__${r.maSoi}`;
    if (!byOrder.has(key)) {
      byOrder.set(key, { donHang: r.donHang, maSoi: r.maSoi, tenSoi: r.tenSoi, slDonHangDaSX: 0, canSXTiep: 0, tyLeHoanThanh: [] });
    }
    const entry = byOrder.get(key)!;
    entry.slDonHangDaSX += toNum(r.slDonHangDaSX) ?? 0;
    if (r.canSXTiep !== null) entry.canSXTiep = toNum(r.canSXTiep) ?? entry.canSXTiep;
    if (r.tyLeHoanThanh !== null && r.tyLeHoanThanh !== undefined) {
      entry.tyLeHoanThanh.push(toNum(r.tyLeHoanThanh) ?? 0);
    }
  }

  res.json(Array.from(byOrder.values()).map(v => ({
    donHang: v.donHang,
    maSoi: v.maSoi,
    tenSoi: v.tenSoi,
    slDonHangDaSX: v.slDonHangDaSX,
    canSXTiep: v.canSXTiep,
    tyLeHoanThanh: v.tyLeHoanThanh.length > 0 ? v.tyLeHoanThanh[v.tyLeHoanThanh.length - 1] : null,
  })));
});

router.get("/analytics/shift-performance", async (req, res) => {
  const parsed = GetShiftPerformanceQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const fromFilter = parsed.data.dateFrom ? toDateStr(parsed.data.dateFrom)! : monthStartStr();
  const toFilter = parsed.data.dateTo ? toDateStr(parsed.data.dateTo)! : todayStr();

  const rows = await db
    .select()
    .from(productionTable)
    .where(and(gte(productionTable.ngaySanXuat, fromFilter), lte(productionTable.ngaySanXuat, toFilter)));

  const ca1 = rows.reduce((acc, r) => acc + (toNum(r.sanLuongCa1) ?? 0), 0);
  const ca2 = rows.reduce((acc, r) => acc + (toNum(r.sanLuongCa2) ?? 0), 0);
  const ca3 = rows.reduce((acc, r) => acc + (toNum(r.sanLuongCa3) ?? 0), 0);
  const total = ca1 + ca2 + ca3 || 1;

  res.json({
    ca1,
    ca2,
    ca3,
    ca1Pct: Math.round((ca1 / total) * 1000) / 10,
    ca2Pct: Math.round((ca2 / total) * 1000) / 10,
    ca3Pct: Math.round((ca3 / total) * 1000) / 10,
  });
});

export default router;
