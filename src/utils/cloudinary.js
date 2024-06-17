import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET // Click 'View Credentials' below to copy your API secret
});

const uploadCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return console.error('localFilePath not found');
       const response = await cloudinary.uploader.upload( localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        console.log("file uploaded successfully",response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return console.error("remove the local path")
    }
}

export {uploadCloudinary}