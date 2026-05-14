import XLSX from 'xlsx';

const filePath = '../../Báo cáo sản lượng tạo sợi hằng ngày.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames.find(n => n.includes('Bao_Cao_Tao_Soi') || n === 'Bao_Cao_Tao_Soi') || workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws);
  
  console.log('Sample Data (First 5 rows):');
  for (let i = 0; i < 5; i++) {
    const r = data[i];
    console.log(`Row ${i + 1}:`);
    console.log(`  Lệnh XK: ${r['LỆNH XK']}`);
    console.log(`  Thời Gian TS Ca1: ${r['Thời Gian TS Ca1']}`);
    console.log(`  Sản lượng Ca 1: ${r['Sản lượng Ca 1']}`);
    console.log(`  Thời Gian TS Ca2: ${r['Thời Gian TS Ca2']}`);
    console.log(`  Sản lượng Ca 2: ${r['Sản lượng Ca 2']}`);
    console.log(`  Thời Gian TS Ca3: ${r['Thời Gian TS Ca3']}`);
    console.log(`  Sản lượng Ca 3: ${r['Sản lượng Ca 3']}`);
    console.log(`  TỔNG SL NGÀY: ${r['TỔNG SL NGÀY']}`);
    console.log('---');
  }
  
} catch (e) {
  console.error('Error:', e);
}
