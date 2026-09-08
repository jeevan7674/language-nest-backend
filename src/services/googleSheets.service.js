const env = require('../config/env');

/**
 * Synchronize registered member data to Google Sheets via Google Apps Script Web App.
 * Non-blocking: failures are logged and will not disrupt registration flow.
 *
 * @param {Object} memberData
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
const syncMemberToGoogleSheets = async (memberData) => {
  const scriptUrl = env.GOOGLE_SHEETS_SCRIPT_URL || process.env.GOOGLE_SHEETS_SCRIPT_URL;

  if (!scriptUrl) {
    console.log('ℹ️ [Google Sheets Sync] GOOGLE_SHEETS_SCRIPT_URL not configured. Skipping remote sync.');
    return { success: true, skipped: true };
  }

  const payload = {
    memberId: memberData.memberId || '',
    fullName: memberData.name || '',
    branch: memberData.department || '',
    year: memberData.year || '',
    phone: memberData.phone || '',
    email: memberData.email || '',
    paymentMode: memberData.paymentMode || '',
    utrNumber: memberData.utrNumber || memberData.transactionId || '',
    cashGivenTo: memberData.cashGivenTo || '',
    termsAccepted: memberData.termsAccepted !== false,
    termsAcceptedAt: memberData.termsAcceptedAt ? new Date(memberData.termsAcceptedAt).toISOString() : new Date().toISOString(),
    registeredAt: memberData.registeredAt ? new Date(memberData.registeredAt).toISOString() : new Date().toISOString(),
    membershipStatus: memberData.membershipStatus || 'REGISTERED',
    paymentStatus: memberData.paymentStatus || 'RECORDED',
  };

  try {
    console.log(`📊 [Google Sheets Sync] Dispatching record for Member ID: ${payload.memberId} to Apps Script Web App...`);

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({ status: 'unknown_response' }));

    if (!response.ok || (result && result.success === false)) {
      console.warn('⚠️ [Google Sheets Sync Warning] Apps Script responded with error:', result);
      return { success: false, error: result?.message || 'Apps Script sync failed' };
    }

    console.log(`✅ [Google Sheets Sync] Member ${payload.memberId} synchronized successfully.`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ [Google Sheets Sync Error] Failed syncing member ${payload.memberId}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  syncMemberToGoogleSheets,
};
