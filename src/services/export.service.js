const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');

/**
 * Format a date value into human readable "25 Sep 2026"
 */
const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return String(dateValue);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateValue);
  }
};

/**
 * Format date-time value into "25 Sep 2026, 02:30 PM"
 */
const formatDateTime = (dateValue) => {
  if (!dateValue) return '—';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return String(dateValue);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dateValue);
  }
};

/**
 * Clean string to prevent PDFKit glyph missing errors
 */
const sanitizeText = (text) => {
  if (text === undefined || text === null) return '—';
  const str = String(text).trim();
  if (!str) return '—';
  // Replace smart quotes, apostrophes, and unusual dashes with standard ASCII
  return str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2026]/g, '...');
};

/**
 * Generate formatted Excel (.xlsx) file as Buffer
 * Includes:
 * 1. "Members" sheet with rich styling, brand colors, proper column widths, borders, zebra striping
 * 2. "Export Info" sheet with metadata about generation date, filters applied, and record count
 */
const generateMembersExcel = async (members, query = {}, meta = {}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LanguageNest Admin';
  workbook.created = new Date();

  // -------------------------------------------------------------
  // Sheet 1: Members
  // -------------------------------------------------------------
  const sheet = workbook.addWorksheet('Members', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = [
    { header: 'Member ID', key: 'memberId' },
    { header: 'Full Name', key: 'name' },
    { header: 'Email Address', key: 'email' },
    { header: 'Phone Number', key: 'phone' },
    { header: 'Department / Branch', key: 'department' },
    { header: 'Academic Year', key: 'year' },
    { header: 'Payment Mode', key: 'paymentMode' },
    { header: 'Payment Status', key: 'paymentStatus' },
    { header: 'UTR / Transaction ID', key: 'utrNumber' },
    { header: 'Cash Given To', key: 'cashGivenTo' },
    { header: 'Status', key: 'status' },
    { header: 'Membership Status', key: 'membershipStatus' },
    { header: 'Registration Date', key: 'registeredAt' },
  ];

  // Header row styling
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.font = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E40AF' }, // LanguageNest deep primary blue
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Data rows
  members.forEach((m, idx) => {
    const isQr = (m.paymentMode || '').toUpperCase() === 'QR' || (m.paymentMode || '').toLowerCase() === 'online';
    const row = sheet.addRow({
      memberId: m.memberId || `GLN-${String(m._id || '').slice(-4).toUpperCase()}`,
      name: m.name || '—',
      email: m.email || '—',
      phone: m.phone || '—',
      department: m.department || '—',
      year: m.year || '—',
      paymentMode: isQr ? 'QR / Online' : 'Offline / Cash',
      paymentStatus: (m.paymentStatus || 'RECORDED').toUpperCase(),
      utrNumber: m.utrNumber || m.transactionId || '—',
      cashGivenTo: !isQr && m.cashGivenTo ? m.cashGivenTo : '—',
      status: (m.status || 'active').toUpperCase(),
      membershipStatus: (m.membershipStatus || 'REGISTERED').toUpperCase(),
      registeredAt: formatDate(m.registeredAt || m.createdAt),
    });

    row.height = 22;
    row.alignment = { vertical: 'middle' };

    const isEven = idx % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBg },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      cell.font = { name: 'Segoe UI', size: 10 };

      // Center-align specific columns
      if ([1, 6, 7, 8, 11, 12, 13].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  });

  // Calculate sensible column widths dynamically
  sheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : '';
      if (val.length > maxLength) {
        maxLength = val.length;
      }
    });
    column.width = Math.min(Math.max(maxLength + 4, 14), 45);
  });

  // -------------------------------------------------------------
  // Sheet 2: Export Info
  // -------------------------------------------------------------
  const infoSheet = workbook.addWorksheet('Export Info', {
    views: [{ showGridLines: true }],
  });
  infoSheet.columns = [
    { header: 'Report Parameter', key: 'param', width: 28 },
    { header: 'Details', key: 'value', width: 55 },
  ];

  const infoHeaderRow = infoSheet.getRow(1);
  infoHeaderRow.height = 26;
  infoHeaderRow.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  infoHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF334155' },
  };
  infoHeaderRow.alignment = { vertical: 'middle' };

  const infoData = [
    { param: 'Report Name', value: 'LanguageNest Club Members Report' },
    { param: 'Export Date & Time', value: formatDateTime(new Date()) },
    { param: 'Generated By', value: meta.generatedBy || 'Administrator' },
    { param: 'Total Filtered Records', value: members.length },
    { param: 'Search Query', value: query.search ? `"${String(query.search).trim()}"` : 'None (All)' },
    { param: 'Department Filter', value: query.department && query.department !== 'all' ? query.department : 'All Departments' },
    { param: 'Payment Mode Filter', value: query.paymentMode && query.paymentMode !== 'all' ? query.paymentMode : 'All Payment Modes' },
    { param: 'Status Filter', value: query.status && query.status !== 'all' ? query.status : 'All Statuses' },
  ];

  infoData.forEach((item, idx) => {
    const r = infoSheet.addRow(item);
    r.height = 22;
    r.alignment = { vertical: 'middle' };
    const rowBg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC';
    r.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      cell.font = { name: 'Segoe UI', size: 10 };
    });
  });

  return workbook.xlsx.writeBuffer();
};

/**
 * Generate formatted PDF (.pdf) file as Buffer
 * Landscape layout, multi-page with repeated headers, page numbering "Page X of Y"
 */
const generateMembersPdf = (members, query = {}, meta = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 35,
        bufferPages: true,
        autoFirstPage: true,
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header Branding
      doc.fillColor('#1E40AF').fontSize(16).font('Helvetica-Bold').text('LANGUAGE NEST', 35, 35);
      doc.fillColor('#475569').fontSize(10).font('Helvetica').text('Official Club Members Directory', 35, 54);

      // Metadata right aligned
      const genDateStr = `Generated: ${formatDateTime(new Date())}`;
      const totalStr = `Total Members: ${members.length}`;
      doc.fillColor('#64748B').fontSize(9).font('Helvetica').text(genDateStr, 35, 35, { align: 'right', width: 771 });
      doc.text(totalStr, 35, 48, { align: 'right', width: 771 });

      // Active filters summary
      const activeFilters = [];
      if (query.search && query.search.trim()) activeFilters.push(`Search: "${query.search.trim()}"`);
      if (query.department && query.department !== 'all') activeFilters.push(`Department: ${query.department}`);
      if (query.paymentMode && query.paymentMode !== 'all') activeFilters.push(`Payment: ${query.paymentMode}`);
      if (query.status && query.status !== 'all') activeFilters.push(`Status: ${query.status}`);

      const filterSummary = activeFilters.length > 0
        ? `Filters Applied: ${activeFilters.join('  |  ')}`
        : 'Filters Applied: None (Complete Directory)';

      doc.fillColor('#334155').fontSize(8.5).font('Helvetica-Bold').text(sanitizeText(filterSummary), 35, 70);

      // Divider line
      doc.strokeColor('#CBD5E1').lineWidth(0.75).moveTo(35, 84).lineTo(806, 84).stroke();

      doc.y = 92;

      // Table columns configured to fit 770pt available printable landscape width
      const headers = [
        { label: 'Member ID', width: 68 },
        { label: 'Full Name', width: 110 },
        { label: 'Email Address', width: 145 },
        { label: 'Phone', width: 75 },
        { label: 'Department / Branch', width: 105 },
        { label: 'Year', width: 55 },
        { label: 'Payment Details', width: 95 },
        { label: 'Status', width: 48 },
        { label: 'Registered', width: 70 },
      ];

      const rows = members.map((m) => {
        const isQr = (m.paymentMode || '').toUpperCase() === 'QR' || (m.paymentMode || '').toLowerCase() === 'online';
        let paymentInfo = isQr ? 'QR / Online' : 'Offline / Cash';
        if (isQr && (m.utrNumber || m.transactionId)) {
          paymentInfo += `\nUTR: ${m.utrNumber || m.transactionId}`;
        } else if (!isQr && m.cashGivenTo) {
          paymentInfo += `\nTo: ${m.cashGivenTo}`;
        }

        return [
          sanitizeText(m.memberId || `GLN-${String(m._id || '').slice(-4).toUpperCase()}`),
          sanitizeText(m.name),
          sanitizeText(m.email),
          sanitizeText(m.phone),
          sanitizeText(m.department),
          sanitizeText(m.year),
          sanitizeText(paymentInfo),
          sanitizeText((m.status || 'active').toUpperCase()),
          sanitizeText(formatDate(m.registeredAt || m.createdAt)),
        ];
      });

      const tableData = {
        headers: headers.map((h) => h.label),
        rows,
      };

      doc.table(tableData, {
        columnsSize: headers.map((h) => h.width),
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#1E40AF'),
        prepareRow: () => doc.font('Helvetica').fontSize(7).fillColor('#1E293B'),
        divider: {
          header: { disabled: false, width: 1, opacity: 0.8 },
          horizontal: { disabled: false, width: 0.5, opacity: 0.2 },
        },
      }).then(() => {
        // Post-processing: Add footer & page numbers across all pages
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);
          const pageNum = i + 1;
          const totalPages = range.count;

          doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(35, 565).lineTo(806, 565).stroke();
          doc.fillColor('#64748B').fontSize(7.5).font('Helvetica')
            .text('LanguageNest Club Admin • Confidential Member Records', 35, 572, { lineBreak: false });
          doc.text(`Page ${pageNum} of ${totalPages}`, 35, 572, { align: 'right', width: 771, lineBreak: false });
        }
        doc.end();
      }).catch(reject);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  formatDate,
  formatDateTime,
  generateMembersExcel,
  generateMembersPdf,
};
