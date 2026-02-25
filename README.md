# 🏭 Warehouse Inventory API

ระบบจัดการคลังสินค้าและสต๊อก Backend API พัฒนาด้วย **NestJS** + **MongoDB**

---

## 📌 ภาพรวมระบบ

ระบบ Warehouse Inventory API ถูกออกแบบมาเพื่อแก้ปัญหาการจัดการสต๊อกสินค้าในคลังสินค้าขนาดกลาง ที่ยังใช้การจดบันทึกด้วยมือหรือ Spreadsheet ซึ่งเกิดข้อผิดพลาดได้ง่าย ระบบนี้ช่วยให้:

- ติดตามสต๊อกสินค้าแบบ Real-time
- บันทึกประวัติการรับ/เบิกสินค้าทุกรายการ
- แจ้งเตือนเมื่อสินค้าใกล้หมด
- จัดการผู้ใช้งานตามบทบาท (ADMIN / STAFF)

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js) |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (Access Token + Refresh Token) |
| Documentation | Swagger / OpenAPI |
| Validation | class-validator, class-transformer |
| Security | Helmet, CORS, Rate Limiting (Throttler) |

---

## 🏗 สถาปัตยกรรมระบบ

```
src/
├── auth/                     # Authentication (Login, JWT Strategy)
│   ├── roles.decorator.ts    # @Roles() custom decorator
│   └── roles.guard.ts        # RolesGuard ตรวจสิทธิ์ตาม Role
├── users/                    # จัดการผู้ใช้งาน
├── products/                 # จัดการสินค้า
├── suppliers/                # จัดการ Supplier
├── categories/               # จัดการหมวดหมู่
├── stock-movements/          # รับ/เบิกสินค้า + รายงาน
└── common/
    ├── dto/pagination.dto.ts         # Pagination ใช้ร่วมกันทุก Module
    ├── filters/http-exception.filter.ts  # Global Error Handler
    ├── interceptors/transform.interceptor.ts  # Global Response Format
    └── pipes/parse-object-id.pipe.ts  # Validate MongoDB ObjectId
```

### Request Flow

```
Client Request
    │
    ▼
[Helmet + CORS + Rate Limiter]   ← Security Layer
    │
    ▼
[JwtAuthGuard]                   ← ตรวจ Access Token
    │
    ▼
[RolesGuard]                     ← ตรวจสิทธิ์ ADMIN / STAFF
    │
    ▼
[ValidationPipe + ParseObjectIdPipe]  ← Validate Input
    │
    ▼
[Controller → Service]           ← Business Logic
    │
    ▼
[MongoDB Transaction]            ← Data Layer (StockMovements ใช้ Transaction)
    │
    ▼
[TransformInterceptor]           ← จัด Response Format
    │
    ▼
Client Response
```

---

## 🗂 Database Schema (Collections)

### 1. Users
```js
{
  _id: ObjectId,
  username: String,      // unique
  password: String,      // bcrypt hashed
  name: String,
  role: "ADMIN" | "STAFF",
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Suppliers
```js
{
  _id: ObjectId,
  name: String,
  contactPerson: String,
  email: String,         // unique
  phone: String,
  address: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Categories
```js
{
  _id: ObjectId,
  name: String,          // unique
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Products
```js
{
  _id: ObjectId,
  name: String,
  sku: String,           // unique
  category: String,
  unit: String,
  costPrice: Number,
  sellingPrice: Number,
  minStockLevel: Number,
  currentStock: Number,
  supplier: ObjectId,    // ref → Suppliers
  createdAt: Date,
  updatedAt: Date
}
```

### 5. StockMovements
```js
{
  _id: ObjectId,
  product: ObjectId,     // ref → Products
  type: "IN" | "OUT" | "ADJUST",
  quantity: Number,
  remainingStock: Number,
  reason: String,
  referenceNo: String,
  performedBy: String,
  note: String,
  createdAt: Date,
  updatedAt: Date
}
```

### ความสัมพันธ์ระหว่าง Collections

```
Suppliers ──────┐
                │ (ref)
Categories      ├──→ Products ──→ StockMovements
                │        (ref)
Users ──────────┘ (ผู้ดูแล)
```

---

## 🔐 Authentication & Authorization

ระบบใช้ **Dual JWT Token** เพื่อความปลอดภัย:

| Token | อายุ | วัตถุประสงค์ |
|---|---|---|
| Access Token | 15 นาที | ใช้ยืนยันตัวตนทุก Request |
| Refresh Token | 7 วัน | ใช้ขอ Access Token ใหม่ |

### Role-based Access Control

| Endpoint | ADMIN | STAFF |
|---|---|---|
| POST /products | ✅ | ❌ |
| PATCH /products/:id | ✅ | ❌ |
| DELETE /products/:id | ✅ | ❌ |
| GET /products | ✅ | ✅ |
| POST /stock-movements/in | ✅ | ✅ |
| POST /stock-movements/out | ✅ | ✅ |
| GET /stock-movements/report | ✅ | ❌ |
| GET /users | ✅ | ❌ |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/login` | เข้าสู่ระบบ รับ Token | ❌ |

### Users
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/users` | สร้างผู้ใช้งานใหม่ | ❌ |
| GET | `/api/v1/users` | ดูรายการผู้ใช้ทั้งหมด | ADMIN |

### Products
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/products` | สร้างสินค้า | ADMIN |
| GET | `/api/v1/products` | ดูสินค้าทั้งหมด (Pagination) | ❌ |
| GET | `/api/v1/products/low-stock` | สินค้าใกล้หมด | ✅ |
| GET | `/api/v1/products/:id` | ดูสินค้าตาม ID | ❌ |
| PATCH | `/api/v1/products/:id` | แก้ไขสินค้า | ADMIN |
| DELETE | `/api/v1/products/:id` | ลบสินค้า | ADMIN |

### Suppliers
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/suppliers` | สร้าง Supplier | ADMIN |
| GET | `/api/v1/suppliers` | ดู Supplier ทั้งหมด (Pagination) | ✅ |
| GET | `/api/v1/suppliers/:id` | ดู Supplier ตาม ID | ✅ |
| PATCH | `/api/v1/suppliers/:id` | แก้ไข Supplier | ADMIN |
| DELETE | `/api/v1/suppliers/:id` | ลบ Supplier | ADMIN |

### Categories
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/categories` | สร้างหมวดหมู่ | ADMIN |
| GET | `/api/v1/categories` | ดูหมวดหมู่ทั้งหมด (Pagination) | ✅ |
| PATCH | `/api/v1/categories/:id` | แก้ไขหมวดหมู่ | ADMIN |
| DELETE | `/api/v1/categories/:id` | ลบหมวดหมู่ | ADMIN |

### Stock Movements
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/stock-movements/in` | รับสินค้าเข้าคลัง | ✅ |
| POST | `/api/v1/stock-movements/out` | เบิกสินค้าออกจากคลัง | ✅ |
| GET | `/api/v1/stock-movements` | ดูประวัติการเคลื่อนไหว | ✅ |
| GET | `/api/v1/stock-movements/report` | รายงานสรุป IN/OUT | ADMIN |
| GET | `/api/v1/stock-movements/:productId` | ประวัติตาม Product | ✅ |

---

## 💡 จุดเด่นทางเทคนิค

### 1. MongoDB Transaction (Stock Consistency)
การรับ/เบิกสินค้าใช้ MongoDB Session และ Transaction เพื่อป้องกันข้อมูลไม่สอดคล้องกัน กรณีที่อัปเดต Stock สำเร็จแต่บันทึก Movement ล้มเหลว ระบบจะ rollback ทั้งคู่โดยอัตโนมัติ

```typescript
const session = await this.connection.startSession();
session.startTransaction();
try {
  product.currentStock += dto.quantity;
  await product.save({ session });
  await movement.save({ session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction(); // ← rollback ถ้าเกิด error
}
```

### 2. Global Response Format
ทุก API ตอบกลับในรูปแบบเดียวกันผ่าน `TransformInterceptor`:
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

### 3. Role-based Access Control
ใช้ `RolesGuard` + `@Roles()` decorator แยกสิทธิ์ ADMIN และ STAFF อย่างชัดเจน โดยไม่ต้องเขียน if-else ซ้ำในทุก endpoint

### 4. Pagination มาตรฐาน
ทุก GET list endpoint รองรับ `?page=1&limit=10` และตอบกลับพร้อม metadata:
```json
{
  "data": [...],
  "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
}
```

### 5. Low Stock Detection
ใช้ MongoDB `$expr` เปรียบเทียบ 2 field ในเอกสารเดียวกันโดยตรง:
```typescript
{ $expr: { $lte: ['$currentStock', '$minStockLevel'] } }
```

---

## ⚙️ การติดตั้งและรันระบบ

### 1. Clone โปรเจกต์
```bash
git clone <repository-url>
cd warehouse-inventory-api
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment
สร้างไฟล์ `.env` ที่ root ของโปรเจกต์:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/warehouse_db
PORT=3000

JWT_ACCESS_SECRET=<your-secret-key>
JWT_ACCESS_EXPIRATION=900

JWT_REFRESH_SECRET=<your-refresh-secret-key>
JWT_REFRESH_EXPIRATION=604800
```

### 4. รันระบบ
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 5. เปิด API Documentation
```
http://localhost:3000/api/docs
```

---

## 🧪 การทดสอบ API (ลำดับที่แนะนำ)

```bash
# 1. สร้าง ADMIN คนแรก
POST /api/v1/users
{ "username": "admin", "password": "password123", "name": "Admin", "role": "ADMIN" }

# 2. Login รับ Token
POST /api/v1/auth/login
{ "username": "admin", "password": "password123" }

# 3. ใส่ Token ใน Header
Authorization: Bearer <access_token>

# 4. สร้างข้อมูลตามลำดับ
POST /api/v1/suppliers   → สร้าง Supplier
POST /api/v1/categories  → สร้างหมวดหมู่
POST /api/v1/products    → สร้างสินค้า

# 5. ทดสอบ Stock
POST /api/v1/stock-movements/in   → รับสินค้าเข้า
POST /api/v1/stock-movements/out  → เบิกสินค้าออก
GET  /api/v1/stock-movements/report → ดูรายงาน
```

---

## 👥 ทีมพัฒนา

| ชื่อ | บทบาท |
|---|---|
| สมาชิกที่ 1 | นายชินดนัย อยู่เชียร |
| สมาชิกที่ 2 | นายณัฐดนัย กองเสาร์ |
| สมาชิกที่ 3 | - |
| สมาชิกที่ 4 | - |
| สมาชิกที่ 5 | - |