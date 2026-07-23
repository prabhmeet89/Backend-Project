import { Router } from "express";
import { userRegister, loginUser , logoutUser, refreshAcessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, GetUserProfileChannel, getWatchHistory } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
     upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
      userRegister
    )
router.route("/login").post(loginUser)

// secured routes

router.route("/logout").post(verifyJWT , logoutUser)
router.route("/refresh-Token").post(refreshAcessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)  // verify jwt check kar rha hai ki user logged in hai ki ni middleware 
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-Account detail").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar") ,updateUserAvatar)
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage") ,updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,GetUserProfileChannel) // params wale mai (url) mai humne oehle se he username bata rkha hai to usme routes iis tarike se likhte hai
router.route("/History").get(verifyJWT,getWatchHistory)
export default router