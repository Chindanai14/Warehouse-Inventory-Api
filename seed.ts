/**
 * Seed Script — สร้าง ADMIN คนแรก
 * รันด้วย: npx ts-node seed.ts
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const path     = require('path');

// โหลด .env จากโฟลเดอร์ปัจจุบัน (ไม่ต้องมี ../)
require('dotenv').config(); 

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ ไม่พบ MONGODB_URI ใน .env');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    username:     { type: String, required: true, unique: true },
    password:     { type: String, required: true },
    name:         { type: String, required: true },
    role:         { type: String, enum: ['ADMIN', 'STAFF'], default: 'STAFF' },
    isActive:     { type: Boolean, default: true },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true },
);

const UserModel = mongoose.model('User', UserSchema);

const ADMIN_CONFIG = {
  username: 'admin',
  password: 'Admin@1234',
  name:     'System Admin',
  role:     'ADMIN',
};

async function seed() {
  console.log('🌱 เริ่ม Seed...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ เชื่อมต่อ MongoDB สำเร็จ');

  const existing = await UserModel.findOne({ username: ADMIN_CONFIG.username });
  if (existing) {
    console.log(`⚠️  User "${ADMIN_CONFIG.username}" มีอยู่แล้ว — ข้าม`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, 10);
  await UserModel.create({ ...ADMIN_CONFIG, password: hashedPassword });

  console.log('\n✅ สร้าง ADMIN สำเร็จ!');
  console.log('─────────────────────────────');
  console.log(`👤 Username : ${ADMIN_CONFIG.username}`);
  console.log(`🔑 Password : ${ADMIN_CONFIG.password}`);
  console.log('─────────────────────────────');
  console.log('⚠️  อย่าลืมเปลี่ยน Password หลัง login ครั้งแรก!\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed ล้มเหลว:', err.message);
  mongoose.disconnect();
  process.exit(1);
});