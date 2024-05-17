const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    //requestHandler ko ho req,res,next chai
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// const asyncHandle = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res
//       .status(error.code || 500)
//       .json({ success: false, message: error.message });
//   }
// };
