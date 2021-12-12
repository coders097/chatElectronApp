import mongoose from 'mongoose';

let messageSchema=new mongoose.Schema({
    sender:{
        type:mongoose.Types.ObjectId,
        ref:"user"
    },
    timeStamp:{
        type:Date,
        default:Date.now
    },
    message:{
        type:String
    },
    attachments:[{
        type:String
    }]
});

export default mongoose.model("message",messageSchema);