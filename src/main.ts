import electron from 'electron';
import path from 'path';
const app=electron.app;
const BrowserWindow=electron.BrowserWindow;
const ipcMain = require('electron').ipcMain;
const dialog = electron.dialog;
let onAppStartFlag=false;

// ----
import * as remoteMain from '@electron/remote/main';
remoteMain.initialize();


let authWin:electron.BrowserWindow | null;
let homeWin:electron.BrowserWindow | null;



// ************** Data in App

interface User{
    loggedIn: boolean;
    _id: string;
    name: string;
    email: string;
    pic: string;
    token: string;
}

interface Message{
    sender:{
        _id:string
        name:string,
        pic:string
    },
    _id:string
    timeStamp:string,
    message:string
    attachments:string[]
};

interface ChatData{
    [key : string]:Message[]
};

let userData:User={
    loggedIn:false,
    _id: "",
    name: "",
    email: "",
    pic: "",
    token: "",
};

let chatData:ChatData={};

let groupDetails:{
    [key:string]:{
        name:string,
        pic:string,
        _id:string
    }
}={};
let conversationDetails:{
    [key:string]:{ // key is conversation id
        userId:string,
        userName:string,
        userPic:string
    }
}={};

let setUserData=(action:string,payload:User)=>{
    switch(action){
        case "LOADUSERDATA":
            userData={
                ...payload,
                loggedIn:true
            };
            // window.localStorage.setItem("--user-details",JSON.stringify(userData));
            break;

        case "LOGOUT":
            userData={
                _id:"",
                email:"",
                loggedIn:false,
                name:"",
                pic:"",
                token:""
            };
            break;

        case "LOADUSERDATAFROMCACHE":
            // let _userData:any=window.localStorage.getItem("--user-details");
            // if(_userData){
            //     _userData=JSON.parse(_userData);
            //     userData=_userData as User;
            // }
            break;
        
        case "REFRESHTOKEN":
            userData={
                ...userData,
                token:payload.token
            };
            // window.localStorage.setItem("--user-details",JSON.stringify(userData));
            break;

        case "EDITPROFILE":
            userData={
                ...payload
            };
            // window.localStorage.setItem("--user-details",JSON.stringify(userData));
            break;

        default:
            console.log("NOTHING");
    }
}

let createHomeWindow=()=>{
    authWin?.close();
    homeWin=new BrowserWindow({
        width:1600,
        height:800,
        icon:path.join(__dirname,"../assets/logo.png"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    require("@electron/remote/main").enable(homeWin.webContents);

    homeWin.maximize();
    homeWin.loadURL(path.join(__dirname,"../screens/home.html"));
    homeWin.on('closed',()=>{
        homeWin=null;
    });
    homeWin.removeMenu();
    homeWin.setMenu(null);
    homeWin.webContents.openDevTools();
}

let createAuthWindow=()=>{
    homeWin?.close();
    if(!onAppStartFlag){
        // setUserData("LOADUSERDATAFROMCACHE",userData);
        onAppStartFlag=true;
    }
        authWin=new BrowserWindow({
            width:1600,
            height:800,
            icon:path.join(__dirname,"../assets/logo.png"),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        authWin.loadURL(path.join(__dirname,"../screens/auth.html"));
        authWin.on('closed',()=>{
            authWin=null;
        });
        authWin.removeMenu();
        authWin.setMenu(null);
        authWin.webContents.openDevTools();
}

let logout=()=>{
    setUserData("LOGOUT",userData);
    createAuthWindow();
}



let checkValidity=()=>{
    if(userData.loggedIn){
        fetch("http://localhost:3001/auth/checkValidity",{
            method:"POST",
            headers:{
                'Authorization':`Bearer ${userData.token}`
            }
        }).then(res=>res.json())
        .then(data=>{
            if(data.success){
                createHomeWindow();
            }
        }).catch(err=>alert(err));
    }
}

let setChatData=(action:string,payload:any)=>{
    switch(action){

        case "LOADGROUP":
            // chatData[payload.groupId]=payload.messages;
            break;

        case "LOADCONVERSATION":
            // chatData[payload.conversationId]=payload.messages;
            break;
        
        case "ADDGROUPCONVERSATION":

            break;

        case "ADDMESSAGE":

            break;

        default:
            console.log("NOTHING!");

    }
}

//***************************** */

// LISTEN TO EVENTS******

ipcMain.on('signInAuth',(e,args)=>{
    setUserData("LOADUSERDATA",args);
    createHomeWindow();
});

ipcMain.on('userDataContext',(e)=>{
    e.returnValue=userData;
});

ipcMain.on('update-userData',(e,args)=>{
    setUserData("EDITPROFILE",args);
    // new-user-data
    homeWin?.webContents.send('new-user-data',args);
});

ipcMain.on('delete-user',()=>{
    setUserData("LOGOUT",{} as User);
    createAuthWindow();
});

ipcMain.on("logOutUser",()=>{
    setUserData("LOGOUT",{} as User);
    createAuthWindow();
});


// *******************

app.on('ready',createAuthWindow);

app.on('window-all-closed',()=>{
    if(process.platform!=='darwin'){
        app.quit();
    }
});

app.on('activate',()=>{
    if(authWin==null){
        createAuthWindow();
    }
});