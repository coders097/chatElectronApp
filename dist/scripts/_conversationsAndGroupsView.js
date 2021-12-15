"use strict";
let homeConversationsViewInit = null;
let homeGroupsViewInit = null;
{
    let userData;
    let conversationMode = true;
    let electron = require('electron');
    const prompt = require('electron-prompt');
    const ipc = electron.ipcRenderer;
    let conversationsInit = () => {
    };
    let groupsViewInit = () => {
    };
    homeConversationsViewInit = conversationsInit;
    homeGroupsViewInit = groupsViewInit;
}
