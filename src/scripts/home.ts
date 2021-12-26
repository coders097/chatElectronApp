{
    // View corresponding to Aside Buttons
    let conversationsAndGroupsView=document.getElementById('conversations_and_groups') as HTMLDivElement;
    let userProfileView=document.getElementById('user_profile_view') as HTMLDivElement;
    let currentView=conversationsAndGroupsView;
    let previousButton=document.getElementById('conversationsMenuBtn');
    let userProfileMenuBtn=document.getElementById('userProfileMenuBtn');

    let electron=require('electron');
    const ipc = electron.ipcRenderer;

    interface User{
        loggedIn: boolean;
        _id: string;
        name: string;
        email: string;
        pic: string;
        token: string;
    }

    let userData:User={
        _id:"",
        email:"",
        loggedIn:false,
        name:"",
        pic:"",
        token:""
    };

    let updateAsideUserInfo=()=>{
        (userProfileMenuBtn?.children[0] as HTMLImageElement).src=`http://localhost:3001/fetch/getUserPic?pic=${userData.pic}`;
        if(userProfileMenuBtn)
            userProfileMenuBtn.children[1].children[0].innerHTML=userData.name;        
        if(userProfileMenuBtn)
            userProfileMenuBtn.children[1].children[1].innerHTML=userData.email;        
    }

    ipc.on('new-user-data',(e,args)=>{
        userData={...args};
        updateAsideUserInfo();
        // console.log("new user data home",userData);
    });

    // Add Btn Clicks Handler to ASIDE BTN
    document.querySelector('.left-part')?.addEventListener('click',e=>{
        switch((e.target as HTMLDivElement).id){
            case 'conversationsMenuBtn':
                if(currentView!==conversationsAndGroupsView){
                    currentView.style.display="none";
                    conversationsAndGroupsView.style.display="unset";
                    currentView=conversationsAndGroupsView;
                }
                homeConversationsViewInit();
                previousButton?.classList.remove('active');
                previousButton=e.target as HTMLElement;
                previousButton.classList.add('active');
                break;
            case 'groupsMenuBtn':
                if(currentView!==conversationsAndGroupsView){
                    currentView.style.display="none";
                    conversationsAndGroupsView.style.display="unset";
                    currentView=conversationsAndGroupsView;
                }
                homeGroupsViewInit();
                previousButton?.classList.remove('active');
                previousButton=e.target as HTMLElement;
                previousButton.classList.add('active');
                break;
            case 'userProfileMenuBtn':
                if(currentView!==userProfileView){
                    currentView.style.display="none";
                    userProfileView.style.display="flex";
                    currentView=userProfileView;

                    previousButton?.classList.remove('active');
                    previousButton=null;

                    homeProfileViewInit(userData);
                }
                break;
            default:
                console.log("NOTHING!");
        }
    });

    interface Message{
        sender:{
            _id:string
            name:string,
            pic:string
        },
        _id:string
        timeStamp:string,
        message:string
        attachments:string[]
    };

    userData=ipc.sendSync("userDataContext",{});
    updateAsideUserInfo();

    // initialise App
    homeProfileViewInit(userData);

} 