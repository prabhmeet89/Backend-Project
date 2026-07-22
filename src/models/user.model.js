import mongoose ,{Schema}  from "mongoose";
import jwt from "jsonwebtoken";  // yeh ek berarer token hai mtlb jiske pass hai usse data bhej do chabi ki trh hai
import bycrypt from "bcrypt"

const userSchmea = new Schema(
    {
        username : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        email : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        fullname : {
            type: String,
            required: true,
            trim: true,
            idex: true
        },

        avatar: {
            type: String,  // cloudniary url mtlb yaha par phot video uploads hoti or wo ek url bhej deta hai unn photo video ka
            required: true

        },

        coverImage: {
            type: String
        },

        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Videos"
            }
        ],

        password: {
            type: String,
            required: [true , 'Password is required']
        },
        
        refreshToken: {
            type: String
        }

    },

    {
        timestamps: true
    }
)

userSchmea.pre( "save" , async function () {   // save ek event hai mtlb save krne se pehle yeh function chal do pre ka yeh kaam hota hai
    if(!this.isModified("password")) return 
    this.password = await bycrypt.hash(this.password , 10) // yeh number bss rounds bta rha
}) 

userSchmea.methods.isPasswordCorrect = async function 
(password) {
    return await bycrypt.compare(password , this.password) // compare true or flase value dega or yeh idhr normal pss or encrypt wala pss compare kar rha hai
}

userSchmea.methods.generateAccessToken = async function ()
 {
    return jwt.sign(  // yeh jo sign hai yeh token bnata hai
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET, 
        { // expiry ka syntax aise he likhte hai
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY

        }
)
    
}

userSchmea.methods.generateRefreshToken = async function ()  // refresh token details kam rkhta hai kyu ki baar baar refresh hota hai
 {
    return jwt.sign(  // yeh jo sign hai yeh token bnata hai 
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET, 
        { // expiry ka syntax aise he likhte hai
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY

        }
)
    
}





// but yeh har baar password ko encrypt kr deta baar baar change krdega isiliye hum ek if condition lgaenge

export const User = mongoose.model("User", userSchmea)