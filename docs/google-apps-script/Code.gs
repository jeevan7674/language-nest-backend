/**
 * Google Apps Script for Gayaz Language Nest Member Registrations Synchronization
 *
 * Setup Instructions:
 * 1. Open your Google Sheet.
 * 2. Click on Extensions > Apps Script.
 * 3. Delete any code in Code.gs and paste this entire script.
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type: "Web app".
 * 6. Set Description: "Language Nest Member Sync Webhook".
 * 7. Set "Execute as": "Me" (your email).
 * 8. Set "Who has access": "Anyone" (allows backend webhook POST requests).
 * 9. Click "Deploy", authorize permissions, and copy the Web App URL.
 * 10. Add the URL to your backend .env file:
 *     GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
 */

const SHEET_NAME = 'Members';

// Column structure matching Language Nest registration schema
const HEADERS = [
  '#',
  'Member ID',
  'Full Name',
  'Branch',
  'Year',
  'Phone Number',
  'Email',
  'Payment Mode',
  'UTR / Transaction ID',
  'Cash Given To',
  'Terms Accepted',
  'Terms Accepted At',
  'Registration Date',
  'Registration Time',
  'Membership Status',
  'Payment Status',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Wait up to 10 seconds for concurrent write locks
    lock.waitLock(10000);

    const sheet = getOrCreateMembersSheet();
    const data = JSON.parse(e.postData.contents);

    // Validate payload
    if (!data.memberId || !data.fullName || !data.email) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, message: 'Missing required member fields (memberId, fullName, email)' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Check for duplicate Member ID in Column B (Index 2)
    const existingRow = findRowByMemberId(sheet, data.memberId);
    if (existingRow > 0) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: 'Member already synchronized', memberId: data.memberId, row: existingRow })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Format timestamps
    const regDateObj = data.registeredAt ? new Date(data.registeredAt) : new Date();
    const formattedDate = Utilities.formatDate(regDateObj, 'Asia/Kolkata', 'yyyy-MM-dd');
    const formattedTime = Utilities.formatDate(regDateObj, 'Asia/Kolkata', 'hh:mm:ss a');

    const termsAcceptedDate = data.termsAcceptedAt
      ? Utilities.formatDate(new Date(data.termsAcceptedAt), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss')
      : 'Yes';

    const lastRow = sheet.getLastRow();
    const rowNumber = lastRow; // 1-based index (header is row 1, so row 2 is #1)

    const rowData = [
      rowNumber,
      `'${data.memberId}`, // Enforce text format
      data.fullName,
      data.branch || '',
      data.year || '',
      `'${data.phone || ''}`, // Enforce text format for phone numbers
      data.email,
      data.paymentMode || '',
      data.utrNumber ? `'${data.utrNumber}` : '',
      data.cashGivenTo || '',
      data.termsAccepted ? 'YES' : 'NO',
      termsAcceptedDate,
      formattedDate,
      formattedTime,
      data.membershipStatus || 'REGISTERED',
      data.paymentStatus || 'RECORDED',
    ];

    sheet.appendRow(rowData);

    // Apply clean styling to new row
    const newRowIndex = sheet.getLastRow();
    const range = sheet.getRange(newRowIndex, 1, 1, HEADERS.length);
    range.setVerticalAlignment('middle');
    range.setFontFamily('Inter');
    range.setFontSize(10);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: 'Member row successfully added', memberId: data.memberId, row: newRowIndex })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'Active',
      service: 'Gayaz Language Nest Members Webhook',
      timestamp: new Date().toISOString(),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateMembersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Check if header row exists
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);

    // Style header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#2563eb');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontFamily('Inter');
    headerRange.setFontSize(10);
    headerRange.setVerticalAlignment('middle');
    headerRange.setHorizontalAlignment('center');

    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);

    // Auto-fit column widths
    for (let col = 1; col <= HEADERS.length; col++) {
      sheet.autoResizeColumn(col);
      if (sheet.getColumnWidth(col) < 110) {
        sheet.setColumnWidth(col, 110);
      }
    }
  }

  return sheet;
}

function findRowByMemberId(sheet, memberId) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 0;

  // Search Column B (Member ID)
  const memberIdValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  const cleanSearch = String(memberId).trim().toLowerCase();

  for (let i = 0; i < memberIdValues.length; i++) {
    const val = String(memberIdValues[i][0]).replace(/^'/, '').trim().toLowerCase();
    if (val === cleanSearch) {
      return i + 2; // Return 1-based row index
    }
  }

  return 0;
}
