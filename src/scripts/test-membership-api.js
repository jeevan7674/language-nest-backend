/**
 * Complete End-to-End Test Suite for Membership Registration & Admin Management
 */
const mongoose = require('mongoose');
const env = require('../config/env');
const Admin = require('../models/Admin');
const Member = require('../models/Member');

const BASE_URL = 'http://localhost:5000/api/v1';

let passed = 0;
let failed = 0;

const assert = (condition, testName, details = '') => {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${details ? '- ' + JSON.stringify(details) : ''}`);
    failed++;
  }
};

async function runTests() {
  console.log('🚀 ========================================================');
  console.log('🚀 TESTING MEMBERSHIP JOINING & ADMIN MANAGEMENT SYSTEM');
  console.log('🚀 ========================================================\n');

  try {
    // 1. Public Payment Settings
    console.log('1. Public Payment Settings API:');
    const settingsRes = await fetch(`${BASE_URL}/membership/settings`);
    const settingsData = await settingsRes.json();
    assert(settingsRes.status === 200, 'GET /membership/settings returns 200 OK');
    assert(Boolean(settingsData.data?.upiId), 'Returns valid UPI ID', settingsData.data?.upiId);
    assert(Boolean(settingsData.data?.upiPayeeName), 'Returns valid UPI Payee Name', settingsData.data?.upiPayeeName);
    assert(Boolean(settingsData.data?.whatsappGroupUrl), 'Returns valid WhatsApp Group URL', settingsData.data?.whatsappGroupUrl);

    // 2. Public Live Presence Heartbeat
    console.log('\n2. Public Live Presence Heartbeat:');
    const testSessionId = `sess_test_${Date.now()}`;
    const hbRes = await fetch(`${BASE_URL}/membership/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: testSessionId }),
    });
    const hbData = await hbRes.json();
    assert(hbRes.status === 200, 'POST /membership/heartbeat returns 200 OK');
    assert(hbData.success === true, 'Heartbeat recorded successfully');

    // 3. Public QR Registration Flow
    console.log('\n3. Public QR Payment Registration Flow:');
    const qrSuffix = Math.floor(1000 + Math.random() * 9000);
    const qrRegRes = await fetch(`${BASE_URL}/membership/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: `Aarav Sharma ${qrSuffix}`,
        email: `aarav.${qrSuffix}@college.edu`,
        phone: `+9198765${qrSuffix}`,
        branch: 'Computer Science',
        year: '2nd Year',
        paymentMode: 'QR',
        utrNumber: `UTR_${qrSuffix}_LIVE`,
        termsAccepted: true,
        sessionId: testSessionId,
      }),
    });
    const qrReg = await qrRegRes.json();
    assert(qrRegRes.status === 201, 'POST /membership/register (QR) returns 201 Created');
    assert(qrReg.success === true, 'Registration success is true');
    assert(Boolean(qrReg.data?.member?.memberId), 'Generated stable Member ID', qrReg.data?.member?.memberId);
    assert(/^LN\d{2}\d{3}$/.test(qrReg.data?.member?.memberId), 'Member ID follows format LN26001 (LN + Year + 3-digit count)', qrReg.data?.member?.memberId);
    assert(qrReg.data?.member?.membershipStatus === 'REGISTERED', 'Membership Status is REGISTERED');
    assert(qrReg.data?.member?.paymentStatus === 'RECORDED', 'Payment Status is RECORDED');
    assert(Boolean(qrReg.data?.whatsappGroupUrl), 'Returns configured WhatsApp group URL');

    const createdMemberId = qrReg.data?.member?._id;

    // 4. Public Offline Registration Flow
    console.log('\n4. Public Offline Payment Registration Flow:');
    const offlineSuffix = Math.floor(1000 + Math.random() * 9000);
    const offlineRegRes = await fetch(`${BASE_URL}/membership/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: `Priya Patel ${offlineSuffix}`,
        email: `priya.${offlineSuffix}@college.edu`,
        phone: `+9198766${offlineSuffix}`,
        branch: 'Electronics',
        year: '3rd Year',
        paymentMode: 'OFFLINE',
        cashGivenTo: 'Coordinator Sneha Reddy',
        termsAccepted: true,
      }),
    });
    const offlineReg = await offlineRegRes.json();
    assert(offlineRegRes.status === 201, 'POST /membership/register (Offline) returns 201 Created');
    assert(offlineReg.success === true, 'Offline registration success is true');
    assert(offlineReg.data?.member?.cashGivenTo === 'Coordinator Sneha Reddy', 'Cash recipient saved correctly');
    assert(offlineReg.data?.member?.paymentMode === 'OFFLINE', 'Payment mode saved as OFFLINE');

    // 5. Validation & Duplicate Protection Tests
    console.log('\n5. Duplicate Protection & Edge Case Validations:');
    
    // Duplicate email
    const dupRes = await fetch(`${BASE_URL}/membership/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Duplicate User',
        email: `aarav.${qrSuffix}@college.edu`,
        phone: `+9191111${qrSuffix}`,
        branch: 'Civil',
        year: '1st Year',
        paymentMode: 'QR',
        utrNumber: 'UTR_DUP',
        termsAccepted: true,
      }),
    });
    assert(dupRes.status === 409, 'Duplicate email registration rejected with 409 Conflict');

    // Missing UTR for QR
    const noUtrRes = await fetch(`${BASE_URL}/membership/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Missing UTR Candidate',
        email: `noutr.${qrSuffix}@college.edu`,
        phone: `+9192222${qrSuffix}`,
        branch: 'Civil',
        year: '1st Year',
        paymentMode: 'QR',
        termsAccepted: true,
      }),
    });
    assert(noUtrRes.status === 400, 'Missing UTR for QR payment rejected with 400 Bad Request');

    // Missing Cash Given To for Offline
    const noCashRes = await fetch(`${BASE_URL}/membership/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Missing Cash Candidate',
        email: `nocash.${qrSuffix}@college.edu`,
        phone: `+9193333${qrSuffix}`,
        branch: 'Mechanical',
        year: '2nd Year',
        paymentMode: 'OFFLINE',
        termsAccepted: true,
      }),
    });
    assert(noCashRes.status === 400, 'Missing Cash Given To for Offline payment rejected with 400 Bad Request');

    // Terms not accepted
    const noTermsRes = await fetch(`${BASE_URL}/membership/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Terms Reject Candidate',
        email: `noterms.${qrSuffix}@college.edu`,
        phone: `+9194444${qrSuffix}`,
        branch: 'Civil',
        year: '1st Year',
        paymentMode: 'OFFLINE',
        cashGivenTo: 'Treasurer',
        termsAccepted: false,
      }),
    });
    assert(noTermsRes.status === 400, 'Unaccepted terms rejected with 400 Bad Request');

    // 6. Admin Authentication & Role Protection
    console.log('\n6. Admin Authentication & Authorization:');
    
    // Unauthorized access check
    const unauthMetricsRes = await fetch(`${BASE_URL}/admin/members/metrics`);
    assert(unauthMetricsRes.status === 401, 'Unauthorized request to /admin/members/metrics returns 401');

    // Authenticate Admin
    await mongoose.connect(env.MONGODB_URI);
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'r.jeevanreddys680@gmail.com', password: 'Jeevan680@' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Admin login credentials accepted');

    const adminUser = await Admin.findOne({ email: 'r.jeevanreddys680@gmail.com' }).select('+loginOtp');
    const otp = adminUser.loginOtp;

    const verifyOtpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'r.jeevanreddys680@gmail.com', otp }),
    });
    const verifyData = await verifyOtpRes.json();
    const token = verifyData.data?.token;
    assert(verifyOtpRes.status === 200, 'OTP verified, received JWT auth token');

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 7. Admin Metrics
    console.log('\n7. Admin Metrics API:');
    const metricsRes = await fetch(`${BASE_URL}/admin/members/metrics`, { headers: authHeaders });
    const metricsData = await metricsRes.json();
    assert(metricsRes.status === 200, 'GET /admin/members/metrics returns 200 OK');
    assert(typeof metricsData.data?.totalRegistrations === 'number', 'Metric 1: Total registrations is number', metricsData.data?.totalRegistrations);
    assert(typeof metricsData.data?.todayRegistrations === 'number', 'Metric 2: Today registrations is number', metricsData.data?.todayRegistrations);
    assert(typeof metricsData.data?.liveRegistering === 'number', 'Metric 3: Live registering candidates is number', metricsData.data?.liveRegistering);

    // 8. Admin Members List & Pagination
    console.log('\n8. Admin Members List & Pagination:');
    const listRes = await fetch(`${BASE_URL}/admin/members?search=Aarav`, { headers: authHeaders });
    const listData = await listRes.json();
    assert(listRes.status === 200, 'GET /admin/members returns 200 OK');
    assert(Array.isArray(listData.data), 'Members data is an array');
    assert(listData.data.length > 0, 'Found registered member in search results');

    // 9. Admin Member Individual Details
    console.log('\n9. Admin Individual Member Details:');
    const detailRes = await fetch(`${BASE_URL}/admin/members/${createdMemberId}`, { headers: authHeaders });
    const detailData = await detailRes.json();
    assert(detailRes.status === 200, 'GET /admin/members/:id returns 200 OK');
    assert(detailData.data?.memberId === qrReg.data?.member?.memberId, 'Member ID matches');
    assert(detailData.data?.utrNumber === `UTR_${qrSuffix}_LIVE`, 'UTR Number matches');
    assert(detailData.data?.termsAccepted === true, 'Terms accepted is true');

    // 10. Admin Payment Settings Update & Public Reflection
    console.log('\n10. Admin Payment Settings Update & Reflection:');
    const newUpiId = `gln.club${qrSuffix}@upi`;
    const newPayee = `Gayaz Club ${qrSuffix}`;
    const newWhatsApp = `https://chat.whatsapp.com/TestGroup${qrSuffix}`;

    const updateSetRes = await fetch(`${BASE_URL}/admin/members/settings`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        upiId: newUpiId,
        upiPayeeName: newPayee,
        whatsappGroupUrl: newWhatsApp,
      }),
    });
    const updateSetData = await updateSetRes.json();
    assert(updateSetRes.status === 200, 'PUT /admin/members/settings returns 200 OK');
    assert(updateSetData.data?.upiId === newUpiId, 'Updated UPI ID saved');

    // Verify public endpoint reflects the update
    const verifyPublicSettingsRes = await fetch(`${BASE_URL}/membership/settings`);
    const verifyPublicSettingsData = await verifyPublicSettingsRes.json();
    assert(verifyPublicSettingsData.data?.upiId === newUpiId, 'Public endpoint serves updated UPI ID');
    assert(verifyPublicSettingsData.data?.whatsappGroupUrl === newWhatsApp, 'Public endpoint serves updated WhatsApp URL');

    // Automatic post-test cleanup to leave production database 100% clean
    await Member.deleteMany({ email: { $regex: /@example\.com|test\.qr|test\.offline/i } });
    await RegistrationSession.deleteMany({ sessionId: { $regex: /sess_test/i } });

    console.log('\n========================================================');
    console.log(`📊 TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
    console.log('========================================================\n');

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ Test execution error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTests();
