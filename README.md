# Sobriety Counter App

A simple, motivational app to track sobriety time. This app shows days, hours, minutes, and seconds of sobriety and provides encouraging milestone messages.

## Features

- Real-time sobriety counter (days, hours, minutes, seconds)
- Motivational milestone messages
- Progress tracking toward 30-day goal
- Customizable friend's name via environment variables
- Reset functionality with photo evidence requirement

## Local Development

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your friend's name:

```
NUXT_PUBLIC_FRIEND_NAME=YourFriendsName
```

4. Start the development server:

```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Deployment to Vercel

### Option 1: Deploy from the Vercel Dashboard

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Add the environment variable:
   - Name: `NUXT_PUBLIC_FRIEND_NAME`
   - Value: Your friend's name
6. Click "Deploy"

### Option 2: Deploy using Vercel CLI

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy the app:

```bash
vercel
```

4. Follow the prompts and make sure to set the environment variable when asked

## Important Notes

- The sobriety date is stored on the server and shared across all users
- When someone resets the counter with photo evidence, it updates for everyone
- The app uses server-side storage, so the date persists between user sessions