const http = require('http');

const BASE_URL = 'http://localhost:5000/api/v1';

// Helper to make HTTP requests
const request = ({ method, path, headers = {}, body = null }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
};

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

const runTests = async () => {
  console.log('🚀 ========================================================');
  console.log('🚀 STARTING COMPREHENSIVE BACKEND API TEST SUITE');
  console.log('🚀 ========================================================\n');

  let adminToken = '';
  let eventAdminToken = '';

  // 1. Health Check
  console.log('📡 1. Testing Health Endpoint:');
  const healthRes = await request({ method: 'GET', path: '/health' });
  assert(healthRes.status === 200, 'GET /health returns 200 OK');
  assert(healthRes.body.success === true, 'Health payload success: true');

  // 2. Authentication Tests (Email + Password + OTP Verification)
  console.log('\n🔐 2. Testing Email & Password + OTP Authentication:');
  
  // Wrong password
  const wrongPwdRes = await request({
    method: 'POST',
    path: '/auth/login',
    body: { email: 'r.jeevanreddys680@gmail.com', password: 'wrongpassword' },
  });
  assert(wrongPwdRes.status === 401, 'Login with wrong password returns 401');

  // Unknown user
  const unknownUserRes = await request({
    method: 'POST',
    path: '/auth/login',
    body: { email: 'unknown@languagenest.com', password: 'password' },
  });
  assert(unknownUserRes.status === 401, 'Login with unknown email returns 401');

  // Validation error on missing fields
  const invalidLoginRes = await request({
    method: 'POST',
    path: '/auth/login',
    body: { email: 'not-an-email', password: '123' },
  });
  assert(invalidLoginRes.status === 400, 'Login with invalid fields returns 400 validation error');

  // Step 1: Successful Super Admin credentials submission (Triggers OTP email)
  const loginRes = await request({
    method: 'POST',
    path: '/auth/login',
    body: { email: 'r.jeevanreddys680@gmail.com', password: 'Jeevan680@' },
  });
  assert(loginRes.status === 200, 'Login credentials verified, returns 200 OK');
  assert(loginRes.body.data.requireOtp === true, 'Response requires OTP: requireOtp=true');
  assert(loginRes.body.data.email === 'r.jeevanreddys680@gmail.com', 'Response returns admin email');

  // Step 2a: Test Invalid OTP code
  const wrongOtpRes = await request({
    method: 'POST',
    path: '/auth/verify-otp',
    body: { email: 'r.jeevanreddys680@gmail.com', otp: '000000' },
  });
  assert(wrongOtpRes.status === 400, 'Submitting invalid OTP returns 400 Bad Request');

  // Fetch generated OTP from database for automated test verification
  const mongoose = require('mongoose');
  const env = require('../config/env');
  const Admin = require('../models/Admin');
  await mongoose.connect(env.MONGODB_URI);
  const adminDoc = await Admin.findOne({ email: 'r.jeevanreddys680@gmail.com' }).select('+loginOtp');
  const actualOtp = adminDoc.loginOtp;
  assert(Boolean(actualOtp && actualOtp.length === 6), `Generated 6-digit OTP stored in DB (${actualOtp})`);

  // Step 2b: Submit Valid OTP code
  const verifyOtpRes = await request({
    method: 'POST',
    path: '/auth/verify-otp',
    body: { email: 'r.jeevanreddys680@gmail.com', otp: actualOtp },
  });
  assert(verifyOtpRes.status === 200, 'POST /auth/verify-otp with valid code returns 200 OK');
  assert(verifyOtpRes.body.data.token, 'JWT session token issued upon OTP verification');
  adminToken = verifyOtpRes.body.data.token;

  // GET /auth/me with Bearer token
  const meRes = await request({
    method: 'GET',
    path: '/auth/me',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(meRes.status === 200, 'GET /auth/me returns 200 OK');
  assert(meRes.body.data.admin.email === 'r.jeevanreddys680@gmail.com', 'Current admin profile matches');

  // 3. Authorization & RBAC
  console.log('\n🛡️ 3. Testing Authorization & Role-Based Access Control:');
  
  // Create temporary Event Admin in DB for RBAC test
  const tempEventAdmin = await Admin.create({
    name: 'Temporary Event Admin',
    email: 'temp.eventadmin@test.com',
    password: 'Password123@',
    roles: ['Event Admin'],
    status: 'active',
  });

  const { generateToken } = require('../utils/token');
  eventAdminToken = generateToken({
    id: tempEventAdmin._id,
    email: tempEventAdmin.email,
    roles: tempEventAdmin.roles,
  });

  // Access protected route without token
  const unauthRes = await request({ method: 'GET', path: '/admin/dashboard' });
  assert(unauthRes.status === 401, 'Accessing protected route without token returns 401');

  // Event Admin trying to access Super-Admin-only Admins management route
  const forbiddenRes = await request({
    method: 'GET',
    path: '/admin/admins',
    headers: { Authorization: `Bearer ${eventAdminToken}` },
  });
  assert(forbiddenRes.status === 403, 'Event Admin accessing /admin/admins returns 403 Forbidden');

  // Clean up temporary event admin
  await Admin.findByIdAndDelete(tempEventAdmin._id);

  // Super Admin accessing /admin/admins
  const adminListRes = await request({
    method: 'GET',
    path: '/admin/admins',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminListRes.status === 200, 'Super Admin accessing /admin/admins returns 200 OK');

  // 4. Dashboard Endpoint
  console.log('\n📊 4. Testing Dashboard Statistics:');
  const dashRes = await request({
    method: 'GET',
    path: '/admin/dashboard',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(dashRes.status === 200, 'GET /admin/dashboard returns 200 OK');
  assert(dashRes.body.data.metrics.events !== undefined, 'Dashboard contains events metric object');
  assert(dashRes.body.data.metrics.members !== undefined, 'Dashboard contains members metric object');
  assert(dashRes.body.data.metrics.admins.active >= 1, 'Dashboard reflects active Super Admin');

  // 5. Events Management (CRUD)
  console.log('\n📅 5. Testing Events Management CRUD:');
  
  // List events with pagination
  const eventsListRes = await request({
    method: 'GET',
    path: '/admin/events?page=1&limit=5',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(eventsListRes.status === 200, 'GET /admin/events with pagination & filters returns 200 OK');
  assert(eventsListRes.body.pagination !== undefined || Array.isArray(eventsListRes.body.data), 'Events response data present');

  // Create Event
  const newEventRes = await request({
    method: 'POST',
    path: '/admin/events',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: 'Italian Pasta & Language Workshop',
      type: 'Cultural',
      description: 'Learn Italian culinary terms while cooking handmade pasta.',
      date: '2025-12-28',
      time: '5:00 PM',
      venue: 'Culinary Lab 2',
      capacity: 25,
      status: 'upcoming',
    },
  });
  assert(newEventRes.status === 201, 'POST /admin/events creates new event (201 Created)');
  const createdEventId = newEventRes.body.data._id;
  assert(newEventRes.body.data.slug && newEventRes.body.data.slug.startsWith('italian-pasta-language-workshop'), 'Slug correctly generated');

  // Get Event by ID
  const singleEventRes = await request({
    method: 'GET',
    path: `/admin/events/${createdEventId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(singleEventRes.status === 200, 'GET /admin/events/:id returns single event');

  // Update Event
  const updateEventRes = await request({
    method: 'PUT',
    path: `/admin/events/${createdEventId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: 'Italian Pasta & Language Workshop - Extended',
      capacity: 30,
    },
  });
  assert(updateEventRes.status === 200, 'PUT /admin/events/:id updates event');
  assert(updateEventRes.body.data.capacity === 30, 'Event capacity updated');

  // Delete Event
  const deleteEventRes = await request({
    method: 'DELETE',
    path: `/admin/events/${createdEventId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteEventRes.status === 200, 'DELETE /admin/events/:id deletes event');

  // 6. Workshops CRUD
  console.log('\n🎓 6. Testing Workshops Management CRUD:');
  const createWorkshopRes = await request({
    method: 'POST',
    path: '/admin/workshops',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: 'Mandarin HSK 1 Preparation',
      language: 'Mandarin',
      trainer: 'Li Wei',
      duration: '8 weeks',
      sessions: 16,
      maxParticipants: 20,
      status: 'upcoming',
      description: 'Foundational Chinese characters and pinyin tones.',
    },
  });
  assert(createWorkshopRes.status === 201, 'POST /admin/workshops creates workshop');
  const createdWorkshopId = createWorkshopRes.body.data._id;

  const getWorkshopsRes = await request({
    method: 'GET',
    path: '/admin/workshops?language=Mandarin',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(getWorkshopsRes.status === 200, 'GET /admin/workshops filters by language');

  const deleteWorkshopRes = await request({
    method: 'DELETE',
    path: `/admin/workshops/${createdWorkshopId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteWorkshopRes.status === 200, 'DELETE /admin/workshops/:id deletes workshop');

  // 7. Members CRUD
  console.log('\n👥 7. Testing Members Management CRUD:');
  const createMemberRes = await request({
    method: 'POST',
    path: '/admin/members',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      name: 'Rohan Gupta',
      email: 'rohan.gupta@college.edu',
      phone: '+91 99999 11111',
      department: 'Computer Science',
      year: '2nd Year',
      paymentMode: 'online',
      transactionId: 'TXN998877',
    },
  });
  assert(createMemberRes.status === 201, 'POST /admin/members registers member');
  const createdMemberId = createMemberRes.body.data._id;

  const deleteMemberRes = await request({
    method: 'DELETE',
    path: `/admin/members/${createdMemberId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteMemberRes.status === 200, 'DELETE /admin/members/:id deletes member');

  // 8. Team Management
  console.log('\n🛡️ 8. Testing Team Management:');
  const teamsListRes = await request({
    method: 'GET',
    path: '/admin/team?search=Sarah',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(teamsListRes.status === 200, 'GET /admin/team returns teams list with search support');

  // Create new academic team
  const createTeamRes = await request({
    method: 'POST',
    path: '/admin/team',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      year: '2025-26',
      isAlumni: false,
      members: [],
    },
  });
  assert(createTeamRes.status === 201, 'POST /admin/team creates new academic year team');
  const createdTeamId = createTeamRes.body.data._id;

  // Get Team by ID
  const getTeamRes = await request({
    method: 'GET',
    path: `/admin/team/${createdTeamId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(getTeamRes.status === 200, 'GET /admin/team/:id returns academic team');

  // Add Member to Team
  const addMemberRes = await request({
    method: 'POST',
    path: `/admin/team/${createdTeamId}/members`,
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      name: 'Ananya Rao',
      role: 'Content Lead',
      email: 'ananya.rao@languagenest.com',
      department: 'English Literature',
    },
  });
  assert(addMemberRes.status === 201, 'POST /admin/team/:id/members adds member to academic year team');
  const addedMemberId = addMemberRes.body.data.members[0]._id;

  // Get single team member
  const getMemberRes = await request({
    method: 'GET',
    path: `/admin/team/${createdTeamId}/members/${addedMemberId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(getMemberRes.status === 200, 'GET /admin/team/:id/members/:memberId returns single team member');

  // Update team member
  const updateMemberRes = await request({
    method: 'PUT',
    path: `/admin/team/${createdTeamId}/members/${addedMemberId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      role: 'Vice President',
    },
  });
  assert(updateMemberRes.status === 200, 'PUT /admin/team/:id/members/:memberId updates team member');

  // Remove team member
  const removeMemberRes = await request({
    method: 'DELETE',
    path: `/admin/team/${createdTeamId}/members/${addedMemberId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(removeMemberRes.status === 200, 'DELETE /admin/team/:id/members/:memberId removes team member');

  // Delete team
  const deleteTeamRes = await request({
    method: 'DELETE',
    path: `/admin/team/${createdTeamId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteTeamRes.status === 200, 'DELETE /admin/team/:id deletes academic team');

  // 9. Announcements & Pin Toggle
  console.log('\n📢 9. Testing Announcements & Pinning:');
  const createAnnRes = await request({
    method: 'POST',
    path: '/admin/announcements',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: 'Urgent Room Change for Spanish Night',
      message: 'Event moved from Room 203 to Auditorium B due to high registration numbers.',
      category: 'Event Update',
      target: 'All Members',
      isPinned: false,
    },
  });
  assert(createAnnRes.status === 201, 'POST /admin/announcements creates announcement');
  const annId = createAnnRes.body.data._id;

  const togglePinRes = await request({
    method: 'PATCH',
    path: `/admin/announcements/${annId}/pin`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(togglePinRes.status === 200, 'PATCH /admin/announcements/:id/pin toggles pinned status');
  assert(togglePinRes.body.data.isPinned === true, 'Announcement is now pinned');

  const deleteAnnRes = await request({
    method: 'DELETE',
    path: `/admin/announcements/${annId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteAnnRes.status === 200, 'DELETE /admin/announcements/:id deletes announcement');

  // 10. Finance & Summary
  console.log('\n💰 10. Testing Finance Transactions & Summary:');
  const finSummaryRes = await request({
    method: 'GET',
    path: '/admin/finance/summary',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(finSummaryRes.status === 200, 'GET /admin/finance/summary returns totals');

  const createTxnRes = await request({
    method: 'POST',
    path: '/admin/finance/transactions',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: 'Test Audio System Rental',
      amount: 3500,
      type: 'expense',
      category: 'Equipment',
      date: '2025-12-01',
      paymentMode: 'online',
    },
  });
  assert(createTxnRes.status === 201, 'POST /admin/finance/transactions records transaction');
  const txnId = createTxnRes.body.data._id;

  const deleteTxnRes = await request({
    method: 'DELETE',
    path: `/admin/finance/transactions/${txnId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteTxnRes.status === 200, 'DELETE /admin/finance/transactions/:id deletes transaction');

  // 11. Form Builder & Responses
  console.log('\n📝 11. Testing Form Builder & Responses:');
  const createFormRes = await request({
    method: 'POST',
    path: '/admin/forms',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: 'Summer Immersion Camp Survey',
      description: 'Survey for students interested in language immersion trips.',
      status: 'active',
      fields: [
        { id: 'q1', type: 'text', label: 'Preferred Destination', required: true },
      ],
    },
  });
  assert(createFormRes.status === 201, 'POST /admin/forms creates custom form');
  const formId = createFormRes.body.data._id;

  const deleteFormRes = await request({
    method: 'DELETE',
    path: `/admin/forms/${formId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteFormRes.status === 200, 'DELETE /admin/forms/:id deletes form');

  // 12. Resources, Gallery, News, Stories
  console.log('\n📚 12. Testing Resources, Gallery, News, and Stories:');
  const resList = await request({ method: 'GET', path: '/admin/resources', headers: { Authorization: `Bearer ${adminToken}` } });
  assert(resList.status === 200, 'GET /admin/resources returns 200');

  const galList = await request({ method: 'GET', path: '/admin/gallery', headers: { Authorization: `Bearer ${adminToken}` } });
  assert(galList.status === 200, 'GET /admin/gallery returns 200');

  const newsList = await request({ method: 'GET', path: '/admin/news', headers: { Authorization: `Bearer ${adminToken}` } });
  assert(newsList.status === 200, 'GET /admin/news returns 200');

  const storyList = await request({ method: 'GET', path: '/admin/stories', headers: { Authorization: `Bearer ${adminToken}` } });
  assert(storyList.status === 200, 'GET /admin/stories returns 200');

  // 13. Error Handling (404 and CastError)
  console.log('\n🚫 13. Testing Error Handling:');
  const notFoundRouteRes = await request({ method: 'GET', path: '/non-existent-endpoint' });
  assert(notFoundRouteRes.status === 404, 'Undefined route returns 404 Not Found');

  const badIdRes = await request({
    method: 'GET',
    path: '/admin/events/invalid-mongo-id',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(badIdRes.status === 400, 'Malformed MongoDB ID returns 400 Bad Request');

  // 14. Profile Update & Password Change
  console.log('\n👤 14. Testing Admin Profile & Password Change:');
  const updateProfRes = await request({
    method: 'PUT',
    path: '/auth/profile',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      name: 'Super Administrator Updated',
      phone: '+91 99999 88888',
      bio: 'Head of Language Nest operations and tech.'
    },
  });
  assert(updateProfRes.status === 200, 'PUT /auth/profile updates profile');
  assert(updateProfRes.body.data.admin.name === 'Super Administrator Updated', 'Profile name updated correctly in DB');

  const changePwRes = await request({
    method: 'PUT',
    path: '/auth/change-password',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      currentPassword: 'Jeevan680@',
      newPassword: 'NewPassword123@',
      confirmPassword: 'NewPassword123@',
    },
  });
  assert(changePwRes.status === 200, 'PUT /auth/change-password changes password');

  // Change back to 'Jeevan680@' for consistency
  const revertPwRes = await request({
    method: 'PUT',
    path: '/auth/change-password',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      currentPassword: 'NewPassword123@',
      newPassword: 'Jeevan680@',
      confirmPassword: 'Jeevan680@',
    },
  });
  assert(revertPwRes.status === 200, 'PUT /auth/change-password successfully reverts password');

  // 15. Testing Cloudinary Image Upload
  console.log('\n📸 15. Testing Image Upload Endpoint:');
  const uploadNoFileRes = await request({
    method: 'POST',
    path: '/upload/image',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(uploadNoFileRes.status === 400, 'POST /upload/image with missing file returns 400');

  console.log('\n🏁 ========================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('🏁 ========================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests().catch((err) => {
  console.error('Test execution crashed:', err);
  process.exit(1);
});
