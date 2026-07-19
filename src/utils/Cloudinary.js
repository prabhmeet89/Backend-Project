import { v2 as cloudinary} from "cloudinary";
import fs from "fs" // fs is file system it is used to do file operation like read write and many more

cloudinary.config(
    {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}
);

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {  // yeh sab documentation mai likha konsa method use kia
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed  unlink kR DETe haI FILE local path server se mtlb use kr skte ya smj lo dellete hogi
        return null;
    }
}



export {uploadOnCloudinary}