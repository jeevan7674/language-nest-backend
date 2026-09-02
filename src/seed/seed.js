/**
 * Language Nest - Production Database Bootstrap
 * 
 * Note: Seeding is deactivated as production/real data entry is now active.
 * Only bootstraps default super admin if the database has zero registered admins.
 */

const mongoose = require('mongoose');
const env = require('../config/env');
const Admin = require('../models/Admin');

const initSuperAdminIfEmpty = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      console.log('👤 No administrators found. Bootstrapping Super Admin...');
      await Admin.create({
        name: 'Jeevan Reddy',
        email: 'r.jeevanreddys680@gmail.com',
        password: 'Jeevan680@',
        roles: ['Super Admin'],
        status: 'active',
        lastActive: new Date(),
      });
      console.log('✅ Super Admin created.');
    } else {
      console.log(`ℹ️ Database already initialized (${adminCount} admin account(s) present). No action needed.`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Bootstrap check failed:', error);
    process.exit(1);
  }
};

initSuperAdminIfEmpty();
