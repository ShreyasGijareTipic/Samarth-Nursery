import { host } from './constants'
import { deleteUserData, getToken } from './session'

export async function login(data) {
  return await postOrPutData(host + '/api/login', data)
}

export async function register(data) {
  return await postOrPutData(host + '/api/register', data)
}

/**
 * Posts data to a URL and returns the response as JSON.
 *
 * @param {string} url - The URL to post to.
 * @param {object} data - The data to post.
 * @returns {Promise<object>} A promise that resolves to the response data.
 * 
 * 
 */
export async function postFormData(url = '', data ) {
  try {
    const token = getToken()
    const response = await fetch(url, {
      method: "POST",
      headers: {
        // 'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: data,
    })

    if (!response.ok) {
      if (response.status === 401 && !url.includes('/login')) {
        // handle unauthorized
        deleteUserData()
        window.location.replace('/')
      }
      if (response.status === 422) {
        const error = await response.json()
        if (error.message) {
          throw new Error(error.message)
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error posting data:', error)
    throw error
  }
}


async function postOrPutData(url = '', data = {}, method = 'POST') {
  try {
    const token = getToken()
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401 && !url.includes('/login')) {
        // handle unauthorized
        deleteUserData()
        window.location.replace('/')
      }
      if (response.status === 422) {
        const error = await response.json()
        if (error.message) {
          throw new Error(error.message)
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error posting data:', error)
    throw error
  }
}

async function getOrDelete(url = '', method = 'GET') {
  try {
    const token = getToken()
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // handle unauthorized
        deleteUserData()
        window.location.replace('/')
      }
      if (response.status === 422) {
        const error = await response.json()
        if (error.message) {
          throw new Error(error.message)
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error posting data:', error)
    throw error
  }
}

export async function logout() {
  return await postOrPutData(host + '/api/logout')
}

export async function post(api, data) {
  return await postOrPutData(host + api, data)
}

export async function put(api, data) {
  return await postOrPutData(host + api, data, 'PUT')
}

export async function getAPICall(api) {
  return await getOrDelete(host + api)
}

export async function deleteAPICall(api) {
  return await getOrDelete(host + api, 'DELETE')
}
