"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = __importDefault(require("electron"));
const path_1 = __importDefault(require("path"));
const app = electron_1.default.app;
const BrowserWindow = electron_1.default.BrowserWindow;
let win;
function createWindow() {
    win = new BrowserWindow({
        width: 1600,
        height: 800,
        icon: path_1.default.join(__dirname, "../assets/logo.png")
    });
    win.loadURL(path_1.default.join(__dirname, "../screens/home.html"));
    win.on('closed', () => {
        win = null;
    });
    win.removeMenu();
    win.setMenu(null);
    win.webContents.openDevTools();
}
app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (win == null) {
        createWindow();
    }
});
