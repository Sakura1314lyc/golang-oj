const API_BASE = 'http://localhost:8080/api'

function getToken() {
  return localStorage.getItem('gooj_token')
}

export function setToken(token) {
  if (token) localStorage.setItem('gooj_token', token)
  else localStorage.removeItem('gooj_token')
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

// Unwrap paginated API responses: extract the inner data array
function paginated(path, options = {}) {
  return request(path, options).then((res) => (res && res.data) || res)
}

export const api = {
  // Auth
  register: (username, password) =>
    request('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }),

  login: (username, password) =>
    request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }),

  getProfile: () => request('/profile'),

  // Problems (paginated)
  getProblems: () => paginated('/problems'),
  getProblem: (id) => request(`/problems/${id}`),

  // Submissions
  submit: (problemId, language, code) =>
    request('/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problem_id: problemId, language, code }) }),

  getStatus: (id) => request(`/status/${id}`),
  getSubmissions: () => paginated('/submissions'),

  // Contests (returns plain array, no pagination wrapper)
  getContests: () => request('/contests'),

  // Leaderboard (paginated)
  getLeaderboard: () => paginated('/leaderboard'),
}
