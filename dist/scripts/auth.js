"use strict";
var _a;
{
    let electron = require('electron');
    const ipc = electron.ipcRenderer;
    let i = 0;
    let pics = document.querySelectorAll('.display img');
    let controlBtns = document.querySelectorAll(".controls div");
    let registerBtn = document.getElementById('registerBtn');
    let loginBtn = document.getElementById("loginBtn");
    let center = document.querySelector(".center");
    let selectedImg = "user0.png";
    let userSelectedPicCheck = false;
    let authPics = document.querySelector(".auth .pics");
    let userPicFile = null;
    let userpicView = document.querySelector('#userpicView');
    let showAuthPics = false;
    let userPicInput = document.getElementById('userPicInput');
    let signInBtn = document.getElementById('signInBtn');
    let signUpBtn = document.getElementById('signUpBtn');
    let userEmailInput = document.getElementById('userEmailInput');
    let userNameInput = document.getElementById('userNameInput');
    let userPasswordInput = document.getElementById('userPasswordInput');
    authPics === null || authPics === void 0 ? void 0 : authPics.addEventListener('click', (e) => {
        let target = e.target;
        if (target.nodeName === 'IMG') {
            userSelectedPicCheck = false;
            let oldPic = userpicView === null || userpicView === void 0 ? void 0 : userpicView.getAttribute("data-picName");
            let newPic = target.getAttribute("data-picName");
            userpicView === null || userpicView === void 0 ? void 0 : userpicView.setAttribute("data-picName", newPic);
            userpicView.src = `../assets/userSamples/${newPic}`;
            target.setAttribute("data-picName", oldPic);
            target.src = `../assets/userSamples/${oldPic}`;
            selectedImg = newPic;
        }
        else if (target.nodeName === 'DIV') {
            if (target.id === 'userpicaction') {
                userPicInput === null || userPicInput === void 0 ? void 0 : userPicInput.click();
            }
        }
    });
    (_a = userPicInput) === null || _a === void 0 ? void 0 : _a.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            userSelectedPicCheck = true;
            userPicFile = e.target.files[0];
            let url = URL.createObjectURL(userPicFile);
            userpicView.src = url;
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 3000);
        }
    });
    userpicView === null || userpicView === void 0 ? void 0 : userpicView.addEventListener('click', () => {
        showAuthPics = !showAuthPics;
        if (showAuthPics) {
            authPics.style.opacity = "1";
            authPics.style.visibility = "unset";
        }
        else {
            authPics.style.opacity = "0";
            authPics.style.visibility = "hidden";
        }
    });
    controlBtns.forEach((btn, j) => {
        btn.addEventListener('click', () => {
            pics[i].style.opacity = "0";
            pics[j].style.opacity = "1";
            i = j;
        });
    });
    setInterval(() => {
        let j = (i + 1) % 4;
        pics[i].style.opacity = "0";
        pics[j].style.opacity = "1";
        i = j;
    }, 4000);
    registerBtn === null || registerBtn === void 0 ? void 0 : registerBtn.addEventListener('click', () => {
        (center === null || center === void 0 ? void 0 : center.children[0]).style.display = "flex";
        (center === null || center === void 0 ? void 0 : center.children[1]).style.display = "unset";
        (center === null || center === void 0 ? void 0 : center.children[4]).style.display = "none";
        (center === null || center === void 0 ? void 0 : center.children[5]).style.display = "flex";
    });
    loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.addEventListener('click', () => {
        (center === null || center === void 0 ? void 0 : center.children[0]).style.display = "none";
        (center === null || center === void 0 ? void 0 : center.children[1]).style.display = "none";
        (center === null || center === void 0 ? void 0 : center.children[4]).style.display = "flex";
        (center === null || center === void 0 ? void 0 : center.children[5]).style.display = "none";
    });
    signInBtn === null || signInBtn === void 0 ? void 0 : signInBtn.addEventListener('click', () => {
        fetch("http://localhost:3001/auth/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: userPasswordInput.value,
                email: userEmailInput.value
            })
        }).then(res => res.json())
            .then(data => {
            if (data.success) {
                ipc.send("signInAuth", Object.assign(Object.assign({}, data.data), { loggedIn: true }));
            }
            else {
                alert(data.error);
            }
        }).catch(err => alert(err));
    });
    signUpBtn === null || signUpBtn === void 0 ? void 0 : signUpBtn.addEventListener('click', () => {
        let formData = new FormData();
        formData.append("name", userNameInput.value);
        formData.append("email", userEmailInput.value);
        formData.append("password", userPasswordInput.value);
        if (userSelectedPicCheck) {
            formData.append('pic', userPicInput.files[0]);
        }
        else {
            formData.append("pic", selectedImg);
        }
        fetch("http://localhost:3001/auth/signup", {
            method: "POST",
            body: formData
        }).then(res => res.json())
            .then(data => {
            if (data.success) {
                alert("Now SignIn");
                loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.click();
            }
            else {
                alert(data.error);
            }
        }).catch(err => alert(err));
    });
}
