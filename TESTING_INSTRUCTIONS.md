# Testing Instructions for "Start SOI" Issue

## Step 1: Check Browser Console

1. Open the app at http://localhost:3001/
2. Open browser DevTools (F12)
3. Go to Console tab
4. Clear the console (clear icon or Ctrl+L)

## Step 2: Click "Start SOI" Button

1. Find the "→ Start SOI" button in the "Active States" panel
2. Click it once
3. Watch the console output

## Step 3: Expected Console Output

You should see this sequence:

```
🎯 StatusPanel RENDER
  Current state: Undeployed
  Substates: ['Off']
  Full state value: { "Undeployed": "Off" }

📤 SENDING SIGNAL: Start SOI
📍 Current state before: { "Undeployed": "Off" }
✅ Signal sent, waiting for state update...

🔄 STATE MACHINE UPDATE: { "Undeployed": "Unconfigured" }
📊 Snapshot: [object]

🎯 StatusPanel RENDER
  Current state: Undeployed
  Substates: ['Unconfigured']
  Full state value: { "Undeployed": "Unconfigured" }
```

## Step 4: What to Report

Please copy and paste ALL console output from the moment you click the button.

Specifically note:
- Do you see the "🔄 STATE MACHINE UPDATE" message?
- Does the state value change from `{ "Undeployed": "Off" }` to `{ "Undeployed": "Unconfigured" }`?
- Does the "🎯 StatusPanel RENDER" happen after the state update?
- Are the substates updating correctly?

## Step 5: Visual Verification

After clicking, check:
- Do the "Active States" badges update?
- Does the drone image/position change?
- Does the "Available Transitions" section update?

## Known Issue

If the state machine updates but the UI doesn't change, it means:
- The subscription is working ✅
- The state machine is working ✅
- But React is not re-rendering ❌

This could be due to:
1. React state not updating properly
2. Components not re-rendering when state changes
3. Context not propagating updates

