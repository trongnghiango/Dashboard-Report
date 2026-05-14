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
  console.log('Total rows:', data.length);
  console.log('Header row (Row 0):', data[0]);
  console.log('Row 1:', data[1]);
} catch (e) {
  console.error('Error reading file:', e);
}
