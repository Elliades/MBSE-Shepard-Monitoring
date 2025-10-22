# 🚀 Quick Start Guide

Get the Pasture Sentinel up and running in minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the Application

```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

## Step 3: Test the System

### Option A: Manual Control (Easiest)

1. Look at the **Control Panel** on the left side
2. Click the buttons in sequence to test the state machine:
   - Click **"Start SOI"** → System initializes
   - Click **"Flight Plan"** → Configuration loaded
   - Click **"Ready for Mission"** → System ready
   - Click **"Start Mission"** → Drone deploys!
   - Click **"Start Patrolling"** → Drone begins patrol
   - Click **"Predator Detected"** → Watch the predator appear!

### Option B: WebSocket Control (Advanced)

1. **Start the test WebSocket server:**

```bash
# In a new terminal window
cd path/to/project
npm install --prefix . ws
node test-ws-server.js
```

2. **Connect from the app:**
   - In the Control Panel, enter: `ws://localhost:8080`
   - Click **Connect**
   - Wait for the green "Connected" indicator

3. **Send signals:**
   - In the terminal running the WebSocket server, type:
     - `1` for Start SOI
     - `2` for Flight Plan
     - `3` for Ready for mission
     - `4` for Start Mission
     - `5` for Start Patrolling
     - `6` for Predator Detected
     - `auto` for automated scenario
     - `q` to quit

## What to Watch For

✨ **Visual Changes:**
- 🚁 **Drone appears** when mission starts
- 🟢 **Drone turns green** when patrolling
- 🐻 **Predator appears** when detected
- 🐑 **Sheep scatter** when predator approaches
- 📊 **Status updates** in real-time
- 📋 **Event log** shows all activities
- 🔔 **Notifications** appear for signals
- 📈 **Statistics update** as mission progresses
- ⌨️ **Keyboard button** in bottom-right corner

## ⌨️ Keyboard Shortcuts

Press `?` or click the ⌨️ button to see all shortcuts!

**Quick Reference:**
- `1-6` - Send signals (context-aware)
- `r` - Reset mission
- `?` - Show keyboard help

## Troubleshooting

### "Cannot find module 'ws'"
Run: `npm install --prefix . ws`

### WebSocket won't connect
- Make sure the test server is running
- Check you're using `ws://` (not `wss://`)
- Verify port 8080 is not in use

### Application won't start
- Delete `node_modules` and run `npm install` again
- Make sure you're using Node.js v16 or higher

## Next Steps

📖 Read the full [README.md](README.md) for:
- Detailed architecture information
- State machine specification
- Customization guide
- Production build instructions

🎮 Explore the features:
- Try different state transitions
- Watch the animations
- Monitor the event log
- Test error scenarios

🔧 Build your own WebSocket server:
- See `test-ws-server.js` for an example
- Send JSON messages: `{ "signal": "Signal Name" }`
- Connect from any WebSocket client

## Demo Scenario

Run this complete mission sequence:

1. Start SOI → Initialize
2. FlightPlan → Configure
3. Ready for mission → Prepare
4. Start Sheep Guard Mission → Deploy
5. Start Patrolling → Begin monitoring
6. Predator Detected → Alert!
7. Watch the drone track the predator
8. See the sheep react

Enjoy your Pasture Sentinel! 🛡️🐑

