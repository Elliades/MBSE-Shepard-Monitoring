# 🛡️ Pasture Sentinel - Drone Shepherd System

A responsive web application that displays a drone keeping sheep in a safe zone. The mission is driven by signals from another service via WebSocket.

## 🎯 Overview

This application implements the **SOI - Pasture Sentinel** system, which monitors and protects sheep from predators using an autonomous drone. The system follows a hierarchical state machine with the following main states:

- **Undeployed**: Off → Unconfigured → Configured → Ready for Mission
- **Deployed**: Going to Safe Area → Patrolling → Predator Detected
- **Crashed**: Terminal state

## ✨ Features

- 🎨 **Modern UI**: Beautiful, responsive interface with smooth animations
- 🤖 **State Machine**: XState-powered hierarchical state machine
- 📡 **WebSocket Support**: Real-time signal reception from external services
- 📊 **Live Status Display**: Current state, battery, connection status
- 📋 **Event Logging**: Comprehensive event and signal tracking
- 🔔 **Notifications**: Visual feedback for user actions and state changes
- 🎮 **Manual Control**: Testing interface for signal injection
- 🎞️ **Smooth Animations**: State-aware animations for drone, sheep, and predator
- **📈 Mission Statistics**: Real-time analytics and state tracking
- **⚡ Quick Actions**: Export logs, reset mission, save data
- **⌨️ Keyboard Shortcuts**: Hands-free operation with hotkeys
- **💾 Data Export**: Save logs and mission data as text or JSON

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎮 Usage

### Manual Control

Use the Control Panel on the left side to manually send signals and test the state machine:

1. **Start SOI** - Initialize the system
2. **Flight Plan** - Configure the mission
3. **Ready for Mission** - Prepare for deployment
4. **Start Mission** - Deploy the drone
5. **Start Patrolling** - Begin perimeter monitoring
6. **Predator Detected** - Trigger predator response
7. **Crash Detected** - Simulate system crash

### WebSocket Integration

1. Enter your WebSocket URL in the Control Panel (e.g., `ws://localhost:8080`)
2. Click **Connect**
3. Send signals from your server in JSON format:

```json
{
  "signal": "Start SOI"
}
```

Or:

```json
{
  "type": "Start Patrolling"
}
```

The system will automatically process incoming signals and update the state machine.

## 🏗️ Architecture

### State Machine

The application implements the state machine defined in `state_machine.md`:

- **Top-level states**: Undeployed, Deployed, Crashed
- **Composite states**: Multiple nested substates
- **Parallel regions**: Concurrent monitoring (Perimeter, Sheep, Predator)
- **Transitions**: Signal-driven state changes

### Technology Stack

- **React 18**: UI framework
- **XState 5**: State machine management
- **Vite**: Build tool and dev server
- **CSS3**: Styling with animations
- **WebSocket**: Real-time communication

### OMF plugin (simulation bridge)

The MagicDraw / Cameo plugin sources live in [`OMF_Private/`](OMF_Private/) as a Git submodule ([Open MBSE Framework](https://github.com/OMF-Open-MBSE-Framework/OMF)). After cloning this repository, run:

```bash
git submodule update --init --recursive
```

Simulation signal interception (`SimulationExecutionListener`, WebSocket publisher) is implemented in that tree, not in the React app. Launch MagicDraw from `OMF_Private` with Gradle `:omf-example-plugin:runPlugin` when a local MCSE/CST install is configured.

### Project Structure

```
mbse-sheppard/
├── OMF_Private/             # OMF plugin submodule (MagicDraw / CST)
├── src/
│   ├── components/          # React components
│   │   ├── Drone.jsx       # Drone visualization
│   │   ├── Sheep.jsx       # Sheep visualization
│   │   ├── Predator.jsx    # Predator visualization
│   │   ├── SafeZone.jsx    # Safe area boundary
│   │   ├── Field.jsx       # Main field container
│   │   ├── StatusPanel.jsx # System status display
│   │   ├── LogPanel.jsx    # Event log
│   │   ├── MissionDisplay.jsx # Mission objectives
│   │   ├── ControlPanel.jsx # Manual controls
│   │   └── NotificationSystem.jsx # Toast notifications
│   ├── contexts/            # React contexts
│   │   └── StateMachineContext.jsx # State machine provider
│   ├── hooks/               # Custom hooks
│   │   └── useWebSocket.js  # WebSocket hook
│   ├── stateMachine/        # State machine definitions
│   │   └── pastureSentinelMachine.js # XState machine config
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── svg/                     # SVG assets
│   ├── Drone-*.svg         # Drone images
│   ├── sheep.svg           # Sheep image
│   ├── bear.svg            # Predator image
│   └── ...
├── state_machine.md        # State machine specification
├── package.json
└── README.md
```

## 🎨 Visual Elements

### Drone States

- **Idle**: Blue drone (off/undeployed)
- **Patrolling**: Green drone with patrol animation
- **Tracking**: Shepherd drone with tracking animation
- **Crashed**: Falling animation

### Animations

- Drone hovering and patrolling movements
- Sheep idle grazing animation
- Sheep scattering when predator detected
- Predator approaching animation
- Safe zone pulsing boundary
- Smooth state transitions

## 🔧 Configuration

### WebSocket Server Format

Your WebSocket server should send messages in one of these formats:

```javascript
// Option 1
{ "signal": "Signal Name" }

// Option 2
{ "type": "Signal Name" }
```

### Available Signals

- `Start SOI`
- `FlightPlan`
- `FlightPlan Check Failed`
- `Ready for mission`
- `Start Sheep Guard Mission`
- `Start Patrolling`
- `Predator Detected inside tracking perimeter`
- `Predator Entering Safe Area`
- `Crashed Detected`

## 📱 Responsive Design

The application is fully responsive and adapts to different screen sizes:

- **Desktop**: Three-column layout with all panels visible
- **Tablet**: Adjusted panel sizes
- **Mobile**: Stacked layout with optimized spacing

## 🛠️ Development

### Key Files to Modify

- **State Machine**: `src/stateMachine/pastureSentinelMachine.js`
- **State Logic**: `src/contexts/StateMachineContext.jsx`
- **Visual Behavior**: `src/components/Field.jsx` and child components
- **Styling**: Component-specific CSS files

### Adding New Signals

1. Update the state machine in `pastureSentinelMachine.js`
2. Add the signal to the ControlPanel signals array
3. Handle state changes in component logic

### Customizing Animations

Modify the CSS files in `src/components/*.css` to adjust:
- Animation timings
- Movement paths
- Visual effects
- Transitions

## 📄 License

This project is part of the MBSE Shepherd system.

## 🤝 Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Troubleshooting

### WebSocket Connection Issues

- Ensure your WebSocket server is running
- Check the URL format (should start with `ws://` or `wss://`)
- Verify CORS settings on your server
- Check browser console for connection errors

### State Machine Not Responding

- Verify the signal format matches expected values
- Check the browser console for state machine logs
- Ensure the current state allows the transition
- Review the state machine definition in `state_machine.md`

## 📞 Support

For issues or questions, please check the state machine specification in `state_machine.md` and the code documentation.

