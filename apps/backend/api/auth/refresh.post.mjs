import { defineEventHandler } from 'h3'
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
  setRefreshTokenCookie
} from '../../utils/cookie-utils.mjs'
import {
  generateAccessToken,
  verifyRefreshToken
} from '../../utils/jwt-utils.mjs'
import { MOCK_USERS } from '../../utils/mock-data.mjs'
import { forbiddenResponse, useResponseSuccess } from '../../utils/response.mjs'

export default defineEventHandler(async (event) => {
  const refreshToken = getRefreshTokenFromCookie(event)
  if (!refreshToken) {
    return forbiddenResponse(event, '登录状态已失效')
  }

  clearRefreshTokenCookie(event)

  const userinfo = verifyRefreshToken(refreshToken)
  if (!userinfo) {
    return forbiddenResponse(event, '登录状态已失效')
  }

  const findUser = MOCK_USERS.find(
    (item) => item.username === userinfo.username
  )
  if (!findUser) {
    return forbiddenResponse(event, '登录状态已失效')
  }
  const accessToken = generateAccessToken(findUser)

  setRefreshTokenCookie(event, refreshToken)

  return useResponseSuccess(accessToken)
})
