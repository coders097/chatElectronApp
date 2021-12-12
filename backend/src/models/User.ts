import mongoose from 'mongoose';

let userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    pic:{
        type:String,
        required:true
    },
    groups:[{
        type:mongoose.Types.ObjectId,
        ref:"group"
    }],
    conversations:[{
        type:mongoose.Types.ObjectId,
        ref:"conversation"
    }],
    creationDate:{
        type:Date,
        default:Date.now
    }
});

export default mongoose.model("user",userSchema);
