let homeConversationsViewInit:any=null;
let homeGroupsViewInit:any=null;

interface User{
    loggedIn: boolean;
    _id: string;
    name: string;
    email: string;
    pic: string;
    token: string;
}

{
    let userData:User;
    let conversationMode=true;
    let electron=require('electron');
    const prompt = require('electron-prompt');
    const ipc = electron.ipcRenderer;





    let conversationsInit=()=>{

    }

    let groupsViewInit=()=>{

    }

    homeConversationsViewInit=conversationsInit;
    homeGroupsViewInit=groupsViewInit;

}