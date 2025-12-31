const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// --- GPU CONFIGURATION STRATEGY ---
// We remove aggressive flags because they often cause Chromium to fallback to software rendering
// when it detects "unsafe" or "forced" configurations that conflict with the driver.

// Instead, we trust the default GPU process but disable specific throttling features.
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');

// Explicitly tell Chromium NOT to block the GPU
app.commandLine.appendSwitch('ignore-gpu-blocklist'); 
app.commandLine.appendSwitch('enable-gpu-rasterization'); 
app.commandLine.appendSwitch('enable-zero-copy');

// Do NOT use 'disable-gpu-driver-bug-workarounds' as it is often the culprit for software fallback on macOS
// Do NOT use 'enable-webgl' explicitly as it's on by default, and forcing it might sometimes conflict

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      backgroundThrottling: false,
      zoomFactor: 1.0,
      offscreen: false,
    },
  });

  // Optimize for performance
  win.webContents.setBackgroundThrottling(false);

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  console.log('GPU Feature Status:', app.getGPUFeatureStatus());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
