// const asyncHandler = (func) => async (req, res, next) =>{
//     try {
//         await func(res, req, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//         throw error
//     }
// }

const asyncHandler = (requestHandler) =>  (res, req, next) =>{
     Promise.resolve(
        requestHandler(res, req, next)
     ).catch((error)=> next(error))
}
export default  asyncHandler;