import { app, BrowserWindow, shell, ipcMain } from "electron";
import { release } from "node:os";
import { join } from "node:path";
import * as dgram from "dgram";
import { observableFromUdp, observerToUdp } from "./rxUdp";
import { ConsumerState, ProducerState } from "./types";
import { bvhToBuffer, oscToBvh } from "./conversion";
import * as vicon from "./vicon";

vicon.connect("localhost:801");
console.log(vicon.getData()?.flatMap((v) => v.segments));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, "..");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

// if (!app.requestSingleInstanceLock()) {
//   app.quit();
//   process.exit(0);
// }

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

let producerState: ProducerState | null = null;
let consumerState: ConsumerState | null = null;

function disconnectProducer() {
  switch (producerState?.type) {
    case "AxisStudio": {
      producerState.socket.close();
      producerState.subscription.unsubscribe();
      break;
    }
    case "Vicon": {
      producerState.socket.close();
      break;
    }
  }
  producerState = null;
}

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // win.webContents.on('will-navigate', (event, url) => { }) #344

  ipcMain.handle(
    "udpConnectProducer",
    (_evt, type: ProducerState["type"], address: string, port: number) => {
      console.log("connecting to", address, port);
      const socket = dgram.createSocket("udp4");
      socket.bind(port, address);
      producerState = {
        type,
        socket,
        subscription: observableFromUdp(socket).subscribe({
          next: (buffer) => win.webContents.send("udpDataReceived", buffer),
        }),
      };
    }
  );

  ipcMain.handle("udpDisconnectProducer", disconnectProducer);

  ipcMain.handle(
    "udpConnectConsumer",
    (_evt, address: string, port: number, useOsc: boolean) => {
      console.log("starting to send to", address, port, "with use osc", useOsc);
      consumerState = {
        type: "Unity",
        observer: observerToUdp(address, port, dgram.createSocket("udp4")),
        useOsc,
      };
    }
  );

  ipcMain.handle("udpSendConsumer", (_evt, oscData: Uint8Array) => {
    if (consumerState != null) {
      if (consumerState.useOsc) {
        consumerState.observer.next(Buffer.from(oscData));
      } else {
        const { addressPrefix, data } = oscToBvh(oscData);
        consumerState.observer.next(
          bvhToBuffer(
            (addressPrefix != null ? addressPrefix + ":" : "") + data.join("")
          )
        );
      }
    }
  });

  ipcMain.handle("udpDisconnectConsumer", () => {
    consumerState?.observer.complete();
    consumerState = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (producerState != null) {
    disconnectProducer();
  }
  if (process.platform !== "darwin") app.quit();
});

// app.on("second-instance", () => {
//   if (win) {
//     // Focus on the main window if the user tried to open another
//     if (win.isMinimized()) win.restore();
//     win.focus();
//   }
// });

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
