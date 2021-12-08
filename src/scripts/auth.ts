{
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

    loginBtn?.addEventListener('click',()=>{

    });

}