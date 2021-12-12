import socket from 'socket.io';
import Group from '../models/Group';
import User from '../models/User';
import Conversation from '../models/Conversation';

interface ConnectedClients{
    [key: string]: socket.Socket<any, any, any, any>;
}

interface MapUserIdToSocketId{
    [key: string]: string;
}

interface GroupIdToNameMap{
    [key: string]: string
}

let _=(io:socket.Server<any,any,any,any>)=>{
    
    let connectedClients:ConnectedClients={};
    let mapUserIdToSocketId:MapUserIdToSocketId={};
    let groupIdToNameMap:GroupIdToNameMap={};

    io.on("connection", (socket) => {

        // Denotes to the console that a socket is joined
        console.log("Connected!");
        
        // Now add the socket to its id in map
        connectedClients[socket.id]=socket;
        
        // Link its actual id to socket id
        socket.on("link-id",(_id:string)=>{
            mapUserIdToSocketId[_id]=socket.id;
        });

        // Create a group
        socket.on('create-group',async (data:{
            _id:string,
            pic:string,
            name:string
        },cb:(args:any)=>{})=>{
            try{
                let user=await User.findById(data._id);
                if(user){
                    let group=await Group.create({
                        name:data.name,
                        pic:data.pic,
                        users:[data._id]
                    });
                    user.groups.push(group._id);
                    user.save()
                    .then(()=>{
                        
                        groupIdToNameMap[group._id]=data.name;
                        socket.join(data.name);

                        cb({
                            success:true,
                            data:{
                                name:group.name,
                                pic:group.pic,
                                _id:group._id
                            }
                        }); 
                    }).catch((err:Error)=>{
                        cb({
                            success:false,
                            error:"SERVER ERROR"
                        }); 
                        Group.findByIdAndDelete(group._id)
                        .then(()=>{}).catch(()=>{});
                    });
                }else{
                    cb({
                        success:false,
                        error:"INVALID ID"
                    });    
                }
            }catch(e){
                cb({
                    success:false,
                    error:"SERVER ERROR"
                });
            }
            // send a response reply to _id
        });

        // Join a group
        socket.on('join-group',async (data:{
            _id:string,
            groupId:string
        },cb:(args:any)=>{})=>{

            // Score.find().slice('players', 5).
            // send a response reply to _id
            try{
                let user=await User.findById(data._id);
                let group=await Group.findById(data.groupId)
                .slice('messages',-60)
                .populate('messages');
                if(user && group){
                    let index=(group.users as string[]).find((id:string)=>{
                        return id.toString()==data._id;
                    });
                    if(index){
                        cb({
                            success:false,
                            error:"ALREADY JOINED"
                        });                        
                    }else{
                        user.groups.push(group._id);
                        group.users.push(data._id);
                        user.save().then(()=>{
                            group.save().then(()=>{

                                groupIdToNameMap[data.groupId]=group.name;
                                socket.join(group.name);

                                cb({
                                    success:true,
                                    data:group.messages
                                });
                            }).catch((e:Error)=>{
                                cb({
                                    success:false,
                                    error:"SERVER ERROR"
                                });
                                user.groups=user.groups.filter((con:string)=>{
                                    return con.toString()!=data.groupId;
                                });
                                user.save().then(()=>{}).catch(()=>{});
                            });
                        }).catch((e:Error)=>{
                            cb({
                                success:false,
                                error:"SERVER ERROR"
                            });
                        });
                    }
                }else{
                    cb({
                        success:false,
                        error:"INVALID IDS"
                    });
                }
            }catch(e){
                cb({
                    success:false,
                    error:"SERVER ERROR"
                });
            }
            
        });

        // Create a conversion
        socket.on('create-conversion',async (data:{
            _id:string,
            friendId:string
        },cb:(args:any)=>{})=>{
            try{
                let user=await User.findById(data._id);
                let friend=await User.findById(data.friendId);
                if(user && friend){
                    let conversation=await Conversation.create({
                        personOne:data._id,
                        personTwo:data.friendId
                    });
                    if(conversation){
                        user.conversations.push(conversation._id);
                        friend.conversations.push(conversation._id);
                        user.save().then(()=>{
                            friend.save().then(()=>{
                                // new-conversation
                                if(mapUserIdToSocketId[data.friendId] && connectedClients[mapUserIdToSocketId[data.friendId]]){
                                    connectedClients[mapUserIdToSocketId[data.friendId]].emit('new-conversation',{
                                        userId:data._id,
                                        userName:user.name,
                                        userPic:user.pic
                                    });
                                }
                                cb({
                                    success:true
                                });
                            }).catch((err:Error)=>{
                                cb({
                                    success:false,
                                    error:"SERVER ERROR"
                                });   
                                Conversation.findByIdAndDelete(conversation._id)
                                .then(()=>{}).catch(()=>{});
                                user.conversations=user.conversations.filter((con:string)=>{
                                    return con.toString()!=conversation._id.toString();
                                });
                                user.save().then(()=>{}).catch(()=>{});
                            });
                        }).catch((err:Error)=>{
                            cb({
                                success:false,
                                error:"SERVER ERROR"
                            });    
                        });
                    }else{
                        cb({
                            success:false,
                            error:"SERVER ERROR"
                        });
                    }
                }else{
                    cb({
                        success:false,
                        error:"INVALID IDS"
                    });
                }
            }catch(e){
                cb({
                    success:false,
                    error:"SERVER ERROR"
                });
            }
            
            // new-conversation to friendId
            // send a response reply to _id

            /*
                // server-side
                io.on("connection", (socket) => {
                socket.on("update item", (arg1, arg2, callback) => {
                    console.log(arg1); // 1
                    console.log(arg2); // { name: "updated" }
                    callback({
                    status: "ok"
                    });
                });
                });

                // client-side
                socket.emit("update item", "1", { name: "updated" }, (response) => {
                console.log(response.status); // ok
                });
            */

        });

        // Get recent chats
        socket.on('recent-chats',async (data:{
            type:"CONVERSATION" | "GROUP",
            _id:string,
            conversationId?:string,
            groupId?:string
        },cb:(args:any)=>{})=>{
            try{
                let chattingKeeper=(data.type==='GROUP')?(
                    await Group.findById(data.groupId)
                    .slice('messages',-60)
                    .populate('messages')
                ):(
                    await Conversation.findById(data.conversationId)
                    .slice('messages',-60)
                    .populate('messages')
                );
                if(chattingKeeper){
                    let check=false;
                    if(data.type==='GROUP'){
                        let checkPresent=chattingKeeper.users.find((id:string)=>{
                            return id.toString()==data._id;
                        });
                        if(checkPresent) check=true;
                    }else{
                        if(chattingKeeper.personOne.toString()==data._id) check=true;
                        if(chattingKeeper.personTwo.toString()==data._id) check=true;
                    }
                    if(check){

                        if(data.type==='GROUP'){
                            groupIdToNameMap[data.groupId!]=chattingKeeper.name;
                            socket.join(chattingKeeper.name);
                        }

                        cb({
                            success:true,
                            data:chattingKeeper.messages
                        });
                    }else{
                        cb({
                            success:false,
                            error:"NOT AVALILABLE FOR YOU"
                        });
                    }
                }else{
                    cb({
                        success:false,
                        error:"INVALID ID"
                    });
                }
            }catch(e){
                cb({
                    success:false,
                    error:"SERVER ERROR"
                });
            }
        });

        // Send a message
        socket.on('send-message',(data:{
            type:"CONVERSATION" | "GROUP",
            _id:string,
            // Message Contents
            message:string,
            pics:string[],
            attachments:string[],
            // Optinal Values depends on type
            friendId?:string,
            groupId?:string
        })=>{

            // add the message to its corresponding container
            // send it to others not the socket
            

        });

        // Indicate Typing
        socket.on('typing',(data:{
            _id:string,
            name:string,
            type:"CONVERSATION" | "GROUP",
            // Optinal Values depends on type
            friendId?:string,
            groupId?:string
        })=>{
            if(data.type==='GROUP'){
                if(data?.groupId && groupIdToNameMap[data.groupId]){
                    socket.to(groupIdToNameMap[data.groupId]).emit('someone-typing',{
                        type:"GROUP",
                        name:data.name,
                        typeId:data.groupId
                    });
                }
            }else{
                if(data?.friendId && mapUserIdToSocketId[data.friendId] && connectedClients[mapUserIdToSocketId[data.friendId]]){
                    connectedClients[mapUserIdToSocketId[data.friendId]].emit('someone-typing',{
                        type:"CONVERSATION",
                        name:data.name,
                        typeId:data.friendId
                    });
                }
            }
        });

        // ADD ONS LATER****


        // *****

        // On Disconnect remove it from the connected clients map
        socket.on('disconnect',()=>{
            if(connectedClients[socket.id]){
                delete connectedClients[socket.id];
            }
        });
    });

};

export default  _;
