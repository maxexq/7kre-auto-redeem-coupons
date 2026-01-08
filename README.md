# Seven Knights Re:BIRTH Auto Coupon Redemption

🎁 Automatically redeem multiple coupon codes for Seven Knights Re:BIRTH game.

## Features

- **Automatic Redemption**: Redeem all stored coupon codes with a single click
- **Visual Progress**: Real-time progress bar and status updates during redemption
- **Status Tracking**: Clear status badges (Success, Already Used, Expired, Invalid)
- **MongoDB Storage**: Store and manage coupon codes in MongoDB
- **API Endpoints**: Easy-to-use APIs for adding/removing coupons

## Tech Stack

- **Frontend**: SvelteKit 5 with Svelte 5 runes
- **Database**: MongoDB
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/7kre-auto-redeem-coupons.git
cd 7kre-auto-redeem-coupons
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/7kre-coupons
MONGODB_DB=7kre-coupons
```

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:5173

### Seed Default Coupons

Click "เพิ่มรหัสคูปองเริ่มต้น" button or call the API:
```bash
curl -X POST http://localhost:5173/api/coupons/seed
```

## API Endpoints

### Get All Coupons
```
GET /api/coupons
```

### Add Single Coupon
```
POST /api/coupons
Content-Type: application/json

{
  "code": "NEWCOUPON2026",
  "description": "New Year Coupon"
}
```

### Add Multiple Coupons (Bulk)
```
POST /api/coupons/bulk
Content-Type: application/json

{
  "codes": ["COUPON1", "COUPON2", "COUPON3"]
}
```

### Remove Coupon
```
DELETE /api/coupons
Content-Type: application/json

{
  "code": "OLDCOUPON"
}
```

### Seed Default Coupons
```
POST /api/coupons/seed
```

### Redeem Coupon
```
POST /api/redeem
Content-Type: application/json

{
  "pid": "YOUR_PLAYER_ID",
  "couponCode": "COUPONCODE"
}
```

## Deployment to Vercel

1. Push your code to GitHub

2. Connect your repository to Vercel

3. Add environment variables in Vercel:
   - `MONGODB_URI`: Your MongoDB connection string
   - `MONGODB_DB`: Database name (default: `7kre-coupons`)

4. Deploy!

## Default Coupon Codes

The following codes are pre-loaded when you seed the database:

| Code | Status |
|------|--------|
| DANCINGPOOKI | Active |
| BRANZEBRANSEL | Active |
| GRACEOFCHAOS | Active |
| 7S7E7V7E7N7 | Active |
| SENAHAJASENA | Active |
| HAPPYNEWYEAR2026 | Active |
| CHAOSESSENCE | Active |
| 100MILLIONHEARTS | Active |
| 77EVENT77 | Active |
| KEYKEYKEY | Active |
| POOKIFIVEKINDS | Active |
| LETSGO7K | Active |
| GOLDENKINGPEPE | Active |
| DELLONSVSKRIS | Active |
| TARGETWISH | Active |
| HALFGOODHALFEVIL | Active |
| OBLIVION | Active |
| SENASTARCRYSTAL | Active |
| SENA77MEMORY | Active |
| SUNWUKONGNO1 | Active |

## How to Find Your UID

1. Open Seven Knights Re:BIRTH game
2. Go to Settings > Account
3. Copy your UID (Player ID)

## License

MIT License

## Disclaimer

This tool is for personal use only. Use at your own risk. Not affiliated with Netmarble.

# 7kre-auto-redeem-coupons
