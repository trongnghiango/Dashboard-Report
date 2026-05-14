import XLSX from 'xlsx';

const filePath = '../../Báo cáo sản lượng tạo sợi hằng ngày.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = 'TH Đơn hàng và SL';
  const worksheet = workbook.Sheets[sheetName];
  
  if (!worksheet) {
    console.error('Sheet not found:', sheetName);
    process.exit(1);
  }
  
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const headers = data[0];
  
  const orderIdIndex = headers.indexOf('ORDER ID');
  const lenhXKIndex = headers.indexOf('LỆNH XK');
  
  console.log('Headers:', headers);
  console.log('ORDER ID Index:', orderIdIndex);
  console.log('LỆNH XK Index:', lenhXKIndex);
  
  const mapping = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const orderId = row[orderIdIndex];
    const lenhXK = row[lenhXKIndex];
    
    if (orderId && lenhXK) {
      if (!mapping[lenhXK]) {
        mapping[lenhXK] = new Set();
      }
      mapping[lenhXK].add(orderId);
    }
  }
  
  console.log('Analysis:');
  let countMulti = 0;
  for (const [lenhXK, orderIds] of Object.entries(mapping)) {
    if (orderIds.size > 1) {
      console.log(`Lệnh XK [${lenhXK}] has multiple ORDER IDs:`, Array.from(orderIds));
      countMulti++;
    }
  }
  
  console.log(`Total Lệnh XK with multiple ORDER IDs: ${countMulti}`);
  
} catch (e) {
  console.error('Error reading file:', e);
}
