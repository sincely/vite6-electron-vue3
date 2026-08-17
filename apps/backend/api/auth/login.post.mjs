import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie
} from '../../utils/cookie-utils.mjs'
import {
  generateAccessToken,
  generateRefreshToken
} from '../../utils/jwt-utils.mjs'
import { MOCK_USERS } from '../../utils/mock-data.mjs'
import {
  forbiddenResponse,
  useResponseError,
  useResponseSuccess
} from '../../utils/response.mjs'

export default defineEventHandler(async (event) => {
  const { password, username } = await readBody(event)
  if (!password || !username) {
    setResponseStatus(event, 400)
    return useResponseError(
      'BadRequestException',
      'Username and password are required'
    )
  }

  // 支持用户名或手机号登录
  const findUser = MOCK_USERS.find(
    (item) =>
      (item.username === username || item.phone === username) &&
      item.password === password
  )

  if (!findUser) {
    clearRefreshTokenCookie(event)
    return forbiddenResponse(event, '用户名或密码错误')
  }

  const accessToken = generateAccessToken(findUser)
  const refreshToken = generateRefreshToken(findUser)

  setRefreshTokenCookie(event, refreshToken)

  const { password: _pwd, ...userinfo } = findUser
  return useResponseSuccess({
    ...userinfo,
    accessToken
  })
})
