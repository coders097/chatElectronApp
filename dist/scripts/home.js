"use strict";
var _a;
{
    let conversationsAndGroupsView = document.getElementById('conversations_and_groups');
    let userProfileView = document.getElementById('user_profile_view');
    let currentView = conversationsAndGroupsView;
    let previousButton = document.getElementById('conversationsMenuBtn');
    let userProfileMenuBtn = document.getElementById('userProfileMenuBtn');
    let electron = require('electron');
    const ipc = electron.ipcRenderer;
    let userData = {
        _id: "",
        email: "",
        loggedIn: false,
        name: "",
        pic: "",
        token: ""
    };
    let updateAsideUserInfo = () => {
        (userProfileMenuBtn === null || userProfileMenuBtn === void 0 ? void 0 : userProfileMenuBtn.children[0]).src = `http://localhost:3001/fetch/getUserPic?pic=${userData.pic}`;
        if (userProfileMenuBtn)
            userProfileMenuBtn.children[1].children[0].innerHTML = userData.name;
        if (userProfileMenuBtn)
            userProfileMenuBtn.children[1].children[1].innerHTML = userData.email;
    };
    ipc.on('new-user-data', (e, args) => {
        userData = Object.assign({}, args);
        updateAsideUserInfo();
    });
    (_a = document.querySelector('.left-part')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', e => {
        switch (e.target.id) {
            case 'conversationsMenuBtn':
                if (currentView !== conversationsAndGroupsView) {
                    currentView.style.display = "none";
                    conversationsAndGroupsView.style.display = "unset";
                    currentView = conversationsAndGroupsView;
                }
                homeConversationsViewInit();
                previousButton === null || previousButton === void 0 ? void 0 : previousButton.classList.remove('active');
                previousButton = e.target;
                previousButton.classList.add('active');
                break;
            case 'groupsMenuBtn':
                if (currentView !== conversationsAndGroupsView) {
                    currentView.style.display = "none";
                    conversationsAndGroupsView.style.display = "unset";
                    currentView = conversationsAndGroupsView;
                }
                homeGroupsViewInit();
                previousButton === null || previousButton === void 0 ? void 0 : previousButton.classList.remove('active');
                previousButton = e.target;
                previousButton.classList.add('active');
                break;
            case 'userProfileMenuBtn':
                if (currentView !== userProfileView) {
                    currentView.style.display = "none";
                    userProfileView.style.display = "flex";
                    currentView = userProfileView;
                    previousButton === null || previousButton === void 0 ? void 0 : previousButton.classList.remove('active');
                    previousButton = null;
                    homeProfileViewInit(userData);
                }
                break;
            default:
                console.log("NOTHING!");
        }
    });
    ;
    userData = ipc.sendSync("userDataContext", {});
    updateAsideUserInfo();
    homeProfileViewInit(userData);
}
