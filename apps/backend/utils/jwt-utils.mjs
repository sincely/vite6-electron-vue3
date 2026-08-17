import { getHeader } from 'h3'
import jwt from 'jsonwebtoken'

import { MOCK_USERS } from './mock-data.mjs'

// TODO: Replace with your own secret key
const ACCESS_TOKEN_SECRET = 'access_token_secret'
const REFRESH_TOKEN_SECRET = 'refresh_token_secret'

export function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
}

export function generateRefreshToken(user) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, {
    expiresIn: '30d'
  })
}

export function verifyAccessToken(event) {
  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader?.startsWith('Bearer')) {
    return null
  }

  const tokenParts = authHeader.split(' ')
  if (tokenParts.length !== 2) {
    return null
  }
  const token = tokenParts[1]
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)

    const username = decoded.username
    const user = MOCK_USERS.find((item) => item.username === username)
    if (!user) {
      return null
    }
    const { password: _pwd, ...userinfo } = user
    return userinfo
  } catch {
    return null
  }
}

export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET)
    const username = decoded.username
    const user = MOCK_USERS.find((item) => item.username === username)
    if (!user) {
      return null
    }
    const { password: _pwd, ...userinfo } = user
    return userinfo
  } catch {
    return null
  }
}
