/**
 * Stores user data in localStorage.
 *
 * @param {object} userData - The user data to store.
 */
export function storeUserData(userData) {
  localStorage.setItem('userData', JSON.stringify(userData));
}

/**
 * Deletes user data from localStorage.
 */
export function deleteUserData() {
  localStorage.removeItem('userData')
}

export function isLogIn() {
  return !!localStorage.getItem('userData')
}

export function getToken() {
  const userData = JSON.parse(localStorage.getItem('userData'))
  return userData ? userData.token : null
}

export function getUserType() {
  const userData = JSON.parse(localStorage.getItem('userData'))
  return userData ? userData.user.type : null
}

export function getUserData() {
  const userData = JSON.parse(localStorage.getItem('userData'))
  return userData ? userData.user : null
}
