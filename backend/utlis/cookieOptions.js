const tokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000,
};

const clearTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

module.exports = {
  tokenCookieOptions,
  clearTokenCookieOptions,
};
