const TOKEN_COOKIE = "sf_token"

/** Mirrors the token into a cookie (in addition to localStorage) so middleware.ts can gate protected routes server-side. */
export function setAuthSession(token: string, user: unknown) {
  localStorage.setItem("sf_token", token)
  localStorage.setItem("sf_user", JSON.stringify(user))
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
}

export function clearAuthSession() {
  localStorage.removeItem("sf_token")
  localStorage.removeItem("sf_user")
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`
}
