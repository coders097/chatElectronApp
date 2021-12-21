"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let homeProfileViewInit = null;
{
    let initialized = false;
    let userData;
    let editMode = false;
    let electron = require('electron');
    const prompt = require('electron-prompt');
    const ipc = electron.ipcRenderer;
    let profilePicView = document.getElementById('profilePicView');
    let profilePicInput = document.getElementById('profilePicInput');
    let profileNameInput = document.getElementById('profileNameInput');
    ;
    let profileEmailInput = document.getElementById('profileEmailInput');
    ;
    let profilePasswordInput = document.getElementById('profilePasswordInput');
    ;
    let profileNonEditModeItems = document.querySelectorAll(".profile-non-edit-mode-items");
    let profileEditModeItems = document.querySelectorAll(".profile-edit-mode-items");
    let profileBtnsView = document.querySelector(".profileBtns");
    let profileNameView = document.getElementById('profileNameView');
    let profileEmailView = document.getElementById('profileEmailView');
    profilePicInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            let url = URL.createObjectURL(e.target.files[0]);
            profilePicView.src = url;
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 3000);
        }
        else {
            profilePicView.src = `http://localhost:3001/fetch/getUserPic?pic=${userData.pic}`;
        }
    });
    let editModeToggle = () => {
        if (editMode) {
            profileEditModeItems.forEach((e) => e.style.display = "none");
            profileNonEditModeItems.forEach((e) => e.style.display = "unset");
        }
        else {
            profileEditModeItems.forEach((e) => e.style.display = (e.classList.contains("flex-view")) ? "flex" : "unset");
            profileNonEditModeItems.forEach((e) => e.style.display = "none");
        }
        editMode = !editMode;
    };
    let deleteProfile = () => __awaiter(void 0, void 0, void 0, function* () {
        let password = yield prompt({
            title: 'Password Required',
            label: 'Enter your current password!',
            type: "input"
        });
        if (password != null) {
            fetch("http://localhost:3001/auth/deleteProfile", {
                method: "DELETE",
                headers: {
                    'Content-Type': "application/json",
                    'Authorization': `Bearer ${userData.token}`
                },
                body: JSON.stringify({
                    id: userData._id,
                    password: password
                })
            }).then(res => res.json())
                .then(data => {
                if (data.success) {
                    ipc.send("delete-user");
                }
                else {
                    alert(data.error);
                }
            }).catch(err => {
                alert(err);
            });
        }
    });
    let editProfile = () => __awaiter(void 0, void 0, void 0, function* () {
        let formData = new FormData();
        let editedFlag = false;
        formData.append("id", userData._id);
        if (profileNameInput.value !== userData.name) {
            editedFlag = true;
            formData.append("name", profileNameInput.value);
        }
        if (profileEmailInput.value !== userData.email) {
            editedFlag = true;
            formData.append("email", profileEmailInput.value);
        }
        if (profilePasswordInput.value.trim() !== "") {
            editedFlag = true;
            formData.append("password", profilePasswordInput.value);
        }
        if (profilePicInput.files && profilePicInput.files.length > 0) {
            editedFlag = true;
            formData.append("pic", profilePicInput.files[0]);
        }
        if (editedFlag) {
            let password = yield prompt({
                title: 'Password Required',
                label: 'Enter your current password!',
                type: "input"
            });
            if (password != null) {
                formData.append("oldPassword", password);
                fetch("http://localhost:3001/auth/editProfile", {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${userData.token}`
                    },
                    body: formData
                }).then(res => res.json())
                    .then(data => {
                    if (data.success) {
                        userData.name = data.data.name;
                        userData.email = data.data.email;
                        userData.pic = data.data.pic;
                        updateChanges();
                        ipc.send("update-userData", userData);
                        editModeToggle();
                    }
                    else {
                        alert(data.error);
                    }
                }).catch((e) => {
                    alert(e);
                });
            }
        }
    });
    let updateChanges = () => {
        profileNameView.innerText = userData.name;
        profileEmailView.innerText = userData.email;
        profilePicView.src = `http://localhost:3001/fetch/getUserPic?pic=${userData.pic}`;
        profileNameInput.defaultValue = userData.name;
        profileEmailInput.defaultValue = userData.email;
        profilePasswordInput.defaultValue = "";
    };
    let logOut = () => {
        ipc.send("logOutUser");
    };
    profileBtnsView.addEventListener('click', (e) => {
        switch (e.target.id) {
            case "editProfileBtn":
                editModeToggle();
                break;
            case "editProfileChangePicBtn":
                profilePicInput.click();
                break;
            case "editProfileSaveBtn":
                editProfile();
                break;
            case "editProfileCancelBtn":
                updateChanges();
                editModeToggle();
                break;
            case "editProfileDeleteBtn":
                deleteProfile();
                break;
            case "logOutUserBtn":
                logOut();
            default:
                console.log("NOTHING!");
        }
    });
    let init = (_userData) => {
        if (!initialized) {
            initialized = true;
            userData = _userData;
            updateChanges();
        }
        if (userData !== _userData) {
            userData = _userData;
            updateChanges();
        }
    };
    homeProfileViewInit = init;
}
