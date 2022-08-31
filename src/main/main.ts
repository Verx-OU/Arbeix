/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import "core-js/actual/structured-clone";

import path from "path";
import { app, BrowserWindow, shell, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import MenuBuilder from "./menu";
import { resolveHtmlPath } from "./util";
import { mkdirSync, promises } from "fs";
import { parse } from "papaparse";
import { DatasetProduct, ProductTree } from "common/products";
const spawn = require("child_process").spawn;

const appName = "Arbeix";
app.setName(appName);
const appData = app.getPath("appData");
mkdirSync(path.join(appData, appName), { recursive: true });
app.setPath("userData", path.join(appData, appName));

class AppUpdater {
  constructor() {
    log.transports.file.level = "info";
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

function makeEmptyProductTree(): ProductTree {
  return { categories: {}, items: [] };
}

function dig(data: ProductTree, path: string[]): ProductTree {
  let ref = data;
  for (const i of path.filter((i) => i !== "")) {
    let newRef = ref.categories[i];
    if (newRef === undefined) {
      newRef = makeEmptyProductTree();
      ref.categories[i] = newRef;
    }
    ref = newRef;
  }
  return ref;
}

ipcMain.handle("read-user-data", async (_event, fileName) => {
  const path = app.getPath("userData");
  const buf = await promises.readFile(`${path}/${fileName}`, { encoding: "utf-8", flag: "a+" });
  const data: ProductTree = makeEmptyProductTree();

  return new Promise((resolve, reject) => {
    parse<DatasetProduct>(buf.trim(), {
      header: true,
      dynamicTyping: { id: true },
      worker: true,
      step(results) {
        if (results.errors.length > 0) {
          reject(results.errors);
        }
        const result = results.data;
        dig(data, result.category.trim().split("/")).items.push(results.data);
      },
      complete() {
        setTimeout(() => resolve(data), 1000);
      },
    });
  });
});

ipcMain.handle("platform", async () => {
  return process.platform;
});

ipcMain.handle("proc", async (_event, fileName, template, content) => {
  console.log(fileName);
  console.log(template);

  console.log(content);
  const tempPath = app.getPath("temp");
  const fullPath = `${tempPath}/arbeix-${Date.now()}`;
  await promises.writeFile(fullPath, content, { encoding: "utf-8", flag: "w" });
  console.log(fullPath);

  const bat = spawn(fileName, [template, fullPath]);

  bat.stdout.on("data", (data: unknown) => {
    mainWindow?.webContents.send("cross-log", `[STDOUT] ${data}`);
  });

  bat.stderr.on("data", (err: unknown) => {
    mainWindow?.webContents.send("cross-log", `[STDERR] ${err}`);
  });

  bat.on("exit", (code: unknown) => {
    mainWindow?.webContents.send("cross-log", `[EXIT] ${code}`);
  });
});

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

const isDebug = process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true";

if (isDebug) {
  require("electron-debug")();
}

const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS"];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(__dirname, "../../assets");

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath("icon.png"),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, "preload.js")
        : path.join(__dirname, "../../dll/preload.js"),
    },
  });

  mainWindow.loadURL(resolveHtmlPath("index.html"));

  mainWindow.on("ready-to-show", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: "deny" };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on("activate", () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
