const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');
const exportService = require('../services/export.service');
const { buildMemberFilter } = require('../services/member.service');

const assert = (condition, testName, details = '') => {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${details ? '- ' + JSON.stringify(details) : ''}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
};

async function runExportTests() {
  console.log('🧪 Starting LanguageNest Members Export System Test Suite...\n');

  // -------------------------------------------------------------
  // Test 1: Shared Filter Logic
  // -------------------------------------------------------------
  console.log('--- Test 1: Shared Filter Logic ---');
  const filter1 = buildMemberFilter({ search: 'Ravi', department: 'CSE', status: 'active', paymentMode: 'QR' });
  assert(filter1.$or && filter1.$or.length === 8, 'Search creates $or across 8 fields');
  assert(filter1.department === 'CSE', 'Department filter matches CSE');
  assert(filter1.status === 'active', 'Status filter matches active');
  assert(filter1.paymentMode === 'QR', 'PaymentMode filter matches QR');

  const filterEmpty = buildMemberFilter({ search: '', department: 'all', status: 'all', paymentMode: 'all' });
  assert(Object.keys(filterEmpty).length === 0, 'Empty/all filters produce empty MongoDB query');

  // -------------------------------------------------------------
  // Test 2: Excel (.xlsx) Generation
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Excel (.xlsx) Generation ---');
  const sampleMembers = [
    {
      memberId: 'LN26001',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@college.edu',
      phone: '+91 9876543210',
      department: 'Computer Science and Engineering',
      year: '3rd Year',
      paymentMode: 'QR',
      paymentStatus: 'RECORDED',
      utrNumber: '987654321012',
      status: 'active',
      membershipStatus: 'REGISTERED',
      registeredAt: new Date('2026-09-25T10:00:00Z'),
    },
    {
      memberId: 'LN26002',
      name: 'Kavya Reddy',
      email: 'kavya.reddy@college.edu',
      phone: '+91 9876543211',
      department: 'Artificial Intelligence & Data Science',
      year: '2nd Year',
      paymentMode: 'OFFLINE',
      paymentStatus: 'VERIFIED',
      cashGivenTo: 'Gayaz (Core Lead)',
      status: 'active',
      membershipStatus: 'ACTIVE',
      registeredAt: new Date('2026-09-24T12:00:00Z'),
    },
    {
      memberId: 'LN26003',
      name: "José O'Connor",
      email: 'jose.oconnor@college.edu',
      phone: '+91 9876543212',
      department: 'Electronics & Communication',
      year: '4th Year',
      paymentMode: 'QR',
      paymentStatus: 'RECORDED',
      transactionId: 'TXN88990011',
      status: 'inactive',
      membershipStatus: 'REGISTERED',
      registeredAt: new Date('2026-09-20T08:30:00Z'),
    },
  ];

  const excelBuffer = await exportService.generateMembersExcel(sampleMembers, { search: 'Ravi' }, { generatedBy: 'Admin User' });
  assert(Buffer.isBuffer(excelBuffer), 'Excel output is a valid Buffer');
  assert(excelBuffer.length > 5000, `Excel size is realistic (${excelBuffer.length} bytes)`);

  // Verify Excel header signature (ZIP file PK\x03\x04)
  assert(
    excelBuffer[0] === 0x50 && excelBuffer[1] === 0x4b && excelBuffer[2] === 0x03 && excelBuffer[3] === 0x04,
    'Excel file has valid ZIP/OOXML header signature'
  );

  // Read back generated workbook with ExcelJS to verify sheets and cells
  const wbRead = new ExcelJS.Workbook();
  await wbRead.xlsx.load(excelBuffer);
  const membersSheet = wbRead.getWorksheet('Members');
  assert(membersSheet !== undefined, 'Workbook contains "Members" worksheet');
  assert(membersSheet.rowCount === 4, `Members sheet has 1 header + 3 rows (actual: ${membersSheet.rowCount})`);

  const infoSheet = wbRead.getWorksheet('Export Info');
  assert(infoSheet !== undefined, 'Workbook contains "Export Info" worksheet');

  const row1 = membersSheet.getRow(2);
  assert(row1.getCell(1).value === 'LN26001', 'Member ID cell is correct');
  assert(row1.getCell(2).value === 'Ravi Kumar', 'Name cell is correct');
  assert(row1.getCell(3).value === 'ravi.kumar@college.edu', 'Email cell is correct');

  // -------------------------------------------------------------
  // Test 3: PDF (.pdf) Generation with Branding & Landscape
  // -------------------------------------------------------------
  console.log('\n--- Test 3: PDF (.pdf) Generation ---');
  const pdfBuffer = await exportService.generateMembersPdf(sampleMembers, { department: 'Computer Science and Engineering', status: 'active' }, { generatedBy: 'Admin User' });
  assert(Buffer.isBuffer(pdfBuffer), 'PDF output is a valid Buffer');
  assert(pdfBuffer.length > 1000, `PDF size is realistic (${pdfBuffer.length} bytes)`);

  // Verify PDF header signature (%PDF-)
  const pdfHeader = pdfBuffer.slice(0, 5).toString('ascii');
  assert(pdfHeader === '%PDF-', 'PDF file has valid %PDF- magic signature');

  // -------------------------------------------------------------
  // Test 4: Large Dataset PDF Pagination (500+ records)
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Large Dataset PDF & Excel (500 records) ---');
  const largeMembers = [];
  for (let i = 1; i <= 500; i++) {
    largeMembers.push({
      memberId: `LN26${String(i).padStart(3, '0')}`,
      name: `Member Name ${i} LongNameExtended`,
      email: `student.member.${i}@university.ac.in`,
      phone: `+91 98765${String(i).padStart(5, '0')}`,
      department: i % 2 === 0 ? 'Computer Science & Engineering' : 'Information Technology',
      year: `${(i % 4) + 1}st Year`,
      paymentMode: i % 2 === 0 ? 'QR' : 'OFFLINE',
      paymentStatus: 'RECORDED',
      utrNumber: i % 2 === 0 ? `UTR999${i}888` : null,
      cashGivenTo: i % 2 !== 0 ? `Cashier ${i % 3}` : null,
      status: i % 10 === 0 ? 'inactive' : 'active',
      membershipStatus: 'REGISTERED',
      registeredAt: new Date(Date.now() - i * 3600000),
    });
  }

  const startTime = Date.now();
  const largeExcelBuffer = await exportService.generateMembersExcel(largeMembers, {}, { generatedBy: 'Super Admin' });
  const excelTime = Date.now() - startTime;
  console.log(`  📊 Excel 500 rows generated in ${excelTime}ms (${largeExcelBuffer.length} bytes)`);
  assert(largeExcelBuffer.length > 20000, 'Large Excel generated successfully');

  const pdfStartTime = Date.now();
  const largePdfBuffer = await exportService.generateMembersPdf(largeMembers, {}, { generatedBy: 'Super Admin' });
  const pdfTime = Date.now() - pdfStartTime;
  console.log(`  📄 PDF 500 rows generated in ${pdfTime}ms (${largePdfBuffer.length} bytes)`);
  assert(largePdfBuffer.length > 50000, 'Large multi-page PDF generated successfully');

  // -------------------------------------------------------------
  // Test 5: Special Characters & Unicode
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Special Characters & Unicode ---');
  const unicodeMembers = [
    {
      memberId: 'LN26999',
      name: "José O'Connor-Smith & Co. (Kavya)",
      email: "jose.o'connor+testing@subdomain.org",
      phone: "+91 99999 88888",
      department: "Electronics & Communication #1",
      year: "Postgrad",
      paymentMode: "QR",
      utrNumber: "UTR#99@88!77",
      status: "active",
      registeredAt: new Date(),
    }
  ];

  const unicodeExcel = await exportService.generateMembersExcel(unicodeMembers);
  assert(Buffer.isBuffer(unicodeExcel), 'Special chars Excel generated without error');

  const unicodePdf = await exportService.generateMembersPdf(unicodeMembers);
  assert(Buffer.isBuffer(unicodePdf), 'Special chars PDF generated without error');

  console.log('\n========================================================');
  console.log('🎉 ALL EXPORT SERVICE TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================\n');
}

runExportTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
