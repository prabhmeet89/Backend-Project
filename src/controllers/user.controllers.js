import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        console.log("Real error",error)
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const userRegister = asyncHandler(async (req ,res) => {
    // get user details from frontend  // yeh saare steps hai kaise user register hoga
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullname, email, username, password } = req.body   // yrh user se yeh sab detail mangne ke liye
    //console.log("email: ", email);

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")  // yeh check kar rha hai ki koi bhi field bhi empty to ni hai agr hai to apirror throw kar rha 
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]  // yeh find kar rha ki same email or username na ho  yeh$or operator
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;  // yeh isiliye likha kyu ki jab hum postman mai data daal rahe hai to agr hum coverImage ki files pass na kare to error show kar rha hai jab ki hume isse campoulsary ni bola ki honi he chiye isilye yeh code likha hia 
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary (avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const userCreated = await User.findById(user._id).select( "-password -refreshToken") // yeh check kar rha hhai ki user empty to ni id find krke agar id mil jaaye to means user create hogya hai,  yeh .select jo hai chaining mai use hota hai iska kaam hai ki field select krna ki kosni pass krni hai but - lga kar menas ki yeh pass ni karna 

    if (!userCreated) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(200).json(
        new ApiResponse(201 , userCreated , "User register succesfully") // yeh new object bnaya hai hum api response jo return kar rha hia response ki user register hogya hai
    )

})

const loginUser = asyncHandler(async (req,res) => {
// steps 
// request body
// email or username jisse login krwana hai
// find user hai ki ni iss username email se
// fir password check agr galt hai to msg bhej do wrong , agr sahi hai to
// access token and refresh token bhej do
// or yeh hum secure cooies mai bhejenge

const {email,username,password} = req.body

if (!(username || email)) {  // checking if user provide email or username
    throw new ApiError(400 , "email or username is required")
}

const user = await User.findOne({  //or yeh find one jaise he pehli value jo match milti return kar deta hao
    $or : [{username},{email}]  // isk mtlb yeh ki ya to email mil jaye ya username mil jaye to return krdo true or false
})

if (!user) {
    throw new ApiError(404 , "user does not exist")
}

const isValidPass = await user.isPasswordCorrect(password)

if (!isValidPass) {
    throw new ApiError(404 , "password in valid")
}

const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)

const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

const options = {  // yeh cookies ke liye hai
        httpOnly: true, // jab hum yeh true kar dete hai to bss server se yeh modified ho skti hai frontend se ni
        secure: true
    }

return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(  // yeh data dera hai
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )    


})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(  // yehid find bhi find kar leta hai or fir update bhi kar deta hai
        req.user._id,
        {
            $set: {
                refreshToken: undefined // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {  // cookie delete krne ke liye
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)  // method hai
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})

const refreshAcessToken = asyncHandler(async (req,res) => {
    const IncomingRefreshtoken = req.cookie.refreshToken || req.body.refreshToken // yeh body wala agr koi appp se try kar rha ho uske liye
    if (!IncomingRefreshtoken) {
     throw ApiError(401, "Unothourised Request")
    }

const decodedToken = jwt.verify(
    IncomingRefreshtoken,
    process.env.REFRESH_TOKEN_SECRET
) 

const user = await User.findById(decodedToken?._id)  // yeh last mai ek wrapper likha hai ki decoded wale se id store krdo user mai

if (!user) {
    throw ApiError(401 , "Invalid token")
}

if (IncomingRefreshtoken !== user?.refreshToken) {  // yeh check karne ke liye ki incomig token or jo token pehle se hai same hai ki ni agr same ni hai error show krdo
    throw ApiError(401 , "Refresh Token is expired or used")
}

const option = {  // yeh cookie ke liye
    httpOnly : true,
    secure : true
}

const {accessToken, newrefreshToken} = await generateAccessAndRefereshTokens()

return res 
.status(200)
.cookie("accessToken" , accessToken , option)
.cookie("refreshToken" , newrefreshToken , option)
.json(
    new ApiResponse(
    200,
    {accessToken,
    refreshToken : newrefreshToken},
    "Access Token Refresh"
    ) 
)
})

export {userRegister , loginUser,logoutUser,refreshAcessToken}