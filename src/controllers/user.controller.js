import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiHandler.js";
import { User } from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinaryService.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty
    // check if user is already exist :- username, email
    //check for img , check for avatar
    // upload them to cloudinary , check avatar
    //create user object- create entry in db
    // remove password and refresh token filed form response
    // check for user creation 
    // return response

    const { fullName, username, email, password } = req.body;
    console.log("email: ", email);
    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All Filed is required");
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }],
    });

    console.log(existedUser);
    if (existedUser) {
        throw new ApiError(409, "User With email or username already existed ");
    }
    const avatarImageLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarImageLocalPath){
        throw new ApiError(400, "Avatar File is Required");
    }

    const avatar = await uploadOnCloudinary(avatarImageLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar File is Required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password,
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError("500", "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, "User register Successfully")
    )
});

export { registerUser };
