import { db, productionTable, productionRecordsTable, ordersTable } from "@workspace/db";

async function main() {
  const pRows = await db.select({
    orderId: productionTable.orderId,
    lenhXK: productionTable.lenhXK,
  }).from(productionTable).limit(5);
  console.log("Production rows:", JSON.stringify(pRows, null, 2));

  const rRows = await db.select().from(productionRecordsTable).limit(5);
  console.log("Records rows:", JSON.stringify(rRows, null, 2));

  const oRows = await db.select().from(ordersTable).limit(5);
  console.log("Orders rows:", JSON.stringify(oRows, null, 2));
}

main().catch(console.error);
