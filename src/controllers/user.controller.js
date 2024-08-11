import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinaryService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};

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

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All Filed is required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    // console.log(existedUser);
    if (existedUser) {
        throw new ApiError(409, "User With email or username already existed ");
    }
    const avatarImageLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarImageLocalPath) {
        throw new ApiError(400, "Avatar File is Required");
    }

    const avatar = await uploadOnCloudinary(avatarImageLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar Cloudinary File is Required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password,
    });
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        throw new ApiError(
            "500",
            "Something went wrong while registering the user"
        );
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User register Successfully"));
});

//get input in frontend
//check validation are not empty
//check username || email existed in db
// check password true and access and refresh token
// send response

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!existedUser) {
        throw new ApiError(404, "User does not exist");
    }
    const isPasswordValid = await existedUser.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Password incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        existedUser._id
    );
    const loggedInUser = await User.findById(existedUser._id).select(
        "-password -refreshToken"
    );
    const option = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User LoggedIn Successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );
    const option = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponse(200, {}, "User Logout success"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "UnAuthorized Request");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Refresh Token Invalid");
        }

        //compare token first is incomingRefreshToken and sec is database stored refreshToken

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is Expired or Used");
        }

        const option = {
            httpOnly: true,
            secure: true,
        };
        const { accessToken, RefreshToken } =
            await generateAccessAndRefreshToken(user._id);

        res.status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        RefreshToken,
                    },
                    "Access Token Refreshed"
                )
            );
    } catch (error) {
        throw ApiError(401, error?.message || "Invalid Refresh Token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old Password Is Not Valid");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Change SuccessFully"));
});

const getCurrentUser = asyncHandler(async (req, _) => {
    return new ApiResponse(200, req.user, "Current User Fetch SuccessFully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All Filed are required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account Details Updated!"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalFilePath = req.file?.path;
    if (!avatarLocalFilePath) {
        throw new ApiError(400, "Avatar File is missing");
    }
    const avatar = await uploadOnCloudinary(avatarLocalFilePath);

    if (!avatar) {
        throw new ApiError(400, "Error while uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password");

    if (!user) {
        throw new ApiError(400, "Avatar File Not Update");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar File Update Successfully"));
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalFilePath = req.file?.path;
    if (!coverImageLocalFilePath) {
        throw new ApiError(400, "coverImage File is missing");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalFilePath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on coverImage");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        { new: true }
    ).select("-password");  

    if (!user) {
        throw new ApiError(400, "coverImage File Not Update");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "coverImage File Update Successfully")
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
};
