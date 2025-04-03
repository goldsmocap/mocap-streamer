import * as dgram from "dgram";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { release } from "node:os";
import { join } from "node:path";
import * as development from "./development";
import {
  observableFromArbitraryUdp,
  observableFromUdp,
  observerToUdp,
} from "./rxUdp";
import { ConsumerState, IncomingDataState, ProducerState } from "./types";
import * as vicon from "./vicon";

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
const setProducerState = (
  value:
    | ((state: ProducerState | null) => ProducerState | null)
    | ProducerState
    | null
) => {
  producerState = typeof value === "function" ? value(producerState) : value;
};
let consumerState: ConsumerState | null = null;

let incomingDataState: IncomingDataState | null = null;

function connectProducer(
  type: ProducerState["type"],
  address: string,
  port: number
) {
  console.log(`Connecting to ${type} at ${address}:${port}`);
  switch (type) {
    case "AxisStudio": {
      const socket = dgram.createSocket("udp4");
      socket.bind(port, address);
      setProducerState({
        type,
        socket,
        subscription: observableFromUdp(socket).subscribe({
          next: (buffer) =>
            win.webContents.send("producerDataReceived", buffer),
        }),
      });
      break;
    }

    case "Vicon": {
      vicon.connect(`${address}:${port}`);
      const subscription = vicon
        .viconObserver((timeout) => {
          setProducerState((state) => ({
            ...(state ?? {}),
            type: "Vicon",
            timeout,
          }));
        })
        .subscribe({
          next: (buffer) =>
            win.webContents.send("producerDataReceived", buffer),
        });
      setProducerState({
        type: "Vicon",
        subscription,
        timeout: undefined,
      });
      break;
    }

    case "Optitrack": {
      const socket = dgram.createSocket("udp4");
      socket.bind(port, address, console.log);
      // socket.bind(port, () => {
      //   socket.setBroadcast(true);
      //   socket.setMulticastTTL(128);
      //   socket.addMembership(address);
      // });

      setProducerState({
        type,
        address,
        socket,
        subscription: observableFromUdp(socket).subscribe({
          next: (buffer) =>
            win.webContents.send("producerDataReceived", buffer),
        }),
      });
      break;
    }

    case "Development": {
      const subscription = development
        .developmentObserver((timeout) => {
          setProducerState((state) => ({
            ...(state ?? {}),
            type: "Development",
            timeout,
          }));
        })
        .subscribe({
          next: (buffer) =>
            win.webContents.send("producerDataReceived", buffer),
        });
      setProducerState({
        type: "Development",
        timeout: undefined,
        subscription,
      });
      break;
    }
  }
}

function disconnectProducer() {
  switch (producerState?.type) {
    case "AxisStudio": {
      producerState.socket.close();
      producerState.subscription.unsubscribe();
      break;
    }
    case "Vicon": {
      if (producerState.timeout != null) {
        clearInterval(producerState.timeout);
      }
      if (producerState.subscription != null) {
        producerState.subscription.unsubscribe();
      }
      vicon.disconnect();
      break;
    }
    case "Optitrack": {
      try {
        producerState.socket.dropMembership(producerState.address);
      } catch (err) {}
      producerState.socket.close();
      producerState.subscription.unsubscribe();
      break;
    }
    case "Development": {
      if (producerState.timeout != null) {
        clearInterval(producerState.timeout);
      }
      if (producerState.subscription != null) {
        producerState.subscription.unsubscribe();
      }
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
    "connectProducer",
    (_evt, type: ProducerState["type"], address: string, port: number) => {
      connectProducer(type, address, port);
    }
  );

  ipcMain.handle("disconnectProducer", disconnectProducer);

  ipcMain.handle("connectConsumer", (_evt, address: string, port: number) => {
    console.log(`Sending to at ${address}:${port}`);
    consumerState = {
      type: "Unity",
      observer: observerToUdp(address, port, dgram.createSocket("udp4")),
    };
  });

  ipcMain.handle("sendConsumer", (_evt, oscData: Uint8Array) => {
    if (consumerState != null) {
      consumerState.observer.next(Buffer.from(oscData));
    }
  });

  ipcMain.handle("disconnectConsumer", () => {
    consumerState?.observer.complete();
    consumerState = null;
  });

  ipcMain.handle("connectIncomingData", (_evt, port: number) => {
    const socket = dgram.createSocket("udp4");
    socket.bind(port, "localhost");
    incomingDataState = {
      socket,
      subscription: observableFromArbitraryUdp(socket).subscribe({
        next: (buffer) => win.webContents.send("incomingDataReceived", buffer),
      }),
    };
  });

  ipcMain.handle("disconnectIncomingData", () => {
    if (incomingDataState != null) {
      incomingDataState.socket.close();
      incomingDataState.subscription.unsubscribe();
    }
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
