const XLSX = require('xlsx');

// Read source data
const wb = XLSX.readFile('C:\\Users\\admin\\Downloads\\中铝产业生态中心项目-费用登记.xlsx');
const ws = wb.Sheets['朱国伟'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

// Group by travel period
const groups = {};
for (let i = 1; i < data.length - 1; i++) {
  const row = data[i];
  const period = row[4]; // 出差周期
  if (!groups[period]) {
    groups[period] = {
      period: period,
      startDate: row[10],
      endDate: row[11],
      purpose: row[3],
      accommodation: 0,
      transport: 0,
      flight: 0,
      subsidy: 0,
      other: 0,
      total: 0,
      notes: []
    };
  }
  const g = groups[period];
  const type = row[5];
  const amount = typeof row[6] === 'number' ? row[6] : parseFloat(row[6]) || 0;

  if (type === '住宿费') g.accommodation += amount;
  else if (type === '出差补贴') g.subsidy += amount;
  else if (type === '机票') g.flight += amount;
  else if (type === '交通费') g.transport += amount;
  else g.other += amount;

  g.total += amount;
  if (row[7]) g.notes.push(String(row[7]).trim());
}

const sortedGroups = Object.values(groups).sort((a, b) => a.startDate - b.startDate);

// Create new workbook
const newWb = XLSX.utils.book_new();

// Build the sheet data
// Row 0 (header row 1): Title
// Row 1 (header row 2): 基本信息 | 费用类型/报销金额 | (blank) | 备注
// Row 2 (header row 3): 姓名 | 出差日期 | 出差地点 | 出差事由 | 住宿费 | 交通费 | 补助费 | 其他 | 小计 | 个人总计 | 备注
// Row 3+: data rows

const wsData = [];

// Title row
wsData.push(['贸易系统1.0 项目组报销事项明细统计', '', '', '', '', '', '', '', '', '', '']);

// Sub-header row
wsData.push(['基本信息', '', '', '', '费用类型/报销金额', '', '', '', '', '', '备注（特殊情况说明等）']);

// Column header row
wsData.push(['姓名', '出差日期', '出差地点', '出差事由', '住宿费', '交通费', '补助费', '其他（需在备注中进行情况说明）', '小计', '个人总计', '备注（特殊情况说明等）']);

// Data rows
let grandTotal = 0;
sortedGroups.forEach((g) => {
  const transportTotal = g.transport + g.flight;
  const other = g.other;
  grandTotal += g.total;
  wsData.push([
    '朱国伟',
    g.period,
    '上海',
    g.purpose || '产业生态',
    g.accommodation,
    transportTotal,
    g.subsidy,
    other > 0 ? other : '',
    g.total,
    grandTotal,
    g.notes.join('；')
  ]);
});

// Total row
wsData.push(['合计：', '', '', '', '', '', '', '', '', grandTotal, '']);

// Create worksheet
const newWs = XLSX.utils.aoa_to_sheet(wsData);

// Set column widths
newWs['!cols'] = [
  { wch: 10 },  // 姓名
  { wch: 30 },  // 出差日期
  { wch: 10 },  // 出差地点
  { wch: 12 },  // 出差事由
  { wch: 10 },  // 住宿费
  { wch: 10 },  // 交通费
  { wch: 10 },  // 补助费
  { wch: 20 },  // 其他
  { wch: 10 },  // 小计
  { wch: 10 },  // 个人总计
  { wch: 40 },  // 备注
];

// Merge cells
const merges = [];

// Title row: A1:K1
merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } });

// Sub-header row: 基本信息 A2:D2, 费用类型/报销金额 E2:I2, 备注 K2:K2
merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 3 } });  // 基本信息
merges.push({ s: { r: 1, c: 4 }, e: { r: 1, c: 8 } });  // 费用类型/报销金额
// K2 is a single cell

// 姓名 column: merge all data rows vertically
const dataStartRow = 3; // 0-indexed row 3
const dataEndRow = dataStartRow + sortedGroups.length - 1;
if (sortedGroups.length > 1) {
  merges.push({ s: { r: dataStartRow, c: 0 }, e: { r: dataEndRow, c: 0 } });
}

// 个人总计 column: merge all data rows vertically
merges.push({ s: { r: dataStartRow, c: 9 }, e: { r: dataEndRow, c: 9 } });

// 备注 column: merge all data rows vertically
merges.push({ s: { r: dataStartRow, c: 10 }, e: { r: dataEndRow, c: 10 } });

newWs['!merges'] = merges;

// Add the worksheet
XLSX.utils.book_append_sheet(newWb, newWs, '朱国伟');

// Write to file
const outputPath = 'C:\\Users\\admin\\Downloads\\朱国伟-报销明细统计.xlsx';
XLSX.writeFile(newWb, outputPath);
console.log('File created: ' + outputPath);
console.log('Total rows: ' + sortedGroups.length);
console.log('Grand total: ' + grandTotal);
