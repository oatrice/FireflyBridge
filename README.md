[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=oatrice_FireflyBridge&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=oatrice_FireflyBridge)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=oatrice_FireflyBridge&metric=coverage)](https://sonarcloud.io/summary/new_code?id=oatrice_FireflyBridge)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=oatrice_FireflyBridge&metric=bugs)](https://sonarcloud.io/summary/new_code?id=oatrice_FireflyBridge)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=oatrice_FireflyBridge&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=oatrice_FireflyBridge)

# FireflyBridge

Monorepo สำหรับโปรเจ็ค FireflyBridge จัดการด้วย **pnpm workspaces**

## โครงสร้างโปรเจ็ค (Project Structure)

- **apps/frontend**: Web Application (Next.js)
- **apps/backend**: Backend Service (TypeScript)

## การเริ่มต้นใช้งาน (Getting Started)

1. **ติดตั้ง Dependencies**:
   ```bash
   pnpm install
   ```

2. **รันโปรเจ็ค (Development)**:
   - รัน Frontend: `pnpm dev:frontend`
   - รัน Backend: `pnpm dev:backend`

## การ Deploy (Deployment)

### Deploy to Vercel

1. **Push โค้ดขึ้น GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy ผ่าน Vercel Dashboard**:
   - ไปที่ [vercel.com](https://vercel.com)
   - เลือก "Import Project"
   - เชื่อมต่อ GitHub repository
   - Vercel จะ detect Next.js และ Elysia อัตโนมัติ
   - คลิก "Deploy"

3. **หรือใช้ Vercel CLI**:
   ```bash
   npm i -g vercel
   vercel
   ```

## API Endpoint

- `GET /api/hotlines` - รายการเบอร์โทรฉุกเฉิน
- `GET /api/external-links` - ลิงก์แพลตฟอร์มภายนอก
- `GET /api/shelters` - ข้อมูลศูนย์พักพิง

