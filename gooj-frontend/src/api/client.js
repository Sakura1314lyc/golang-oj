const API_BASE = 'http://localhost:8080/api'
const TOKEN_KEY = 'ark_oj_token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getAuthHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const headers = { ...getAuthHeaders(), ...options.headers }
  const res = await fetch(url, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '请求失败')
  return data
}

function paginated(path, options = {}) {
  return request(path, options).then((res) => (res && res.data) || res)
}

function paginatedWithMeta(path, options = {}) {
  return request(path, options).then((res) => {
    if (res && res.data && res.pagination) return res
    if (Array.isArray(res)) return { data: res, pagination: null }
    return { data: res || [], pagination: null }
  })
}

export const api = {
  register: (username, password) =>
    request('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }),

  login: (username, password) =>
    request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }),

  getProfile: () => request('/profile'),
  updateProfile: (data) =>
    request('/profile/update', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),

  getProblems: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.q) qs.set('q', params.q)
    if (params.difficulty) qs.set('difficulty', params.difficulty)
    if (params.tag) qs.set('tag', params.tag)
    if (params.page) qs.set('page', params.page)
    if (params.page_size) qs.set('page_size', params.page_size)
    const query = qs.toString()
    return paginated(`/problems${query ? '?' + query : ''}`)
  },
  getProblem: (id) => request(`/problems/${id}`),

  submit: (problemId, language, code) =>
    request('/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problem_id: problemId, language, code }) }),

  getStatus: (id) => request(`/status/${id}`),
  getSubmissions: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.problem_id) qs.set('problem_id', params.problem_id)
    if (params.status) qs.set('status', params.status)
    if (params.page) qs.set('page', params.page)
    if (params.page_size) qs.set('page_size', params.page_size)
    const query = qs.toString()
    return paginated(`/submissions${query ? '?' + query : ''}`)
  },
  getMySubmissions: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.status) qs.set('status', params.status)
    if (params.page) qs.set('page', params.page)
    if (params.page_size) qs.set('page_size', params.page_size)
    const query = qs.toString()
    return paginatedWithMeta(`/my/submissions${query ? '?' + query : ''}`)
  },

  getContests: () => request('/contests'),
  getLeaderboard: () => paginated('/leaderboard'),
  getAnnouncements: () => request('/announcements'),
}
