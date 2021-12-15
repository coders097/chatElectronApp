let homeProfileViewInit:any=null;

interface User{
    loggedIn: boolean;
    _id: string;
    name: string;
    email: string;
    pic: string;
    token: string;
}

{
    let initialized=false;
    let userData:User;
    let editMode=false;

    let electron=require('electron');

    const prompt = require('electron-prompt');
    const ipc = electron.ipcRenderer;

    let profilePicView:HTMLImageElement=document.getElementById('profilePicView') as HTMLImageElement;
    let profilePicInput:HTMLInputElement=document.getElementById('profilePicInput') as HTMLInputElement;
    let profileNameInput:HTMLInputElement=document.getElementById('profileNameInput') as HTMLInputElement;;
    let profileEmailInput:HTMLInputElement=document.getElementById('profileEmailInput') as HTMLInputElement;;
    let profilePasswordInput:HTMLInputElement=document.getElementById('profilePasswordInput') as HTMLInputElement;;
    let profileNonEditModeItems:NodeListOf<HTMLElement>=document.querySelectorAll(".profile-non-edit-mode-items");
    let profileEditModeItems:NodeListOf<HTMLElement>=document.querySelectorAll(".profile-edit-mode-items");
    let profileBtnsView:HTMLButtonElement=document.querySelector(".profileBtns") as HTMLButtonElement;
    let profileNameView:HTMLHeadingElement=document.getElementById('profileNameView') as HTMLHeadingElement;
    let profileEmailView:HTMLHeadingElement=document.getElementById('profileEmailView') as HTMLHeadingElement;

    profilePicInput.addEventListener('change',(e:any)=>{
        if((e.target.files as File[]).length>0){
            let url=URL.createObjectURL((e.target.files as File[])[0]);
            profilePicView.src=url;
            setTimeout(()=>{
                URL.revokeObjectURL(url);
            },3000);
        }else{
            profilePicView.src=`http://localhost:3001/fetch/getUserPic?pic=${userData.pic}`;
        }
    });

    let editModeToggle=()=>{
        if(editMode){
            profileEditModeItems.forEach((e)=>e.style.display="none");
            profileNonEditModeItems.forEach((e)=>e.style.display="unset");
        }else{
            profileEditModeItems.forEach((e)=>e.style.display=(e.classList.contains("flex-view"))?"flex":"unset");
            profileNonEditModeItems.forEach((e)=>e.style.display="none");
        }
        editMode=!editMode;
    }

    let deleteProfile=async ()=>{
        // id,password
        let password=await prompt({
            title: 'Password Required',
            label: 'Enter your current password!',
            type:"input"
        });
        if(password!=null){
            fetch("http://localhost:3001/auth/deleteProfile",{
                method:"DELETE",
                headers:{
                    'Content-Type':"application/json",
                    'Authorization':`Bearer ${userData.token}`
                },
                body:JSON.stringify({
                    id:userData._id,
                    password:password
                })
            }).then(res=>res.json())
            .then(data=>{
                if(data.success){
                    ipc.send("delete-user");
                }else{
                    alert(data.error);
                }
            }).catch(err=>{
                alert(err);
            });
        }
    }

    let editProfile=async ()=>{
        // id, name, email, password
        // formData
        let formData=new FormData();
        let editedFlag=false;
        formData.append("id",userData._id);
        if(profileNameInput.value!==userData.name){
            editedFlag=true;
            formData.append("name",profileNameInput.value);
        }
        if(profileEmailInput.value!==userData.email){
            editedFlag=true;
            formData.append("email",profileEmailInput.value);
        }
        if(profilePasswordInput.value.trim()!==""){
            editedFlag=true;
            formData.append("password",profilePasswordInput.value);
        }
        if(profilePicInput.files && profilePicInput.files.length>0){
            editedFlag=true;
            formData.append("pic",profilePicInput.files[0]);
        }
        if(editedFlag){
            let password=await prompt({
                title: 'Password Required',
                label: 'Enter your current password!',
                type:"input"
            });
            if(password!=null){
                formData.append("oldPassword",password);
                fetch("http://localhost:3001/auth/editProfile",{
                    method:"POST",
                    headers:{
                        'Authorization':`Bearer ${userData.token}`
                    },
                    body:formData
                }).then(res=>res.json())
                .then(data=>{
                    if(data.success){
                        // _id: user._id,
                        // name: user.name,
                        // email: user.email,
                        // pic: user.pic,
                        userData.name=data.data.name;
                        userData.email=data.data.email;
                        userData.pic=data.data.pic;
                        updateChanges();
                        // update-userData
                        ipc.send("update-userData",userData);
                        editModeToggle();
                    }else{
                        alert(data.error);
                    }
                }).catch((e:Error)=>{
                    alert(e);
                });
            }
        }
    }

    let updateChanges=()=>{
        profileNameView.innerText=userData.name;
        profileEmailView.innerText=userData.email;
        profilePicView.src=`http://localhost:3001/fetch/getUserPic?pic=${userData.pic}`;
        profileNameInput.defaultValue=userData.name;
        profileEmailInput.defaultValue=userData.email;
        profilePasswordInput.defaultValue="";
    }

    profileBtnsView.addEventListener('click',(e)=>{
        switch((e.target as HTMLElement).id){
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
            default:
                console.log("NOTHING!");
        }
    });

    let init=(_userData:User)=>{
        // console.log("Running");
        if(!initialized){
            initialized=true;
            userData=_userData;
            updateChanges();
        }
        if(userData!==_userData){
            userData=_userData;
            updateChanges();
        }
    };
    homeProfileViewInit=init;
}

