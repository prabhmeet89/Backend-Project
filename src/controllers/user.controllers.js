import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/Apiresponse.js";

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

export {userRegister}