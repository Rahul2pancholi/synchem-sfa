# Authentication & Security

## Login Screen

**URL:** `https://synchem.salestrip.in/#/app/login`

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| User Name | Employee username | `admin` |
| Password | Account password | _(provided separately)_ |
| Company Code | Tenant identifier | `SYN` |

### User Types

The login form supports two modes (toggle):

| Type | Value | Description |
|------|-------|-------------|
| User | `USER` | Web/back-office users |
| Employee | `EMPLOYEE` | Field staff mobile users |

Default company code in form: **`SYN`**

## Token Endpoint

```
POST https://synchem.salestrip.in/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&username={userName},{compCode}&password={password}
```

### Successful Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | JWT string | Bearer token for API calls |
| `refresh_token` | string | Token refresh |
| `expires_in` | int | Seconds (43199 ≈ 12 hours) |
| `expiredAt` | datetime | Token expiry timestamp |
| `empId` | int | Employee ID |
| `roleType` | string | `AD`, `MAN`, or `FS` |
| `menuList` | JSON string | Role-based menu permissions |
| `employeeObj` | JSON string | Full employee profile |
| `configurationSetting` | JSON string | System config flags |
| `compName` | string | Company display name |
| `compCode` | string | Company code |
| `isFirstLogin` | string | Force password change flag |
| `isMpin` | bool | Mobile PIN enabled |
| `isCheckIn` | bool | Check-in feature enabled |

### JWT Payload (Decoded)

```json
{
  "sub": "admin",
  "empId": "2",
  "fullName": "Admin User (admin)",
  "compCode": "SYN",
  "industryType": "SYN",
  "roleType": "AD",
  "companyName": "Synchem Pharmaceuticals Pvt. Ltd."
}
```

## Post-Login Redirect

| roleType | Redirect Route |
|----------|----------------|
| `FS` | `#/app/fieldStaff/dashboard` |
| `MAN` | `#/app/manager/dashboard` |
| `AD` | `#/app/management/dashboard` |

## Session Storage (localStorage)

| Key | Content |
|-----|---------|
| `authorizationData` | token, userName, compCode, roleType, empId, refreshToken, expiresAt |
| `menusData` | Full menu tree with permissions |
| `plainMenus` | Flattened menu list for search |
| `employeeData` | Employee profile object |
| `configurationSettingData` | System settings |
| `LoginASDifferentUser` | Admin impersonation state |

## Login As Different User (Admin Feature)

Admins can impersonate any employee:

1. Admin selects employee from grid
2. `authService.loginAsDifferentUser()` called
3. New token issued for target employee
4. Parent admin info stored in `LoginASDifferentUser`
5. "Back to Admin Login" restores original session

## Forgot Password Flow

**Route:** `#/app/forgotPassword/{userType}`

| Step | API |
|------|-----|
| 1. Enter username + company code | `api/users/forgotPassword` or `api/employee-module/forgotPassword` |
| 2. Generate OTP | `api/users/generateOTP` |
| 3. Verify OTP | `api/users/verifyOTP` |
| 4. Change password | `api/users/changePasswordByOTP` |

Password rules: 8–15 chars, must include number and special character (`!@#$%^&*`).

## API Authorization

All `api/*` calls require:

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Error Handling

| Code | Client Behavior |
|------|-----------------|
| 401 | Redirect to `#/app/login` |
| 417 | Show `errorObj.errorMessage` via toastr |

## Role Types

| Code | Name | Hierarchy Type |
|------|------|----------------|
| `AD` | Admin | MGT (Management) |
| `MAN` | Manager | Varies by level |
| `FS` | Field Staff | MR level |

## Mobile Security Features

| Feature | Description |
|---------|-------------|
| **MPIN** | Mobile PIN for quick login (`isMpin: true`) |
| **Fingerprint** | Biometric auth support |
| **Geo-fencing** | `IsGeoFencingApplicable` per employee |
| **Check-in** | GPS check-in on field (`IsCheckIn`) |
| **Device ID** | `LastLoginDeviceId` tracked |
| **Push Token** | Firebase token for notifications |

## Clone Security Checklist

- [ ] Implement OAuth2 password grant or modern alternative (OIDC)
- [ ] JWT with `compCode`, `empId`, `roleType` claims
- [ ] Refresh token rotation
- [ ] Role-based menu API (return only permitted menus)
- [ ] Password policy enforcement
- [ ] OTP flow for forgot password
- [ ] Rate limiting on `/token`
- [ ] HTTPS only
- [ ] Never store plaintext passwords
- [ ] Audit log for login history (`employee/login-report`)
- [ ] Admin impersonation with audit trail

## Security Warning

Credentials shared for analysis should be **rotated** before production clone deployment. Do not commit credentials to this repository.
