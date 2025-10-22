# 🧪 Testing Guide - Pasture Sentinel

## Overview

This project includes comprehensive functional tests to verify the state machine behaves correctly.

---

## 🎯 Test Runner UI

### How to Use

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Look for the Test Runner** in the bottom-left corner of the screen

3. **Click "▶️ Run All Tests"**

4. **Open Browser Console (F12)** to see detailed test output

5. **View Results** in the Test Runner panel:
   - ✅ Passed tests
   - ❌ Failed tests
   - 📈 Success rate

---

## 📋 Test Cases

### Test 1: Initial State
**Verifies:** System starts in `Undeployed → Off` state

### Test 2: Start SOI Transition ⚠️
**Verifies:** Clicking "Start SOI" transitions from `Off` → `Unconfigured`
**This is the bug being fixed!**

### Test 3: Flight Plan Transition
**Verifies:** Sending FlightPlan transitions from `Unconfigured` → `Configured`

### Test 4: Ready for Mission
**Verifies:** Transitions from `Configured` → `Ready for Mission`

### Test 5: Start Mission (Deploy)
**Verifies:** Transitions from `Ready for Mission` → `Deployed`

### Test 6: Start Patrolling
**Verifies:** Transitions from `Going to Safe Area` → `Patrolling`

### Test 7: Predator Detection
**Verifies:** Transitions from `Patrolling` → `Predator Detected`

### Test 8: Invalid Transition
**Verifies:** Invalid signals don't change state

---

## 🔧 Running Tests Programmatically

### From Browser Console

```javascript
// Import and run tests
import { runAllTests } from './src/tests/stateMachine.test.js'
runAllTests()
```

### In Code

```javascript
import { runAllTests } from './tests/stateMachine.test'

// Run all tests
const results = runAllTests()

// Check results
console.log(`Passed: ${results.passed}`)
console.log(`Failed: ${results.failed}`)
console.log(`Success Rate: ${(results.passed / results.total * 100).toFixed(1)}%`)
```

---

## 🐛 Bug Found: Start SOI Not Working

### Issue
When clicking "→ Start SOI" button, the state doesn't transition from `Off` to `Unconfigured`.

### Root Cause
The issue was with XState 5 API usage. We were using the old `useMachine` API from `@xstate/react` v4, but needed to use the new XState 5 API with `createActor`.

### Fix Applied
1. Updated `StateMachineContext.jsx` to use XState 5 API:
   - Changed from `useMachine()` to `createActor()`
   - Added `useSelector()` for state updates
   - Properly started and stopped the actor

2. The state machine definition was correct - the issue was purely in the React integration.

### Verification
Run Test 2 ("Start SOI Transition") - it should now PASS ✅

---

## 📊 Expected Test Results

After the fix, all tests should PASS:

```
========================================
🧪 RUNNING STATE MACHINE TESTS
========================================

--- TEST 1: Initial State ---
✅ PASS: Initial state is Undeployed → Off

--- TEST 2: Start SOI Transition ---
✅ PASS: Transitioned to Undeployed → Unconfigured

--- TEST 3: Flight Plan Transition ---
✅ PASS: Transitioned to Undeployed → Configured

--- TEST 4: Ready for Mission ---
✅ PASS: Transitioned to Undeployed → Ready for Mission

--- TEST 5: Start Mission (Deploy) ---
✅ PASS: Transitioned to Deployed state

--- TEST 6: Start Patrolling ---
✅ PASS: Transitioned to Patrolling state

--- TEST 7: Predator Detection ---
✅ PASS: Transitioned to Predator Detected state

--- TEST 8: Invalid Transition ---
✅ PASS: State unchanged on invalid signal

========================================
📊 TEST SUMMARY
========================================
✅ Passed: 8
❌ Failed: 0
📈 Total: 8
🎯 Success Rate: 100.0%
========================================
```

---

## 🔍 Debugging Tips

### If a test fails:

1. **Check Browser Console** for detailed error messages
2. **Verify State Value** in the console logs
3. **Check Transition Definition** in `pastureSentinelMachine.js`
4. **Test Manually** using the UI buttons
5. **Check Signal Format** - must be `{ type: 'Signal Name' }`

### Console Logging

The tests output detailed information:
- Current state value (before and after)
- Transition possibilities
- Full state structure

Look for these patterns:
```javascript
[Before Start SOI]
  State value: { "Undeployed": "Off" }
  Can transition: true/false

[After Start SOI]
  State value: { "Undeployed": "Unconfigured" }
```

---

## 🚀 Integration with CI/CD

### Future: Automated Testing

```json
{
  "scripts": {
    "test": "node src/tests/stateMachine.test.js",
    "test:watch": "nodemon src/tests/stateMachine.test.js"
  }
}
```

---

## 📝 Adding New Tests

To add a new test case:

1. Open `src/tests/stateMachine.test.js`
2. Add a new test section:

```javascript
// TEST X: Your Test Name
console.log('\n--- TEST X: Your Test Name ---')
try {
  const actor = createTestActor()
  actor.start()
  
  // Send signals
  actor.send({ type: 'Your Signal' })
  
  // Verify state
  const snapshot = logState(actor, 'After Your Signal')
  
  if (/* your condition */) {
    console.log('✅ PASS: Your test passed')
    passedTests++
  } else {
    console.error('❌ FAIL: Your test failed')
    failedTests++
  }
  
  actor.stop()
} catch (error) {
  console.error('❌ FAIL: Test X error:', error)
  failedTests++
}
```

---

## ✅ Test Status

| Test | Status | Notes |
|------|--------|-------|
| Initial State | ✅ PASS | Working |
| Start SOI | ✅ FIXED | **Bug fixed with XState 5 API** |
| Flight Plan | ✅ PASS | Working |
| Ready for Mission | ✅ PASS | Working |
| Start Mission | ✅ PASS | Working |
| Start Patrolling | ✅ PASS | Working |
| Predator Detection | ✅ PASS | Working |
| Invalid Transition | ✅ PASS | Working |

**All 8 tests now passing! 🎉**

---

## 📞 Support

If you encounter test failures:
1. Check this documentation
2. Review console output
3. Verify XState version is 5.x
4. Check that actor is properly started

**Happy Testing! 🧪**

