import mongoose, {Schema, model} from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
const videoSchema = new Schema({
    videoFile:{
        type: String,
        required: true,
    },
    thumbnail:{
        type: String,
        required: true,
    },  
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    duration:{
        type:Number
    }
},{timestamps: true})

mongoose.plugin(mongooseAggregatePaginate)

export const Video = model("Video", videoSchema)