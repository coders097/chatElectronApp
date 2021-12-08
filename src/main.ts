import electron from 'electron';
import path from 'path';
const app=electron.app;
const BrowserWindow=electron.BrowserWindow;

let win:electron.BrowserWindow | null;

function createWindow(){
    win=new BrowserWindow({
        width:1600,
        height:800,
        icon:path.join(__dirname,"../assets/logo.png")
    });
    win.loadURL(path.join(__dirname,"../screens/home.html"));
    win.on('closed',()=>{
        win=null;
    });
    win.removeMenu()
    win.setMenu(null);
    win.webContents.openDevTools();
}

app.on('ready',createWindow);

app.on('window-all-closed',()=>{
    if(process.platform!=='darwin'){
        app.quit();
    }
});

app.on('activate',()=>{
    if(win==null){
        createWindow();
    }
});