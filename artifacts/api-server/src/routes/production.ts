import { Router } from "express";
import { db, productionTable, ordersTable, productionRecordsTable, productionWasteTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, sql, desc, or, getTableColumns, isNull } from "drizzle-orm";
import {
  ListProductionQueryParams,
  ListOrdersQueryParams,
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
  ImportProductionBody,
  GetProgressParentsQueryParams,
  GetProgressItemsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/debug/waste", async (req, res) => {
  const rows = await db.select().from(productionWasteTable).limit(10);
  res.json(rows);
});

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
  const r = row as any;
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
    mayTSCa1: r.mayTSCa1 ?? null,
    thoiGianTSCa1: toNum(r.thoiGianTSCa1),
    sanLuongCa1: toNum(r.sanLuongCa1),
    mayTSCa2: r.mayTSCa2 ?? null,
    thoiGianTSCa2: toNum(r.thoiGianTSCa2),
    sanLuongCa2: toNum(r.sanLuongCa2),
    mayTSCa3: r.mayTSCa3 ?? null,
    thoiGianTSCa3: toNum(r.thoiGianTSCa3),
    sanLuongCa3: toNum(r.sanLuongCa3),
    tongSLNgay: toNum(row.tongSLNgay),
    slDonHangDaSX: toNum(row.slDonHangDaSX),
    slLuyKeTuan: toNum(row.slLuyKeTuan),
    luyKeTHang: toNum(row.luyKeTHang),
    canSXTiep: toNum(row.canSXTiep),
    dvt: row.dvt,
    phekeoMay: toNum(r.phekeoMay),
    pheChayMay: toNum(r.pheChayMay),
    pheChuyenDoi: toNum(r.pheChuyenDoi),
    pheSuCo: toNum(r.pheSuCo),
    pheDungMay: toNum(r.pheDungMay),
    pheXuLy: toNum(r.pheXuLy),
    tongPheNgay: toNum(r.tongPheNgay),
    pheDonHang: toNum(r.pheDonHang),
    pheLuyKeTuan: toNum(r.pheLuyKeTuan),
    pheLuyKeTHang: toNum(r.pheLuyKeTHang),
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
  const { page = 1, limit = 50, dateFrom, dateTo, maySoi, donHang, lenhXK, search } = parsed.data;

  const conditions = [];
  if (dateFrom) conditions.push(gte(productionTable.ngaySanXuat, toDateStr(dateFrom)!));
  if (dateTo) conditions.push(lte(productionTable.ngaySanXuat, toDateStr(dateTo)!));
  if (maySoi) conditions.push(ilike(productionTable.maSoi, `%${maySoi}%`));
  if (donHang) conditions.push(ilike(productionTable.donHang, `%${donHang}%`));
  if (lenhXK) conditions.push(ilike(productionTable.lenhXK, `%${lenhXK}%`));
  
  if (search) {
    conditions.push(
      or(
        ilike(productionTable.lenhXK, `%${search}%`),
        ilike(productionTable.donHang, `%${search}%`),
        ilike(productionTable.maSoi, `%${search}%`),
        ilike(productionTable.tenSoi, `%${search}%`)
      ) as any
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const aggregatedRecords = db
    .select({
      orderId: productionRecordsTable.orderId,
      ngaySanXuat: productionRecordsTable.ngaySanXuat,
      mayTSCa1: sql<string | null>`MAX(CASE WHEN ${productionRecordsTable.ca} = 1 THEN ${productionRecordsTable.mayTS} END)`.as("may_ts_ca1"),
      thoiGianTSCa1: sql<string | null>`MAX(CASE WHEN ${productionRecordsTable.ca} = 1 THEN ${productionRecordsTable.thoiGian} END)`.as("thoi_gian_ts_ca1"),
      sanLuongCa1: sql<string | null>`MAX(CASE WHEN ${productionRecordsTable.ca} = 1 THEN ${productionRecordsTable.sanLuong} END)`.as("san_luong_ca1"),
      mayTSCa2: sql<string | null>`MAX(CASE WHEN ${productionRecordsTable.ca} = 2 THEN ${productionRecordsTable.mayTS} END)`.as("may_ts_ca2"),
      thoiGianTSCa2: sql<string | null>`MAX(CASE WHEN ${productionRecordsTable.ca} = 2 THEN ${productionRecordsTable.thoiGian} END)`.as("thoi_gian_ts_ca2"),
      sanLuongCa2: sql<string | null>`MAX(CASE WHEN ${productionRecordsTable.ca} = 2 THEN ${productionRecordsTable.sanLuong} END)`.as("san_luong_ca2"),
      mayTSCa3: sql<string | null>`MAX(CASE WHEN ${productionRecordsTable.ca} = 3 THEN ${productionRecordsTable.mayTS} END)`.as("may_ts_ca3"),
      thoiGianTSCa3: sql<string | null>`MAX(CASE WHEN ${productionRecordsTable.ca} = 3 THEN ${productionRecordsTable.thoiGian} END)`.as("thoi_gian_ts_ca3"),
      sanLuongCa3: sql<string | null>`MAX(CASE WHEN ${productionRecordsTable.ca} = 3 THEN ${productionRecordsTable.sanLuong} END)`.as("san_luong_ca3"),
    })
    .from(productionRecordsTable)
    .groupBy(productionRecordsTable.orderId, productionRecordsTable.ngaySanXuat)
    .as("r");

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(productionTable)
      .leftJoin(productionWasteTable, and(
        or(
          eq(productionTable.orderId, productionWasteTable.orderId),
          and(isNull(productionTable.orderId), isNull(productionWasteTable.orderId))
        ),
        eq(productionTable.ngaySanXuat, productionWasteTable.ngaySanXuat)
      ))
      .leftJoin(aggregatedRecords, and(eq(productionTable.orderId, aggregatedRecords.orderId), eq(productionTable.ngaySanXuat, aggregatedRecords.ngaySanXuat)))
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
    data: rows.map(r => mapRow({
      ...r.production,
      ...r.production_waste,
      ...r.r
    })),
    total: countResult[0]?.count ?? 0,
    page,
    limit,
  });
});

router.get("/orders", async (req, res) => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { page = 1, limit = 50, search } = parsed.data;

  const conditions = [];
  
  if (search) {
    conditions.push(
      or(
        ilike(ordersTable.donHang, `%${search}%`),
        ilike(ordersTable.maSoi, `%${search}%`),
        ilike(ordersTable.tenSoi, `%${search}%`)
      ) as any
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(ordersTable)
      .where(where)
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(ordersTable)
      .where(where),
  ]);

  res.json({
    data: rows,
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

router.post("/production/import", async (req, res) => {
  const parsed = ImportProductionBody.safeParse(req.body);
  if (!parsed.success) {
    console.log("Validation errors:", JSON.stringify(parsed.error.issues, null, 2));
    res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
    return;
  }
  
  const { orders, production } = parsed.data;

  try {
    const chunkSize = 500;

    // 1. Insert Orders
    if (orders && orders.length > 0) {
      for (let i = 0; i < orders.length; i += chunkSize) {
        const chunk = orders.slice(i, i + chunkSize);
        const mappedChunk = chunk.map(o => ({
          ...o,
          slDonHang: o.slDonHang !== null && o.slDonHang !== undefined ? String(o.slDonHang) : null,
          tyLeNhua: o.tyLeNhua !== null && o.tyLeNhua !== undefined ? String(o.tyLeNhua) : null,
        }));
        // Sử dụng onConflictDoNothing để bỏ qua nếu trùng ID đơn hàng
        await db.insert(ordersTable).values(mappedChunk).onConflictDoNothing();
      }
    }

    // 2. Insert Production
    if (production && production.length > 0) {
      for (let i = 0; i < production.length; i += chunkSize) {
        const chunk = production.slice(i, i + chunkSize);
        
        const productionRows = [];
        const recordsToInsert = [];
        const wasteToInsert = [];
        
        for (const item of chunk) {
          const d = { ...item } as Record<string, unknown>;
          const ngayNhap = d.ngayNhap ? toDateStr(d.ngayNhap as string) : null;
          const ngaySanXuat = d.ngaySanXuat ? toDateStr(d.ngaySanXuat as string) : null;
          
          productionRows.push({
            orderId: d.orderId as string | null,
            stt: d.stt as number | null,
            ngayNhap,
            ngaySanXuat,
            lenhXK: d.lenhXK as string | null,
            ngayBanHanhLXK: d.ngayBanHanhLXK as string | null,
            maSoi: d.maSoi as string,
            tenSoi: d.tenSoi as string,
            tenSoiMoi: d.tenSoiMoi as string | null,
            donHang: d.donHang as string,
            tyLeNhua: d.tyLeNhua as string | null,
            ngaySanXuatGanNhat: d.ngaySanXuatGanNhat as string | null,
            tongSLNgay: d.tongSLNgay as string | null,
            slDonHangDaSX: d.slDonHangDaSX as string | null,
            slLuyKeTuan: d.slLuyKeTuan as string | null,
            luyKeTHang: d.luyKeTHang as string | null,
            canSXTiep: d.canSXTiep as string | null,
            dvt: d.dvt as string | null,
            tyLeHoanThanh: d.tyLeHoanThanh as string | null,
            ghiChu: d.ghiChu as string | null,
          });

          // Ca 1
          if (d.sanLuongCa1) {
            recordsToInsert.push({
              orderId: d.orderId as string | null,
              ngaySanXuat: ngaySanXuat!,
              ca: 1,
              mayTS: d.mayTSCa1 as string | null,
              thoiGian: d.thoiGianTSCa1 as string | null,
              sanLuong: d.sanLuongCa1 as string | null,
            });
          }
          // Ca 2
          if (d.sanLuongCa2) {
            recordsToInsert.push({
              orderId: d.orderId as string | null,
              ngaySanXuat: ngaySanXuat!,
              ca: 2,
              mayTS: d.mayTSCa2 as string | null,
              thoiGian: d.thoiGianTSCa2 as string | null,
              sanLuong: d.sanLuongCa2 as string | null,
            });
          }
          // Ca 3
          if (d.sanLuongCa3) {
            recordsToInsert.push({
              orderId: d.orderId as string | null,
              ngaySanXuat: ngaySanXuat!,
              ca: 3,
              mayTS: d.mayTSCa3 as string | null,
              thoiGian: d.thoiGianTSCa3 as string | null,
              sanLuong: d.sanLuongCa3 as string | null,
            });
          }
          
          // Waste
          wasteToInsert.push({
            orderId: d.orderId as string | null,
            ngaySanXuat: ngaySanXuat!,
            phekeoMay: d.phekeoMay as string | null,
            pheChayMay: d.pheChayMay as string | null,
            pheChuyenDoi: d.pheChuyenDoi as string | null,
            pheSuCo: d.pheSuCo as string | null,
            pheDungMay: d.pheDungMay as string | null,
            pheXuLy: d.pheXuLy as string | null,
            tongPheNgay: d.tongPheNgay as string | null,
            pheDonHang: d.pheDonHang as string | null,
            pheLuyKeTuan: d.pheLuyKeTuan as string | null,
            pheLuyKeTHang: d.pheLuyKeTHang as string | null,
          });
        }
        
        await db.insert(productionTable).values(productionRows as any);
        if (recordsToInsert.length > 0) {
          await db.insert(productionRecordsTable).values(recordsToInsert as any);
        }
        if (wasteToInsert.length > 0) {
          await db.insert(productionWasteTable).values(wasteToInsert as any);
        }
      }
    }

    res.status(201).json({ 
      ordersCount: orders?.length ?? 0,
      productionCount: production?.length ?? 0, 
      message: "Imported successfully" 
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ error: "Internal server error during import" });
  }
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
  const may = parsed.data.may;

  const getRows = async (from: string, to: string) => {
    const conditions = [
      gte(productionTable.ngaySanXuat, from),
      lte(productionTable.ngaySanXuat, to)
    ];
    
    if (may) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${productionRecordsTable} r 
          WHERE r.order_id = ${productionTable.orderId} 
          AND r.ngay_san_xuat = ${productionTable.ngaySanXuat} 
          AND r.may_ts = ${may}
        )` as any
      );
    }
    
    const where = and(...conditions);
    
    return db
      .select({
        tongSLNgay: productionTable.tongSLNgay,
        tongPheNgay: productionWasteTable.tongPheNgay,
        tyLeHoanThanh: productionTable.tyLeHoanThanh,
      })
      .from(productionTable)
      .leftJoin(productionWasteTable, and(
        or(
          eq(productionTable.orderId, productionWasteTable.orderId),
          and(isNull(productionTable.orderId), isNull(productionWasteTable.orderId))
        ),
        eq(productionTable.ngaySanXuat, productionWasteTable.ngaySanXuat)
      ))
      .where(where);
  };

  const [allRows, todayRows, weekRows] = await Promise.all([
    getRows(fromFilter, toFilter),
    getRows(today, today),
    getRows(weekStart, today),
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
  const may = parsed.data.may;

  const conditions = [
    gte(productionTable.ngaySanXuat, fromFilter),
    lte(productionTable.ngaySanXuat, toFilter)
  ];
  
  if (may) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${productionRecordsTable} r 
        WHERE r.order_id = ${productionTable.orderId} 
        AND r.ngay_san_xuat = ${productionTable.ngaySanXuat} 
        AND r.may_ts = ${may}
      )` as any
    );
  }
  
  const where = and(...conditions);

  const aggregatedRecords = db
    .select({
      orderId: productionRecordsTable.orderId,
      ngaySanXuat: productionRecordsTable.ngaySanXuat,
      sanLuongCa1: sql<string | null>`MAX(CASE WHEN ${productionRecordsTable.ca} = 1 THEN ${productionRecordsTable.sanLuong} END)`.as("san_luong_ca1"),
      sanLuongCa2: sql<string | null>`MAX(CASE WHEN ${productionRecordsTable.ca} = 2 THEN ${productionRecordsTable.sanLuong} END)`.as("san_luong_ca2"),
      sanLuongCa3: sql<string | null>`MAX(CASE WHEN ${productionRecordsTable.ca} = 3 THEN ${productionRecordsTable.sanLuong} END)`.as("san_luong_ca3"),
    })
    .from(productionRecordsTable)
    .groupBy(productionRecordsTable.orderId, productionRecordsTable.ngaySanXuat)
    .as("r");

  const rows = await db
    .select({
      ngaySanXuat: productionTable.ngaySanXuat,
      tongSLNgay: productionTable.tongSLNgay,
      tongPheNgay: productionWasteTable.tongPheNgay,
      sanLuongCa1: aggregatedRecords.sanLuongCa1,
      sanLuongCa2: aggregatedRecords.sanLuongCa2,
      sanLuongCa3: aggregatedRecords.sanLuongCa3,
    })
    .from(productionTable)
    .leftJoin(productionWasteTable, and(
      or(
        eq(productionTable.orderId, productionWasteTable.orderId),
        and(isNull(productionTable.orderId), isNull(productionWasteTable.orderId))
      ),
      eq(productionTable.ngaySanXuat, productionWasteTable.ngaySanXuat)
    ))
    .leftJoin(aggregatedRecords, and(eq(productionTable.orderId, aggregatedRecords.orderId), eq(productionTable.ngaySanXuat, aggregatedRecords.ngaySanXuat)))
    .where(where)
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
  const may = parsed.data.may;

  const conditions = [
    gte(productionTable.ngaySanXuat, fromFilter),
    lte(productionTable.ngaySanXuat, toFilter)
  ];
  
  if (may) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${productionRecordsTable} r 
        WHERE r.order_id = ${productionTable.orderId} 
        AND r.ngay_san_xuat = ${productionTable.ngaySanXuat} 
        AND r.may_ts = ${may}
      )` as any
    );
  }
  
  const where = and(...conditions);

  const rows = await db
    .select()
    .from(productionTable)
    .leftJoin(productionWasteTable, and(
      or(
        eq(productionTable.orderId, productionWasteTable.orderId),
        and(isNull(productionTable.orderId), isNull(productionWasteTable.orderId))
      ),
      eq(productionTable.ngaySanXuat, productionWasteTable.ngaySanXuat)
    ))
    .where(where);

  const sumField = (field: keyof typeof productionWasteTable.$inferSelect) => 
    rows.reduce((acc, r) => acc + (toNum(r.production_waste?.[field]) ?? 0), 0);

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
    .select({
      ca: productionRecordsTable.ca,
      sanLuong: productionRecordsTable.sanLuong,
    })
    .from(productionRecordsTable)
    .where(and(gte(productionRecordsTable.ngaySanXuat, fromFilter), lte(productionRecordsTable.ngaySanXuat, toFilter)));

  const ca1 = rows.filter(r => r.ca === 1).reduce((acc, r) => acc + (toNum(r.sanLuong) ?? 0), 0);
  const ca2 = rows.filter(r => r.ca === 2).reduce((acc, r) => acc + (toNum(r.sanLuong) ?? 0), 0);
  const ca3 = rows.filter(r => r.ca === 3).reduce((acc, r) => acc + (toNum(r.sanLuong) ?? 0), 0);
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

router.get("/analytics/oee", async (req, res) => {
  const parsed = GetShiftPerformanceQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const fromFilter = parsed.data.dateFrom ? toDateStr(parsed.data.dateFrom)! : monthStartStr();
  const toFilter = parsed.data.dateTo ? toDateStr(parsed.data.dateTo)! : todayStr();

  // 1. Tìm Max Sản lượng trong lịch sử (Bỏ qua dòng tổng cộng > 50000)
  const maxResult = await db
    .select({ max: sql<number>`max(san_luong)::float` })
    .from(productionRecordsTable)
    .where(sql`san_luong < 50000`);
  const maxOutput = maxResult[0]?.max ?? 1000;

  // 2. Lấy dữ liệu sản xuất
  const prodRows = await db
    .select()
    .from(productionRecordsTable)
    .where(and(gte(productionRecordsTable.ngaySanXuat, fromFilter), lte(productionRecordsTable.ngaySanXuat, toFilter)));

  // 3. Lấy dữ liệu phế
  const wasteRows = await db
    .select()
    .from(productionWasteTable)
    .where(and(gte(productionWasteTable.ngaySanXuat, fromFilter), lte(productionWasteTable.ngaySanXuat, toFilter)));

  // Tạo map để tra cứu phế nhanh
  const wasteMap = new Map<string, number>();
  for (const w of wasteRows) {
    const key = `${w.ngaySanXuat}__${w.orderId || ''}`;
    wasteMap.set(key, toNum(w.tongPheNgay) ?? 0);
  }

  // Group by Ca
  const byCa = new Map<number, { sanLuong: number; thoiGian: number; phế: number; count: number }>();
  
  // Tính tổng sản lượng theo ngày+order để phân bổ phế
  const dayOrderTotal = new Map<string, number>();
  for (const r of prodRows) {
    const key = `${r.ngaySanXuat}__${r.orderId || ''}`;
    dayOrderTotal.set(key, (dayOrderTotal.get(key) || 0) + (toNum(r.sanLuong) ?? 0));
  }

  for (const r of prodRows) {
    const ca = r.ca;
    if (!byCa.has(ca)) {
      byCa.set(ca, { sanLuong: 0, thoiGian: 0, phế: 0, count: 0 });
    }
    const entry = byCa.get(ca)!;
    const sl = toNum(r.sanLuong) ?? 0;
    entry.sanLuong += sl;
    
    let thoiGian = toNum(r.thoiGian) ?? 0;
    if (thoiGian === 0) thoiGian = 720; // Giả định chạy đủ 12h nếu trống
    entry.thoiGian += thoiGian;
    
    entry.count += 1;

    // Phân bổ phế
    const key = `${r.ngaySanXuat}__${r.orderId || ''}`;
    const totalDayOrder = dayOrderTotal.get(key) || 1;
    const totalWaste = wasteMap.get(key) || 0;
    const allocatedWaste = totalWaste * (sl / totalDayOrder);
    entry.phế += allocatedWaste;
  }

  const result = [];
  for (const [ca, data] of byCa.entries()) {
    // 12h/ca = 720 phút
    const availability = data.thoiGian > 0 ? (data.thoiGian / (720 * data.count)) * 100 : 0;
    const performance = data.sanLuong > 0 ? (data.sanLuong / (maxOutput * data.count)) * 100 : 0;
    const quality = (data.sanLuong + data.phế) > 0 ? (data.sanLuong / (data.sanLuong + data.phế)) * 100 : 100;
    const oee = (availability * performance * quality) / 10000;

    result.push({
      label: `Ca ${ca}`,
      availability: Math.round(Math.min(availability, 100) * 10) / 10,
      performance: Math.round(Math.min(performance, 100) * 10) / 10,
      quality: Math.round(Math.min(quality, 100) * 10) / 10,
      oee: Math.round(Math.min(oee, 100) * 10) / 10,
    });
  }

  res.json(result);
});

router.get("/analytics/progress", async (req, res) => {
  try {
    // Truy vấn trực tiếp từ bảng production (bảng phẳng) và join với orders
    const rows = await db
      .select({
        lenhXK: productionTable.lenhXK,
        donHang: productionTable.donHang,
        maSoi: productionTable.maSoi,
        tongSLNgay: productionTable.tongSLNgay,
        slDonHang: ordersTable.slDonHang,
      })
      .from(productionTable)
      .leftJoin(ordersTable, eq(productionTable.donHang, ordersTable.donHang));

    console.log("analytics rows count:", rows.length);
    console.log("analytics rows sample:", rows.slice(0, 3));

    // 3. Xử lý gom nhóm
    const progressMap = new Map<string, any>();

    for (const row of rows) {
      const lenhXK = row.lenhXK || "Không xác định";
      const donHang = row.donHang || "Không xác định";
      const maSoi = row.maSoi || "";
      const slDonHang = row.slDonHang ? parseFloat(row.slDonHang) : 0;
      const sanLuong = row.tongSLNgay ? parseFloat(row.tongSLNgay) : 0;

      if (!progressMap.has(lenhXK)) {
        progressMap.set(lenhXK, {
          lenhXK,
          tongSlDonHang: 0,
          tongDaSanXuat: 0,
          items: new Map<string, any>(),
        });
      }

      const lenhGroup = progressMap.get(lenhXK)!;
      
      const itemKey = `${donHang}-${maSoi}`;
      if (!lenhGroup.items.has(itemKey)) {
        lenhGroup.items.set(itemKey, {
          orderId: donHang, // Dùng donHang làm orderId hiển thị
          maSoi,
          slDonHang,
          daSanXuat: 0,
          records: [], // Không có records chi tiết từ bảng records
        });
        lenhGroup.tongSlDonHang += slDonHang;
      }

      const item = lenhGroup.items.get(itemKey)!;
      item.daSanXuat += sanLuong;
      lenhGroup.tongDaSanXuat += sanLuong;
    }

    // Chuyển Map thành Array
    const result = Array.from(progressMap.values()).map(group => {
      const items = Array.from(group.items.values());
      const tienDo = group.tongSlDonHang > 0 ? (group.tongDaSanXuat / group.tongSlDonHang) * 100 : 0;
      
      return {
        ...group,
        items,
        tienDo: Math.round(tienDo * 10) / 10, // Làm tròn 1 chữ số
        status: tienDo >= 100 ? "COMPLETED" : "IN_PROGRESS",
      };
    });

    // Sắp xếp: Đang tiến hành lên trước, hoàn thành sau
    result.sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "IN_PROGRESS" ? -1 : 1;
    });

    res.json(result);
  } catch (error) {
    console.error("Error in /analytics/progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/progress-parents", async (req, res) => {
  try {
    const parsed = GetProgressParentsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const { page, limit, search } = parsed.data;

    // Subquery gom nhóm Production theo lenhXK
    const prodGroup = db
      .select({
        lenhXK: sql<string>`COALESCE(${productionTable.lenhXK}, 'UNASSIGNED')`.as("lenh_xk"),
        tongDaSanXuat: sql<number>`SUM(COALESCE(${productionTable.tongSLNgay}::numeric, 0))::float`.as("tong_da_san_xuat"),
      })
      .from(productionTable)
      .groupBy(sql`COALESCE(${productionTable.lenhXK}, 'UNASSIGNED')`)
      .as("pg");

    // Subquery gom nhóm Orders theo donHang (chính là lenhXK)
    const orderGroup = db
      .select({
        donHang: sql<string>`COALESCE(${ordersTable.donHang}, 'UNASSIGNED')`.as("don_hang"),
        tongSlDonHang: sql<number>`SUM(COALESCE(${ordersTable.slDonHang}::numeric, 0))::float`.as("tong_sl_don_hang"),
      })
      .from(ordersTable)
      .groupBy(sql`COALESCE(${ordersTable.donHang}, 'UNASSIGNED')`)
      .as("og");

    // Lọc theo search
    let conditions = undefined;
    if (search && search.trim()) {
      conditions = ilike(prodGroup.lenhXK, `%${search.trim()}%`);
    }

    // Đếm tổng số lượng cha
    const countQuery = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(prodGroup)
      .where(conditions);
    const total = countQuery[0]?.count ?? 0;

    // Truy vấn chính kết hợp áp dụng phân trang
    const offset = (page - 1) * limit;
    const parentRows = await db
      .select({
        lenhXK: prodGroup.lenhXK,
        tongDaSanXuat: prodGroup.tongDaSanXuat,
        tongSlDonHang: sql<number>`COALESCE(${orderGroup.tongSlDonHang}, 0)`.as("tong_sl_don_hang"),
      })
      .from(prodGroup)
      .leftJoin(orderGroup, eq(prodGroup.lenhXK, orderGroup.donHang))
      .where(conditions)
      .limit(limit)
      .offset(offset);

    const data = parentRows.map((r) => {
      const tongSlDonHang = r.tongSlDonHang ?? 0;
      const tongDaSanXuat = r.tongDaSanXuat ?? 0;
      const tienDo = tongSlDonHang > 0 ? (tongDaSanXuat / tongSlDonHang) * 100 : tongDaSanXuat > 0 ? 100 : 0;
      return {
        lenhXK: r.lenhXK,
        tongSlDonHang,
        tongDaSanXuat,
        tienDo: Math.round(tienDo * 10) / 10,
        status: tienDo >= 100 ? "COMPLETED" : "IN_PROGRESS",
      };
    });

    // Sắp xếp ưu tiên IN_PROGRESS lên trước
    data.sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "IN_PROGRESS" ? -1 : 1;
    });

    res.json({
      data,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error in /analytics/progress-parents:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/progress-items", async (req, res) => {
  try {
    const parsed = GetProgressItemsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const { lenhXK } = parsed.data;

    const actualLenhXKStr = lenhXK === "UNASSIGNED" ? null : lenhXK;

    // 1. Lấy danh sách Đơn hàng con chuẩn xác từ bảng orders làm Source of Truth
    const orderItems = await db
      .select({
        id: ordersTable.id,
        maSoi: ordersTable.maSoi,
        tenSoi: sql<string | null>`MAX(${ordersTable.tenSoi})`.as("ten_soi"),
        slDonHang: sql<number>`SUM(COALESCE(${ordersTable.slDonHang}::numeric, 0))::float`.as("sl_don_hang"),
      })
      .from(ordersTable)
      .where(actualLenhXKStr === null ? isNull(ordersTable.donHang) : eq(ordersTable.donHang, actualLenhXKStr))
      .groupBy(ordersTable.id, ordersTable.maSoi);

    // 2. Lấy sản lượng thực tế đã sản xuất từ bảng production
    const prodItems = await db
      .select({
        maSoi: productionTable.maSoi,
        tenSoi: sql<string | null>`MAX(${productionTable.tenSoi})`.as("ten_soi"),
        orderId: productionTable.orderId,
        daSanXuat: sql<number>`SUM(COALESCE(${productionTable.tongSLNgay}::numeric, 0))::float`.as("da_san_xuat"),
      })
      .from(productionTable)
      .where(actualLenhXKStr === null ? isNull(productionTable.lenhXK) : eq(productionTable.lenhXK, actualLenhXKStr))
      .groupBy(productionTable.maSoi, productionTable.orderId);

    // 3. Phân bổ sản lượng thực tế theo orderId trực tiếp, phần còn lại rơi vào giỏ chung theo mã sợi
    const prodByOrderId = new Map<string, number>();
    const prodByMaSoi = new Map<string, number>();
    const tenSoiByMaSoi = new Map<string, string>();

    for (const pi of prodItems) {
      const qty = pi.daSanXuat ?? 0;
      if (pi.maSoi && pi.tenSoi) {
        tenSoiByMaSoi.set(pi.maSoi, pi.tenSoi);
      }
      if (pi.orderId) {
        prodByOrderId.set(pi.orderId, (prodByOrderId.get(pi.orderId) ?? 0) + qty);
      } else if (pi.maSoi) {
        prodByMaSoi.set(pi.maSoi, (prodByMaSoi.get(pi.maSoi) ?? 0) + qty);
      }
    }

    const data: Array<{
      orderId: string;
      maSoi: string;
      tenSoi: string;
      slDonHang: number;
      daSanXuat: number;
      tienDo: number;
    }> = [];

    // Xác định đơn hàng con cuối cùng cho mỗi mã sợi để dồn lượng dư thừa cuối cùng
    const lastOrderItemIndexByMaSoi = new Map<string, number>();
    for (let i = 0; i < orderItems.length; i++) {
      const oi = orderItems[i];
      if (oi.maSoi) {
        lastOrderItemIndexByMaSoi.set(oi.maSoi, i);
      }
    }

    // 4. Thực thi giải thuật lấp đầy tuần tự có trần (Cascade Cap Fill)
    for (let i = 0; i < orderItems.length; i++) {
      const oi = orderItems[i];
      const orderId = oi.id || "UNASSIGNED";
      const maSoi = oi.maSoi || "";
      const tenSoi = oi.tenSoi || tenSoiByMaSoi.get(maSoi) || maSoi;
      const slDonHang = oi.slDonHang ?? 0;

      let daSanXuat = prodByOrderId.get(orderId) ?? 0;

      // Phân bổ tuần tự từ giỏ chung theo mã sợi
      if (maSoi && prodByMaSoi.has(maSoi)) {
        const remainingInPool = prodByMaSoi.get(maSoi)!;

        // Nếu đây là đơn con cuối cùng của mã sợi này, hưởng trọn phần dư thừa còn lại
        if (lastOrderItemIndexByMaSoi.get(maSoi) === i) {
          daSanXuat += remainingInPool;
          prodByMaSoi.delete(maSoi); // Đã dồn hết
        } else {
          // Nếu chưa phải đơn cuối, chỉ rót tối đa lượng còn thiếu để vừa đủ cam kết slDonHang
          const deficit = Math.max(0, slDonHang - daSanXuat);
          const pourQty = Math.min(remainingInPool, deficit);
          daSanXuat += pourQty;
          prodByMaSoi.set(maSoi, remainingInPool - pourQty);
        }
      }

      const tienDo = slDonHang > 0 ? (daSanXuat / slDonHang) * 100 : daSanXuat > 0 ? 100 : 0;

      data.push({
        orderId,
        maSoi,
        tenSoi,
        slDonHang,
        daSanXuat: Math.round(daSanXuat * 100) / 100,
        tienDo: Math.round(tienDo * 10) / 10,
      });
    }

    // Thêm các khoản sản xuất hoàn toàn ngoài danh mục Đơn hàng gốc (nếu có)
    for (const [maSoi, qty] of prodByMaSoi.entries()) {
      if (qty > 0) {
        data.push({
          orderId: "EXTRA_PRODUCTION",
          maSoi,
          tenSoi: tenSoiByMaSoi.get(maSoi) || maSoi,
          slDonHang: 0,
          daSanXuat: Math.round(qty * 100) / 100,
          tienDo: 100,
        });
      }
    }

    res.json(data);
  } catch (error) {
    console.error("Error in /analytics/progress-items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
