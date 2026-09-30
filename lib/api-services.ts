const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response.json()
}

export const productService = {
  list: (params = '') => request(`/products${params}`),
  getById: (id: string) => request(`/products/${id}`),
  getByBarcode: (barcode: string) => request(`/products/barcode/${encodeURIComponent(barcode)}`),
  create: (payload: unknown) => request('/products', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: unknown) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),
}

export const inventoryService = {
  list: () => request('/inventory'),
  adjust: (payload: unknown) => request('/inventory/adjust', { method: 'POST', body: JSON.stringify(payload) }),
}

export const salesService = {
  list: (params = '') => request(`/sales${params}`),
  create: (payload: unknown) => request('/sales', { method: 'POST', body: JSON.stringify(payload) }),
}

export const customerService = {
  list: (params = '') => request(`/customers${params}`),
  create: (payload: unknown) => request('/customers', { method: 'POST', body: JSON.stringify(payload) }),
}

export const supplierService = {
  list: (params = '') => request(`/suppliers${params}`),
  create: (payload: unknown) => request('/suppliers', { method: 'POST', body: JSON.stringify(payload) }),
}

export const dashboardService = { getSummary: () => request('/dashboard') }
export const reportService = { sales: (params = '') => request(`/reports/sales${params}`) }

export { request }
