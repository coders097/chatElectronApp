"use strict";
let closeModal = null;
let openModal = null;
{
    let modals = document.getElementById('modals');
    let callbackRun = null;
    let createGroupModal = document.getElementById('create-group-modal');
    let createGroupPicInput = document.getElementById('createGroupPicInput');
    let createGroupNameInput = document.getElementById('createGroupNameInput');
    let createGroupPicView = document.getElementById('createGroupPicView');
    let createGroupUserSelectedPic = false;
    createGroupPicInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            createGroupUserSelectedPic = true;
            let url = URL.createObjectURL(e.target.files[0]);
            createGroupPicView.src = url;
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 3000);
        }
        else {
            createGroupPicView.src = "../assets/groups.png";
            createGroupUserSelectedPic = false;
        }
    });
    createGroupModal.addEventListener('click', (e) => {
        switch (e.target.className) {
            case "change-pic":
                createGroupPicInput.click();
                break;
            case "create-group":
                if (callbackRun)
                    callbackRun({
                        name: createGroupNameInput.value,
                        userSelectedPic: createGroupUserSelectedPic,
                        picName: createGroupUserSelectedPic ? "" : "groups.png",
                        picData: createGroupUserSelectedPic ? createGroupPicInput.files[0] : null
                    });
                break;
            case "cancel-modal":
                _closeModal();
                break;
            default:
                console.log("NOTHING!");
        }
    });
    let _openModal = (type, cb) => {
        modals.style.display = "unset";
        switch (type) {
            case "CREATEGROUPMODAL":
                createGroupModal.style.display = "flex";
                callbackRun = cb;
                break;
            default:
                console.log("NOTHING!");
        }
    };
    let _closeModal = () => {
        modals.style.display = "none";
        createGroupModal.style.display = "none";
    };
    _closeModal();
    closeModal = _closeModal;
    openModal = _openModal;
}
