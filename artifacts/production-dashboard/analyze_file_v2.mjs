import XLSX from 'xlsx';

const filePath = '../../Báo cáo sản lượng tạo sợi hằng ngày.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  
  console.log('Sheet Names:', workbook.SheetNames);
  
  const sheet1Name = workbook.SheetNames.find(n => n.includes('Bao_Cao_Tao_Soi') || n === 'Bao_Cao_Tao_Soi') || workbook.SheetNames[0];
  const sheet2Name = workbook.SheetNames.find(n => n.includes('TH Đơn hàng và SL') || n === 'TH Đơn hàng và SL');
  
  console.log('Reading Sheet 1:', sheet1Name);
  const ws1 = workbook.Sheets[sheet1Name];
  const data1 = XLSX.utils.sheet_to_json(ws1, { header: 1 });
  console.log('Sheet 1 Headers:', data1[0]);
  console.log('Sheet 1 Row 1:', data1[1]);
  console.log('Sheet 1 Row 2:', data1[2]);
  
  if (sheet2Name) {
    console.log('Reading Sheet 2:', sheet2Name);
    const ws2 = workbook.Sheets[sheet2Name];
    const data2 = XLSX.utils.sheet_to_json(ws2, { header: 1 });
    console.log('Sheet 2 Headers:', data2[0]);
    console.log('Sheet 2 Row 1:', data2[1]);
    console.log('Sheet 2 Row 2:', data2[2]);
  }
  
} catch (e) {
  console.error('Error reading file:', e);
}
