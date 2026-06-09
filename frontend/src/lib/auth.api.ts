import api from '@/lib/api'

export interface LoginData {
  email: string
  password: string
  captchaToken: string
  captchaAnswer: string
}

export interface CaptchaResponse {
  token: string
  question: string
}

export const authApi = {
  getCaptcha: () => api.get<CaptchaResponse>('/auth/captcha').then((r) => r.data),
  login: (data: LoginData) =>
    api
      .post<{ accessToken: string; user: { id: number; email: string; name: string; role: string } }>(
        '/auth/login',
        data,
      )
      .then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
}
