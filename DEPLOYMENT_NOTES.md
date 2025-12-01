# 🚀 Deployment Notes & Checklist

## 🚧 Feature Flags
- **Auth System**: Currently disabled by default.
  - To enable, set `NEXT_PUBLIC_ENABLE_AUTH=true` in Vercel Environment Variables.
  - **Status**: 🔴 Disabled (Coming Soon page shown)

## 🔑 Authentication Providers
### LINE Login
- **Current Status**: Tested on Localhost only.
- **Action Required**: 
  - Update Callback URL in [LINE Developers Console](https://developers.line.biz/).
  - Add Production URL: `https://firefly-bridge.vercel.app/api/auth/callback/line`
  - Add Staging/Preview URLs if needed.

### Phone Number (SMS)
- **Current Status**: 🟡 Mocked (OTP printed in server console).
- **Action Required**:
  - Integrate real SMS Gateway (Twilio, AWS SNS, or ThaiBulkSMS).
  - Update `sendOTP` function in `apps/frontend/lib/auth.ts`.

## 🗄️ Database
- **Schema Changes**: 
  - Added `phoneNumber` and `phoneNumberVerified` to `user` table.
  - Made `name` and `email` nullable.
  - **Action**: Ensure `npm run db:push` or migration is run on production database.

## 📝 Environment Variables
Ensure these are set in Production/Staging:
```env
NEXT_PUBLIC_ENABLE_AUTH=true
BETTER_AUTH_URL=https://firefly-bridge.vercel.app
NEXT_PUBLIC_APP_URL=https://firefly-bridge.vercel.app
```
