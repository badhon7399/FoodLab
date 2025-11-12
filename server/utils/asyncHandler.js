import asyncHandler from 'express-async-handler'

const asyncWrap = (fn) => asyncHandler(fn)

export default asyncWrap
