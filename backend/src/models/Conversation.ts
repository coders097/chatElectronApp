import mongoose from 'mongoose';

let conversationSchema=new mongoose.Schema({
    personOne:{
        type:mongoose.Types.ObjectId,
        ref:"user"
    },
    personTwo:{
        type:mongoose.Types.ObjectId,
        ref:"user"
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

export default mongoose.model("conversation",conversationSchema);