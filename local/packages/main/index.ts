import { app, BrowserWindow, shell, ipcMain } from "electron";
import fetch from "electron-fetch";
import { release } from "os";
import { join } from "path";

///////////////////////////////////////////////////////////////////////////////////////////////////
// Electron setup

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let win: BrowserWindow | null = null;

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`;

    win.loadURL(url);
    win.webContents.openDevTools();
  }

  // Test active push message to Renderer-process
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////
// Join Remote Server

import { match, P } from "ts-pattern";
import type { ClientRole } from "../../../shared/dist/clients";
import { serialize, joinRemoteMsg } from "../../../shared/messages";
import { getRemoteWs, newRemoteWs, remoteBaseUrl } from "./remoteWs";

ipcMain.on("connect_remote", (_, remoteUrl: string) => {
  newRemoteWs(remoteUrl, win).then((errOrWs) =>
    match(errOrWs)
      .with({ _tag: "Right", right: P.any }, () => win?.webContents.send("connect_remote_success"))
      .with({ _tag: "Left", left: { _tag: "WebSocketAlreadyConnected" } }, () =>
        console.log("⚡ cannot connect because WS is already connected.")
      )
      .with({ _tag: "Left", left: { _tag: "WebSocketConnecting" } }, () =>
        console.log("⚡ cannot connect because WS already exists and is still connecting.")
      )
      .with({ _tag: "Left", left: { _tag: "WebSocketClosed" } }, () =>
        console.log("⚡ cannot connect because WS immediately closed.")
      )
      .run()
  );
});

ipcMain.on("connect_and_join_remote", (_, remoteUrl: string, name: string, role: ClientRole) => {
  newRemoteWs(remoteUrl, win).then((errOrWs) =>
    match(errOrWs)
      .with({ _tag: "Right", right: P.select() }, (ws) =>
        ws.send(serialize(joinRemoteMsg(name, role)))
      )
      .with({ _tag: "Left", left: { _tag: "WebSocketAlreadyConnected" } }, () =>
        console.log("⚡ cannot connect because WS is already connected.")
      )
      .with({ _tag: "Left", left: { _tag: "WebSocketConnecting" } }, () =>
        console.log("⚡ cannot connect because WS already exists and is still connecting.")
      )
      .with({ _tag: "Left", left: { _tag: "WebSocketClosed" } }, () =>
        console.log("⚡ cannot connect because WS immediately closed.")
      )
      .run()
  );
});

ipcMain.on("join_remote", (_, name: string, role: ClientRole) => {
  getRemoteWs().then((errOrWs) =>
    match(errOrWs)
      .with({ _tag: "Right", right: P.select() }, (ws) =>
        ws.send(serialize(joinRemoteMsg(name, role)))
      )
      .with({ _tag: "Left", left: { _tag: "WebSocketClosed" } }, () =>
        console.log(`⚡ cannot get WS because it is closed.`)
      )
      .with({ _tag: "Left", left: { _tag: "WebSocketConnecting" } }, () =>
        console.log(`⚡ cannot get WS because it is still connecting.`)
      )
      .run()
  );
});

ipcMain.on("change_role", (_, name: string, newRole: ClientRole) => {
  fetch(`http://${remoteBaseUrl}/api/change-role/${name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newRole }),
  });
});

ipcMain.on("rename", (_, oldName: string, newName: string) => {
  fetch(`http://${remoteBaseUrl}/api/rename/${oldName}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newName }),
  });
});

ipcMain.on("map", (_, fromName: string, toName: string) => {
  fetch(`http://${remoteBaseUrl}/api/map`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fromName, toName }),
  });
});

ipcMain.on("unmap", (_, fromName: string, toName: string) => {
  fetch(`http://${remoteBaseUrl}/api/unmap`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fromName, toName }),
  })
    .then((res) => console.log(res))
    .catch((err) => console.error(err));
});

ipcMain.on("leave_remote", (_, name: string) => {
  fetch(`http://${remoteBaseUrl}/api/leave/${name}`)
    .then(() => console.log(`💃 local server left remote server.`))
    .catch((err) => console.error(err));
});

ipcMain.on("close_remote", (_) => {
  getRemoteWs().then((errOrWs) =>
    match(errOrWs)
      .with({ _tag: "Right", right: P.select() }, (ws) => ws.close())
      .with({ _tag: "Left", left: { _tag: "WebSocketClosed" } }, () =>
        console.log(`⚡ cannot close WS because it is already closed.`)
      )
      .with({ _tag: "Left", left: { _tag: "WebSocketConnecting" } }, () =>
        console.log(`⚡ cannot close WS because it is still connecting.`)
      )
      .run()
  );
});
