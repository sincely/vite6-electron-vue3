import { deleteCookie, getCookie, setCookie } from 'h3';

export function clearRefreshTokenCookie(event) {
  deleteCookie(event, 'jwt', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });
}

export function setRefreshTokenCookie(event, refreshToken) {
  setCookie(event, 'jwt', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60, // unit: seconds
    sameSite: 'none',
    secure: true,
  });
}

export function getRefreshTokenFromCookie(event) {
  const refreshToken = getCookie(event, 'jwt');
  return refreshToken;
}
