import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token")
      window.location.href = "/admin"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: async (password: string) => {
    const response = await apiClient.post("/auth/admin/login", { password })
    return response.data
  },

  verifyToken: async (token: string) => {
    try {
      const response = await apiClient.get("/auth/admin/verify", {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data.valid
    } catch {
      return false
    }
  },

  logout: async (token: string) => {
    await apiClient.post(
      "/auth/admin/logout",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
  },
}

// Students API
export const studentsAPI = {
  getAll: async (params?: any) => {
    const response = await apiClient.get("/students", { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/students/${id}`)
    return response.data
  },

  create: async (studentData: any) => {
    const response = await apiClient.post("/students", studentData)
    return response.data
  },

  update: async (id: string, studentData: any) => {
    const response = await apiClient.put(`/students/${id}`, studentData)
    return response.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/students/${id}`)
    return response.data
  },

  togglePayment: async (id: string, monthNumber: number) => {
    const response = await apiClient.patch(`/students/${id}/progress/${monthNumber}/payment`)
    return response.data
  },

  getStats: async () => {
    const response = await apiClient.get("/students/stats/dashboard")
    return response.data
  },
}

// Attendance API
export const attendanceAPI = {
  markAttendance: async (data: any) => {
    const response = await apiClient.post("/attendance/mark", data)
    return response.data
  },

  bulkMarkAttendance: async (data: any) => {
    const response = await apiClient.post("/attendance/bulk-mark", data)
    return response.data
  },

  getStudentAttendance: async (studentId: string, params?: any) => {
    const response = await apiClient.get(`/attendance/student/${studentId}`, { params })
    return response.data
  },

  getDateAttendance: async (date: string) => {
    const response = await apiClient.get(`/attendance/date/${date}`)
    return response.data
  },
}

// Schedule API
export const scheduleAPI = {
  getAll: async (params?: any) => {
    const response = await apiClient.get("/schedule", { params })
    return response.data
  },

  create: async (scheduleData: any) => {
    const response = await apiClient.post("/schedule", scheduleData)
    return response.data
  },

  update: async (id: string, scheduleData: any) => {
    const response = await apiClient.put(`/schedule/${id}`, scheduleData)
    return response.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/schedule/${id}`)
    return response.data
  },
}

export default apiClient
