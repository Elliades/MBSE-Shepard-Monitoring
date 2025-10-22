/**
 * Simple WebSocket Test Server for Pasture Sentinel
 * 
 * Usage:
 *   node test-ws-server.js
 * 
 * Then connect from the app using: ws://localhost:8080
 */

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server started on ws://localhost:8080');
console.log('Waiting for client connections...\n');

// Predefined mission scenario
const missionScenario = [
  { signal: 'Start SOI', delay: 2000, description: 'Initialize system' },
  { signal: 'FlightPlan', delay: 3000, description: 'Send flight plan' },
  { signal: 'Ready for mission', delay: 2000, description: 'Mark as ready' },
  { signal: 'Start Sheep Guard Mission', delay: 2000, description: 'Deploy drone' },
  { signal: 'Start Patrolling', delay: 3000, description: 'Begin patrol' },
  { signal: 'Predator Detected inside tracking perimeter', delay: 5000, description: 'Predator alert!' },
  { signal: 'Predator Entering Safe Area', delay: 4000, description: 'Predator approaching' }
];

wss.on('connection', (ws) => {
  console.log('✓ Client connected');

  ws.on('message', (message) => {
    console.log('Received from client:', message.toString());
  });

  ws.on('close', () => {
    console.log('✗ Client disconnected\n');
  });

  // Send welcome message
  ws.send(JSON.stringify({ 
    type: 'info', 
    message: 'Connected to Pasture Sentinel Test Server' 
  }));

  // Option 1: Auto-run mission scenario
  // Uncomment to automatically send signals
  /*
  console.log('Starting automated mission scenario...\n');
  let step = 0;
  const runScenario = () => {
    if (step < missionScenario.length && ws.readyState === WebSocket.OPEN) {
      const { signal, delay, description } = missionScenario[step];
      setTimeout(() => {
        console.log(`Sending: ${signal} (${description})`);
        ws.send(JSON.stringify({ signal }));
        step++;
        runScenario();
      }, delay);
    }
  };
  runScenario();
  */

  // Option 2: Manual control via console
  console.log('Commands:');
  console.log('  1 - Start SOI');
  console.log('  2 - FlightPlan');
  console.log('  3 - Ready for mission');
  console.log('  4 - Start Sheep Guard Mission');
  console.log('  5 - Start Patrolling');
  console.log('  6 - Predator Detected');
  console.log('  7 - Predator Entering Safe Area');
  console.log('  8 - Crashed Detected');
  console.log('  auto - Run automated scenario');
  console.log('  q - Quit\n');
});

// Console input handler for manual testing
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const signals = {
  '1': 'Start SOI',
  '2': 'FlightPlan',
  '3': 'Ready for mission',
  '4': 'Start Sheep Guard Mission',
  '5': 'Start Patrolling',
  '6': 'Predator Detected inside tracking perimeter',
  '7': 'Predator Entering Safe Area',
  '8': 'Crashed Detected'
};

rl.on('line', (input) => {
  const command = input.trim().toLowerCase();

  if (command === 'q' || command === 'quit') {
    console.log('Shutting down server...');
    wss.close();
    process.exit(0);
  } else if (command === 'auto') {
    console.log('Starting automated mission scenario...\n');
    let step = 0;
    const runScenario = () => {
      if (step < missionScenario.length) {
        const { signal, delay, description } = missionScenario[step];
        setTimeout(() => {
          console.log(`→ ${signal} (${description})`);
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ signal }));
            }
          });
          step++;
          runScenario();
        }, delay);
      } else {
        console.log('\n✓ Scenario complete!\n');
      }
    };
    runScenario();
  } else if (signals[command]) {
    const signal = signals[command];
    console.log(`→ ${signal}`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ signal }));
      }
    });
  } else if (command) {
    console.log('Unknown command. Use 1-8, auto, or q');
  }
});

// Handle server errors
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  wss.close();
  process.exit(0);
});

