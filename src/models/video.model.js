import mongoose , {Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";  // aggregation pipelines

const videoSchema = new Schema(
    {
        videofile: {
            type: String, //  claodinary url
            required: true
        },

        thumbnail: {
            type: String, //  claodinary url
            required: true
        },

        title: {
            type: String, //  claodinary url
            required: true
        },

        desciption: {
            type: String, 
            required: true
        },

        duration: {
            type: Number, //  claodinary url
            required: true
        },

        views: {
            type: Number, //  claodinary url
            default: 0
        },

        isPublished: {
            type: Boolean,
            default: true
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },

    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Videos = mongoose.model("Videos", videoSchema)  


// bcrypt package used for password hashing  