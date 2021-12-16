import mongoose, { mongo } from 'mongoose';

let groupSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    users:[{
        type:mongoose.Types.ObjectId,
        ref:"user"
    }],
    pic:{
        type:String,
        required:true
    },
    messages:[{
        type:mongoose.Types.ObjectId,
        ref:"message"
    }],
    creationDate:{
        type:Date,
        default:Date.now
    }
});

export default mongoose.model("group",groupSchema);