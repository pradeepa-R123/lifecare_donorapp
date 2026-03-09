# LifePulse Donor Network

A production-level MERN Stack donor application that integrates in real-time with LifeCare BloodBank.

## Architecture

```
LifePulse Donor App (:5300) ←→ LifeCare BloodBank Backend (:5002)
                     ↕
               MongoDB (donor data)
```

### Flow
```
Hospital → BloodBank (:5002) → POST /api/requests/incoming (Donor App :5300)
         → Socket.IO → Donor sees request
         → Accept → PATCH /api/blood-requests/:id/donor-response (BloodBank :5002)
         → BloodBank updates inventory → Hospital notified
```

## API Integration with BloodBank

### Donor App exposes (for BloodBank to call):
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/requests/incoming` | BloodBank pushes request to donor |
| POST | `/api/requests/donation-completed` | BloodBank confirms donation done |

### Donor App calls BloodBank:
| Method | BloodBank Endpoint | Description |
|--------|---------------------|-------------|
| POST | `/api/donors/sync-from-donor-app` | Sync new donor on register |
| PATCH | `/api/donors/sync-availability` | Sync donor availability |
| PATCH | `/api/blood-requests/:id/donor-response` | Send accept/decline back |

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and BloodBank URL
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Donor app runs at: `http://localhost:5300`

## Environment Variables

```env
PORT=5300
MONGO_URI=mongodb://localhost:27017/lifepulse_donor
JWT_SECRET=your_secret_key_here
BLOODBANK_BACKEND_URL=http://localhost:5002
```

## Features

- ✅ JWT Authentication + bcrypt password hashing
- ✅ 2-Step registration with medical eligibility check
- ✅ Real-time blood request notifications via Socket.IO
- ✅ Accept / Decline flow with BloodBank notification
- ✅ Availability toggle synced with BloodBank
- ✅ Donation history tracking
- ✅ Auto-sync donor to BloodBank on registration
- ✅ No ports, tokens, or backend details shown in UI

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens stored only in localStorage (not shown in UI)
- Protected routes — dashboard requires authentication
- Medical ineligibility enforced on both client and server
