# Auto Notify

A simple Electron app that reminds you to stretch every 5 minutes.

## Features

- Simple, clean interface with a single toggle button
- System notifications every 5 minutes when enabled
- Works on Windows, macOS, and Linux
- Notifications only appear while the app is running

## Development Setup

1. Make sure you have Node.js installed on your system
2. Clone this repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Building Installable App

To create an installable app for your platform:

```bash
npm run dist
```

The installable app will be created in the `release` directory:

- Windows: `.exe` installer
- macOS: `.dmg` file
- Linux: `.AppImage` file

## Usage

1. Install the app using the installer from the `release` directory
2. Launch the app from your system's applications menu
3. Click the button to toggle notifications on/off
4. When enabled, you'll receive a notification every 5 minutes
5. The button will be green when notifications are enabled and red when disabled
6. Close the app window to stop all notifications
