# Food Lab

A full-stack food ordering app scaffold with React (client) and Node/Express (server).

## Structure

- `client/`: React frontend with Redux Toolkit and Tailwind skeleton
- `server/`: Express backend with routing, controllers, models, and middleware

## Quickstart

1. Open two terminals.
2. Client:
   - cd client
   - npm install
   - npm run dev
3. Server:
   - cd server
   - npm install
   - cp .env.example .env (set variables)
   - npm run dev

## Environment

Server `.env` example:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/foodlab
JWT_SECRET=supersecret
EMAIL_FROM=noreply@example.com
EMAIL_SMTP_HOST=localhost
EMAIL_SMTP_PORT=1025
EMAIL_SMTP_USER=
EMAIL_SMTP_PASS=
BKASH_BASE_URL=https://sandbox.bkash.com
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_APP_KEY=
BKASH_APP_SECRET=
```
