# 🎵 TikTok Notifier — Complete Setup Guide

## What This Bot Does
- **Posts** → Sends a Discord embed with thumbnail + caption when someone posts a TikTok
- **Lives** → Sends an embed with profile pic + live link when someone goes live
- **Stories** → Sends an embed with preview when someone posts a story

---

## 📋 Commands (7 total)

| Command | What it does |
|---------|-------------|
| `/add` | Start tracking a TikTok account |
| `/remove` | Stop tracking an account |
| `/list` | See all tracked accounts |
| `/setchannel` | Change which channel gets notifications |
| `/toggle` | Turn on/off posts, lives, or stories per account |
| `/status` | Check if someone is live right now |
| `/test` | Send a test notification to make sure it works |

---

## 🤖 Step 1 — Create Your Discord Bot

1. Go to **https://discord.com/developers/applications**
2. Click **"New Application"** → Name it "TikTok Notifier" → Click **Create**
3. Click **"Bot"** on the left sidebar
4. Click **"Reset Token"** → Copy the token (save it — you only see it once!)
5. Scroll down to **"Privileged Gateway Intents"** and enable:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Click **Save Changes**

### Invite the Bot to Your Server
1. Click **"OAuth2"** → **"URL Generator"** on the left
2. Under **Scopes**, check: `bot` and `applications.commands`
3. Under **Bot Permissions**, check:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ View Channels
4. Copy the generated URL at the bottom → Open it in your browser → Select your server → **Authorize**

---

## 🖥️ Step 2 — Choose Your Hosting

### ✅ RECOMMENDED: Railway.app (~$5/month, easiest)

**Why Railway?**
- Runs 24/7 with no downtime
- Very easy to set up (5 minutes)
- Free $5 credit to start, then ~$5/month
- No need to know servers or Linux

**How to deploy on Railway:**

1. **Create account** at **https://railway.app** (sign in with GitHub is easiest)

2. **Upload your bot files to GitHub:**
   - Go to **https://github.com** → Sign up/in
   - Click "+" → "New repository" → Name it `tiktok-notifier` → Create
   - Upload all the bot files (drag & drop in the browser, or use GitHub Desktop)

3. **Deploy on Railway:**
   - Go to **https://railway.app/dashboard**
   - Click **"New Project"** → **"Deploy from GitHub repo"**
   - Select your `tiktok-notifier` repo
   - Railway will detect it's a Node.js app automatically

4. **Add your environment variable:**
   - In Railway, click your project → **"Variables"** tab
   - Click **"New Variable"**
   - Name: `DISCORD_TOKEN`
   - Value: (paste your bot token from Step 1)
   - Click **Add**

5. **Set the start command:**
   - Go to **Settings** tab
   - Under "Start Command" enter: `node src/index.js`
   - Click Save

6. **Done!** Railway will automatically start your bot. You'll see logs showing it connected.

---

### Alternative: Render.com (~$7/month)

1. Create account at **https://render.com**
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repo
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
5. Add environment variable: `DISCORD_TOKEN` = your token
6. Click **Create Web Service**

---

## 📁 Step 3 — Upload Your Bot Files

Your project folder should look like this:
```
tiktok-notifier/
├── src/
│   ├── index.js
│   ├── tracker.js
│   ├── scraper.js
│   ├── db.js
│   ├── embeds.js
│   └── commands/
│       ├── add.js
│       ├── remove.js
│       ├── list.js
│       ├── setchannel.js
│       ├── toggle.js
│       ├── status.js
│       └── test.js
├── data/           ← (empty folder, bot creates db.json here)
├── package.json
├── .env.example
└── .gitignore
```

---

## 🚀 Step 4 — Using the Bot

Once the bot is running, go to your Discord server and type:

```
/add username:charlidamelio channel:#tiktok-notifications
```

This tracks @charlidamelio and sends all notifications to #tiktok-notifications.

**Examples:**
```
/add username:charlidamelio channel:#tiktok posts:true lives:true stories:true
/remove username:charlidamelio
/list
/toggle username:charlidamelio type:Stories   ← turn off stories
/setchannel username:charlidamelio channel:#lives-only
/status username:charlidamelio
/test username:charlidamelio type:live
```

---

## 💡 Tips

- The bot checks each account **every 60 seconds**
- First time you add an account, it won't send old notifications — only new ones from that point on
- Use `/test` to make sure everything is working before waiting for real notifications
- Only users with **Manage Server** permission can use bot commands
- You can track up to **20 accounts**
- Each account can send to a different channel if you want

---

## 🔧 Troubleshooting

**Bot is offline:**
- Check Railway/Render logs for errors
- Make sure `DISCORD_TOKEN` is set correctly

**Commands not showing up:**
- Wait 1-2 minutes after the bot starts — Discord needs time to register slash commands
- Make sure the bot has `applications.commands` scope (re-invite if needed)

**Not getting notifications:**
- Use `/test` to verify the bot can send to the channel
- Make sure the bot has **Send Messages** and **Embed Links** permissions in that channel
- Check `/status` to see if tracking is enabled

**"Could not find TikTok account" error:**
- Double-check the exact username (no @, exact spelling)
- Some private accounts may not be accessible

---

## 💰 Budget Breakdown

| Service | Cost |
|---------|------|
| Railway.app | ~$5/month |
| Discord Bot | Free |
| **Total** | **~$5/month** |

Well within your $50-100 budget! Railway charges based on usage and most small bots run under $5/month.
