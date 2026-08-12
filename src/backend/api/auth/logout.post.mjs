import { defineEventHandler } from 'h3';
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
} from '../../utils/cookie-utils.mjs';
import { useResponseSuccess } from '../../utils/response.mjs';

export default defineEventHandler(async (event) => {
  const refreshToken = getRefreshTokenFromCookie(event);
  if (!refreshToken) {
    return useResponseSuccess('');
  }

  clearRefreshTokenCookie(event);

  return useResponseSuccess('');
});
