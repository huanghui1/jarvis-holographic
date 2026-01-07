const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
// const isDev = require('electron-is-dev'); // Deprecated: using app.isPackaged is more reliable

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

  // Use app.isPackaged for reliable production detection
  if (!app.isPackaged) {
    win.loadURL('http://localhost:3000');
    // win.webContents.openDevTools();
    console.log("Running in Development Mode");
  } else {
    // In production, use app.getAppPath() to ensure we are looking at the right place (inside ASAR)
    // Structure: app.asar/dist/index.html
    // app.getAppPath() returns the path to app.asar
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    
    console.log("Attempting to load:", indexPath);
    
    // Check if file exists (DEBUGGING)
    try {
        if (!fs.existsSync(indexPath)) {
            const errorMsg = `CRITICAL: Index file not found at ${indexPath}\n\nApp Path: ${app.getAppPath()}\n__dirname: ${__dirname}`;
            console.error(errorMsg);
            dialog.showErrorBox('Startup Error', errorMsg);
        }
    } catch (err) {
        console.error("Error checking file existence:", err);
    }

    win.loadFile(indexPath).then(() => {
        console.log("Page loaded successfully");
    }).catch(e => {
        const loadErr = `Failed to load index.html: ${e.message} (${e.code})`;
        console.error(loadErr);
        dialog.showErrorBox('Load Error', loadErr);
    });
    
    // Temporarily open DevTools in production to debug the blank screen
    // win.webContents.openDevTools(); 
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
