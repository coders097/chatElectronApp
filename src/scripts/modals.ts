let closeModal:any=null;
let openModal:any=null;


{
    let modals:HTMLDivElement=document.getElementById('modals') as HTMLDivElement;
    let callbackRun:any=null;
    
    // CREATE GROUP MODAL
    let createGroupModal:HTMLDivElement=document.getElementById('create-group-modal') as HTMLDivElement;
    let createGroupPicInput:HTMLInputElement=document.getElementById('createGroupPicInput') as HTMLInputElement;
    let createGroupNameInput:HTMLInputElement=document.getElementById('createGroupNameInput') as HTMLInputElement;
    let createGroupPicView:HTMLImageElement=document.getElementById('createGroupPicView') as HTMLImageElement;
    let createGroupUserSelectedPic=false;

    createGroupPicInput.addEventListener('change',(e:any)=>{
        if(e.target.files.length>0){
            createGroupUserSelectedPic=true;
            let url=URL.createObjectURL(e.target.files[0]);
            createGroupPicView.src=url;
            setTimeout(()=>{
                URL.revokeObjectURL(url);
            },3000);
        }else{
            createGroupPicView.src="../assets/groups.png";
            createGroupUserSelectedPic=false;
        }
    });
    
    createGroupModal.addEventListener('click',(e:any)=>{
        switch(e.target.className){
            case "change-pic":
                createGroupPicInput.click();
                break;
            case "create-group":
                if(callbackRun) callbackRun({
                    // passdata here
                    name:createGroupNameInput.value,
                    userSelectedPic:createGroupUserSelectedPic,
                    picName:createGroupUserSelectedPic?"":"groups.png",
                    picData:createGroupUserSelectedPic?createGroupPicInput.files![0]:null
                });
                break;
            case "cancel-modal":
                _closeModal();
                break;
            default:
                console.log("NOTHING!");
        }
    });
    
    let _openModal=(type:string,cb:Function)=>{
        modals.style.display="unset";
        switch(type){
            case "CREATEGROUPMODAL":
                createGroupModal.style.display="flex";
                callbackRun=cb;
                break;

            default:
                console.log("NOTHING!");
        }
    }

    let _closeModal=()=>{
        modals.style.display="none";
        createGroupModal.style.display="none";
    }

    _closeModal();
    closeModal=_closeModal;
    openModal=_openModal;
}