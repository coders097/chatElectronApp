"use strict";
let homeConversationsViewInit = null;
let homeGroupsViewInit = null;
{
    const io = require("socket.io-client");
    const socket = io("http://localhost:3001");
    let userData;
    let conversationMode = true;
    let currentConversationId = null;
    let currentConversationItemMenu = null;
    let currentGroupId = null;
    let currentGroupItemMenu = null;
    let picsMessageInput = document.getElementById('picsMessageInput');
    let attachmentsMessageInput = document.getElementById('attachmentsMessageInput');
    let messageTextInput = document.getElementById('messageTextInput');
    let electron = require('electron');
    const prompt = require('electron-prompt');
    const ipc = electron.ipcRenderer;
    userData = ipc.sendSync("userDataContext", {});
    let messagesDisplay = document.querySelector("main .display .messages");
    let asideMenuDisplay = document.querySelector('main .aside');
    let messagesTopMenu = document.querySelector("main .display .floating-menu");
    let messagesControlInputBox = document.querySelector("main .control-bar");
    let searchNav = document.querySelector('nav');
    let dataLoaded = {
        conversations: false,
        groups: false
    };
    let dataTitles = {
        conversations: [],
        groups: []
    };
    let data = {};
    let notifications = {};
    let _setMainData = (_data) => {
        console.log("Hello");
        console.log(data);
        if (conversationMode && currentConversationId)
            data[currentConversationId] = _data;
        else if (currentGroupId)
            data[currentGroupId] = _data;
        console.log(data);
    };
    let loadTileData = (type) => {
        let event = (type === "conversations") ? "get-all-conversations-info" : "get-all-groups-info";
        console.log("Hello Part 1");
        let body = {
            _id: userData._id,
            token: userData.token
        };
        socket.emit(event, body, (res) => {
            console.log(res);
            if (res.success) {
                if (type === 'conversations')
                    dataTitles.conversations = res.data;
                else
                    dataTitles.groups = res.data;
                renderAsideMenu();
            }
            else {
                alert(res.error);
            }
        });
    };
    let loadMainData = () => {
        socket.emit("recent-chats", {
            type: (conversationMode) ? "CONVERSATION" : "GROUP",
            _id: userData._id,
            conversationId: currentConversationId,
            groupId: currentGroupId,
            token: userData.token
        }, (e) => {
            if (e.success) {
                console.log("Main Data", e.data);
                _setMainData(e.data);
                renderMessageDisplay(false);
            }
            else {
                alert(e.error);
            }
        });
    };
    let handleMessageFileInputs = () => {
        var _a, _b;
        if (((_a = picsMessageInput.files) === null || _a === void 0 ? void 0 : _a.length) == 0 && ((_b = attachmentsMessageInput.files) === null || _b === void 0 ? void 0 : _b.length) == 0) {
            messagesControlInputBox.children[1].style.display = "none";
            messagesControlInputBox.children[1].children[0].style.display = "none";
            messagesControlInputBox.children[1].children[1].style.display = "none";
        }
        else
            messagesControlInputBox.children[1].style.display = "flex";
        if (picsMessageInput.files && picsMessageInput.files.length > 0) {
            messagesControlInputBox.children[1].children[0].style.display = "flex";
            messagesControlInputBox.children[1].children[0].children[1].innerHTML = `${picsMessageInput.files.length} images`;
        }
        else {
            messagesControlInputBox.children[1].children[0].style.display = "none";
        }
        if (attachmentsMessageInput.files && attachmentsMessageInput.files.length > 0) {
            messagesControlInputBox.children[1].children[1].style.display = "flex";
            messagesControlInputBox.children[1].children[1].children[1].innerHTML = `${attachmentsMessageInput.files.length} attachments`;
        }
        else {
            messagesControlInputBox.children[1].children[1].style.display = "none";
        }
    };
    picsMessageInput.addEventListener('change', () => {
        handleMessageFileInputs();
    });
    attachmentsMessageInput.addEventListener('change', () => {
        handleMessageFileInputs();
    });
    let sendMessageHelper = (__attachments, _friendId) => {
        socket.emit("send-message", {
            type: (conversationMode) ? "CONVERSATION" : "GROUP",
            _id: userData._id,
            name: userData.name,
            pic: userData.pic,
            message: messageTextInput.value,
            pics: [],
            attachments: __attachments,
            friendId: (conversationMode) ? _friendId : "",
            groupId: (conversationMode) ? "" : currentGroupId,
            conversationId: (conversationMode) ? currentConversationId : "",
            token: userData.token
        });
    };
    let sendMessage = () => {
        let formData = new FormData();
        let attachmentsFlag = false;
        if (picsMessageInput.files && picsMessageInput.files.length > 0)
            attachmentsFlag = true;
        if (attachmentsMessageInput.files && attachmentsMessageInput.files.length > 0)
            attachmentsFlag = true;
        if (picsMessageInput.files)
            for (let i = 0; i < picsMessageInput.files.length; i++)
                formData.append(`pic${i}`, picsMessageInput.files[i]);
        if (attachmentsMessageInput.files)
            for (let i = 0; i < attachmentsMessageInput.files.length; i++)
                formData.append(`pic${i}`, attachmentsMessageInput.files[i]);
        let _friendId = "";
        if (conversationMode)
            dataTitles.conversations.forEach(conversation => {
                if (conversation.conversationId === currentConversationId)
                    _friendId = conversation.userId;
            });
        if (attachmentsFlag) {
            fetch("http://localhost:3001/fetch/uploadAttachment", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${userData.token}`
                },
                body: formData
            }).then(res => res.json())
                .then(_data => {
                if (_data.success) {
                    if (currentConversationId)
                        sendMessageHelper(_data.data, _friendId);
                    messageTextInput.value = "";
                    messagesControlInputBox.children[1].children[0].children[2].click();
                    messagesControlInputBox.children[1].children[1].children[2].click();
                }
                else {
                    alert(_data.error);
                }
            }).catch(e => {
                alert(e);
            });
        }
        else
            sendMessageHelper([], _friendId);
    };
    let renderMessageDisplay = (single) => {
        if (!currentConversationId && !currentGroupId)
            return;
        if (conversationMode) {
            if (!currentConversationId)
                return;
            if (data[currentConversationId] == undefined || data[currentConversationId] == null) {
                loadMainData();
                return;
            }
        }
        else {
            if (!currentGroupId)
                return;
            if (data[currentGroupId] == undefined || data[currentGroupId] == null) {
                loadMainData();
                return;
            }
        }
        for (let i = messagesDisplay.children.length - 1; i >= 1; i--)
            messagesDisplay.removeChild(messagesDisplay.children[i]);
        ((conversationMode) ? data[currentConversationId] : data[currentGroupId]).forEach(e => {
            messagesDisplay.innerHTML += `
            <div class="message ${(e.sender._id === userData._id) ? "right" : "left"}">
                <div class="title">
                    <img alt="titlePic" src="http://localhost:3001/fetch/getUserPic?pic=${e.sender.pic}"/>
                    <h2>${e.sender.name}</h2>
                    <h4>58:45 AM</h4>
                </div>
                <div class="details">
                    ${e.message}
                </div>
                <div class="extra">
                    ${e.attachments.map((e) => {
                let lastIndex = e.lastIndexOf(".");
                if (lastIndex == -1) {
                    return `<img alt="attach" class="attachement" src="../assets/attached.png" data-type="attachment" data-attachmentName="${e}"/>`;
                }
                let extention = e.substring(lastIndex);
                if (extention === '.jpg' || extention === '.jpeg' || extention === '.png' || extention === '.webp') {
                    return `<img alt="pic0" src="http://localhost:3001/fetch/getPostPic?pic=${e}&token=${userData.token}" data-type="pic" data-picName="${e}"/>`;
                }
                return `<img alt="attach" class="attachement" src="../assets/attached.png" data-type="attachment" data-attachmentName="${e}"/>`;
            })}
                </div>
            </div>
            `;
        });
    };
    let renderAsideMenu = () => {
        renderDefaultMessageAside();
        console.log(asideMenuDisplay.children.length);
        for (let i = asideMenuDisplay.children.length - 1; i >= 2; i--) {
            asideMenuDisplay.removeChild(asideMenuDisplay.children[i]);
        }
        console.log(asideMenuDisplay.children.length);
        if (conversationMode) {
        }
        else {
            dataTitles.groups.forEach(group => {
                let searchParams = new URLSearchParams({
                    fileName: group.pic,
                    token: userData.token
                });
                searchParams.toString();
                if (currentGroupId && (group._id === currentGroupId)) {
                    asideMenuDisplay.innerHTML += `<div class="item active" id="${group._id}">
                        <img src="http://localhost:3001/fetch/getAttachment?${searchParams.toString()}" alt="pic" style="pointer-events: none;"/>
                        <div class="details" style="pointer-events: none;">
                            <h2 style="pointer-events: none;">${group.name}</h2>
                            <h4 style="pointer-events: none;">05:52 AM</h4>
                            <p style="pointer-events: none;">
                                We have lake-front vacation rentals.
                            </p>
                        </div>
                    </div>`;
                }
                else {
                    asideMenuDisplay.innerHTML += `<div class="item" id="${group._id}">
                        <img src="http://localhost:3001/fetch/getAttachment?${searchParams.toString()}" alt="pic" style="pointer-events: none;"/>
                        <div class="details" style="pointer-events: none;">
                            <h2 style="pointer-events: none;">${group.name}</h2>
                            <h4 style="pointer-events: none;">05:52 AM</h4>
                            <p style="pointer-events: none;">
                                We have lake-front vacation rentals.
                            </p>
                        </div>
                    </div>`;
                }
            });
        }
    };
    let renderDefaultMessageAside = () => {
        console.log("Render");
        if (conversationMode) {
            if (dataTitles.conversations.length == 0) {
                asideMenuDisplay.children[1].style.display = "flex";
                asideMenuDisplay.children[1].children[0].style.display = "unset";
                asideMenuDisplay.children[1].children[1].innerHTML = "Search for your friends and family to create conversations.";
            }
            else
                asideMenuDisplay.children[1].style.display = "none";
        }
        else {
            if (dataTitles.groups.length == 0) {
                asideMenuDisplay.children[1].style.display = "flex";
                asideMenuDisplay.children[1].children[0].style.display = "none";
                asideMenuDisplay.children[1].children[1].innerHTML = "No groups.";
            }
            else
                asideMenuDisplay.children[1].style.display = "none";
        }
    };
    renderDefaultMessageAside();
    let renderMessageDisplayMenus = (type) => {
        messagesTopMenu.style.display = type ? "flex" : "none";
        messagesControlInputBox.style.display = type ? "flex" : "none";
    };
    renderMessageDisplayMenus(false);
    let renderDefaultMessageDisplay = () => {
        messagesDisplay.children[0].style.display = "flex";
        messagesDisplay.children[0].children[0].innerHTML = (conversationMode) ?
            (dataTitles.conversations.length === 0 ? "Search for your friends and family to create conversations." : "Select a conversation!") :
            (dataTitles.groups.length === 0 ? "Search a group or create one." : "Select a group!");
    };
    renderDefaultMessageDisplay();
    let conversationsInit = () => {
        if (searchNav)
            searchNav.children[0].innerHTML = "Conversations";
        if (!dataLoaded.conversations) {
            loadTileData("conversations");
        }
        asideMenuDisplay.children[0].style.display = "none";
        conversationMode = true;
        renderDefaultMessageAside();
        if (currentConversationId == null)
            renderDefaultMessageDisplay();
    };
    let groupsViewInit = () => {
        if (searchNav)
            searchNav.children[0].innerHTML = "Groups";
        if (!dataLoaded.groups) {
            loadTileData("groups");
        }
        asideMenuDisplay.children[0].style.display = "flex";
        conversationMode = false;
        renderDefaultMessageAside();
        if (currentGroupId == null)
            renderDefaultMessageDisplay();
    };
    asideMenuDisplay.addEventListener('click', (e) => {
        switch (e.target.id) {
            case "new-group-adder-menu":
                openModal("CREATEGROUPMODAL", function (e) {
                    if (e.userSelectedPic) {
                        let formData = new FormData();
                        formData.append("pic", e.picData);
                        fetch("http://localhost:3001/fetch/uploadAttachment", {
                            method: "POST",
                            headers: {
                                'Authorization': `Bearer ${userData.token}`
                            },
                            body: formData
                        }).then(res => res.json())
                            .then(data => {
                            if (data.success) {
                                socket.emit("create-group", {
                                    _id: userData._id,
                                    pic: data.data[0],
                                    name: e.name,
                                    token: userData.token
                                }, (args) => {
                                    console.log(args);
                                    if (args.success) {
                                        if (conversationMode)
                                            dataTitles.conversations.push(args.data);
                                        else
                                            dataTitles.groups.push(args.data);
                                        renderAsideMenu();
                                        closeModal();
                                    }
                                    else {
                                        alert(args.error);
                                    }
                                });
                            }
                            else {
                                alert(data.error);
                            }
                        }).catch(err => {
                            alert(err);
                        });
                    }
                    else {
                        socket.emit("create-group", {
                            _id: userData._id,
                            pic: e.picName,
                            name: e.name,
                            token: userData.token
                        }, (args) => {
                            console.log(args);
                            if (args.success) {
                                if (conversationMode)
                                    dataTitles.conversations.push(args.data);
                                else
                                    dataTitles.groups.push(args.data);
                                renderAsideMenu();
                                closeModal();
                            }
                            else {
                                alert(args.error);
                            }
                        });
                    }
                });
                break;
            default:
                console.log("NOTHING");
        }
        if (e.target.id && (e.target.id.length > 22)) {
            console.log("Object ID DETECTED!", e.target.id);
            if (conversationMode) {
                currentConversationId = e.target.id;
                if (currentConversationItemMenu)
                    currentConversationItemMenu.classList.remove("active");
                currentConversationItemMenu = e.target;
                e.target.classList.add("active");
            }
            else {
                currentGroupId = e.target.id;
                if (currentGroupItemMenu)
                    currentGroupItemMenu.classList.remove("active");
                currentGroupItemMenu = e.target;
                e.target.classList.add('active');
            }
            renderMessageDisplayMenus(true);
            renderMessageDisplay(false);
        }
    });
    messagesControlInputBox.children[0].children[1].addEventListener('click', (e) => {
        switch (e.target.id) {
            case "imageMessageBtn":
                picsMessageInput.click();
                break;
            case "attachmentMessageBtn":
                attachmentsMessageInput.click();
                break;
            case "messageSendButton":
                sendMessage();
                break;
            default:
                console.log("NOTHING!");
        }
    });
    messagesControlInputBox.children[1].children[0].children[2].addEventListener('click', () => {
        picsMessageInput.value = "";
        handleMessageFileInputs();
    });
    messagesControlInputBox.children[1].children[1].children[2].addEventListener('click', () => {
        attachmentsMessageInput.value = "";
        handleMessageFileInputs();
    });
    socket.on("hello", () => {
        console.log("Hello");
        loadTileData("conversations");
    });
    socket.on("message-received", (e) => {
        if (data[e.typeId])
            data[e.typeId].push(e.data);
    });
    homeConversationsViewInit = conversationsInit;
    homeGroupsViewInit = groupsViewInit;
}
