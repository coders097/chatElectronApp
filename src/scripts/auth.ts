{
    let electron=require('electron');
    // Import the ipcRenderer Module from Electron
    const ipc = electron.ipcRenderer;
    let i=0;
    let pics=document.querySelectorAll('.display img');
    let controlBtns=document.querySelectorAll(".controls div");
    let registerBtn=document.getElementById('registerBtn');
    let loginBtn=document.getElementById("loginBtn");
    let center=document.querySelector(".center");
    let selectedImg="user0.png";
    let userSelectedPicCheck=false;
    let authPics=document.querySelector(".auth .pics");
    let userPicFile:File|null=null;
    let userpicView=document.querySelector('#userpicView');
    let showAuthPics=false;
    let userPicInput=document.getElementById('userPicInput');
    let signInBtn=document.getElementById('signInBtn');
    let signUpBtn=document.getElementById('signUpBtn');
    let userEmailInput:HTMLInputElement=document.getElementById('userEmailInput') as HTMLInputElement;
    let userNameInput:HTMLInputElement=document.getElementById('userNameInput') as HTMLInputElement;
    let userPasswordInput:HTMLInputElement=document.getElementById('userPasswordInput') as HTMLInputElement;

    authPics?.addEventListener('click',(e)=>{
        let target:any=e.target;
        if(target.nodeName==='IMG'){
            userSelectedPicCheck=false;
            let oldPic=userpicView?.getAttribute("data-picName");
            let newPic=target.getAttribute("data-picName");
            userpicView?.setAttribute("data-picName",newPic);
            (userpicView as HTMLImageElement).src=`../assets/userSamples/${newPic}`;
            target.setAttribute("data-picName",oldPic);
            (target as HTMLImageElement).src=`../assets/userSamples/${oldPic}`;
            selectedImg=newPic;
        }else if(target.nodeName==='DIV'){ 
            if(target.id==='userpicaction'){
                userPicInput?.click();
            }
        }
    });
    
    (userPicInput as HTMLInputElement)?.addEventListener('change',(e:any)=>{
        if(e.target.files.length>0){
            userSelectedPicCheck=true;
            userPicFile=e.target.files[0];
            let url=URL.createObjectURL(userPicFile as File);
            (userpicView as HTMLImageElement).src=url;
            setTimeout(()=>{
                URL.revokeObjectURL(url);
            },3000);
        }
    });

    userpicView?.addEventListener('click',()=>{
        showAuthPics=!showAuthPics;
        if(showAuthPics){
            (authPics as HTMLDivElement).style.opacity="1";
            (authPics as HTMLDivElement).style.visibility="unset";
        }else{
            (authPics as HTMLDivElement).style.opacity="0";
            (authPics as HTMLDivElement).style.visibility="hidden";
        }
    });

    controlBtns.forEach((btn,j)=>{
        btn.addEventListener('click',()=>{
            (pics[i] as HTMLImageElement).style.opacity="0";
            (pics[j] as HTMLImageElement).style.opacity="1";
            i=j;
        });
    });

    setInterval(()=>{
        let j=(i+1)%4;
        (pics[i] as HTMLImageElement).style.opacity="0";
        (pics[j] as HTMLImageElement).style.opacity="1";
        i=j;
    },4000);

    registerBtn?.addEventListener('click',()=>{
        (center?.children[0] as HTMLDivElement).style.display="flex";
        (center?.children[1] as HTMLInputElement).style.display="unset";
        (center?.children[4] as HTMLDivElement).style.display="none";
        (center?.children[5] as HTMLDivElement).style.display="flex";
    });

    loginBtn?.addEventListener('click',()=>{
        (center?.children[0] as HTMLDivElement).style.display="none";
        (center?.children[1] as HTMLInputElement).style.display="none";
        (center?.children[4] as HTMLDivElement).style.display="flex";
        (center?.children[5] as HTMLDivElement).style.display="none";
    });

    signInBtn?.addEventListener('click',()=>{
        // console.log(userEmailInput.value);
        // console.log(userPasswordInput.value);

        fetch("http://localhost:3001/auth/login",{
            method:"POST",
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                password:userPasswordInput.value, 
                email:userEmailInput.value
            })
        }).then(res=>res.json())
        .then(data=>{
            if(data.success){
                ipc.send("signInAuth",{
                    ...data.data,
                    loggedIn:true
                });
            }else{
                alert(data.error);
            }
        }).catch(err=>alert(err));
    });

    signUpBtn?.addEventListener('click',()=>{
        // name, email, password, pic
        let formData=new FormData();
        formData.append("name",userNameInput.value);
        formData.append("email",userEmailInput.value);
        formData.append("password",userPasswordInput.value);
        if(userSelectedPicCheck){
            formData.append('pic',(userPicInput as HTMLInputElement).files![0]);
        }else{
            formData.append("pic",selectedImg);
        }

        fetch("http://localhost:3001/auth/signup",{
            method:"POST",
            body:formData
        }).then(res=>res.json())
        .then(data=>{
            if(data.success){
                alert("Now SignIn");
                loginBtn?.click();
            }else{
                alert(data.error);
            }
        }).catch(err=>alert(err));
    });

}