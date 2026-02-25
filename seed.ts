/**
 * seed.ts — สร้าง ADMIN user คนแรก
 * รันด้วย: npx ts-node seed.ts
 *
 * ใช้เมื่อ: ตอนนี้ POST /users ต้องการ ADMIN token แล้ว
 * ดังนั้นต้องสร้าง ADMIN คนแรกผ่าน script นี้แทน
 */

import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name:     { type: String, required: true },
  role:     { type: String, required: true, enum: ['ADMIN', 'STAFF'], default: 'STAFF' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('ไม่พบ MONGODB_URI ใน .env');

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const User = mongoose.model('User', UserSchema);

  const username = 'admin';
  const existing = await User.findOne({ username });
  if (existing) {
    console.log('⚠️  User "admin" มีอยู่แล้ว ไม่ต้องสร้างใหม่');
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);
  await User.create({
    username,
    password: hashedPassword,
    name:     'Administrator',
    role:     'ADMIN',
    isActive: true,
  });

  console.log('✅ สร้าง ADMIN user สำเร็จ');
  console.log('   username: admin');
  console.log('   password: password123');
  console.log('   ⚠️  กรุณาเปลี่ยนรหัสผ่านหลัง login ครั้งแรก!');

  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
