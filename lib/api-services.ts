const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

// async function request<T>(path: string, options?: RequestInit): Promise<T> {
//   const response = await fetch(`${API_BASE_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
//   if (!response.ok) throw new Error(`API request failed: ${response.status}`)
//   return response.json()
// }

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `API request failed: ${response.status}`,
    );
  }

  return data as T;
}

export const productService = {
  list: (params = '') => request<any[]>(`/products${params}`),
  getById: (id: string) => request(`/products/${id}`),
  getByBarcode: (barcode: string) => request(`/products/barcode/${encodeURIComponent(barcode)}`),
  create: (payload: unknown) => request('/products/create', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: unknown) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),
}

export type InventoryItem = {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  price: number;
  stock: number;
  min_stock: number;
  category: string | null;
  supplier: string | null;
};

type InventoryResponse = {
  message: string;
  product: InventoryItem[];
};
export const inventoryService = {
  list: () => request<InventoryResponse>('/inventory'),
  adjust: (payload: unknown) => request('/inventory/adjust', { method: 'POST', body: JSON.stringify(payload) }),
}
export type Sale = {
  id: number;
  total: string;
  payment_method: string;
  status: string;
  created_at: string;
  customer: string | null;
};

export const salesService = {
  list: (params = '') => request<Sale[]>(`/sales${params}`),
  create: (payload: unknown) => request('/sales/create', { method: 'POST', body: JSON.stringify(payload) }),
}

export const customerService = {
  list: (params = '') => request(`/customers${params}`),
  create: (payload: unknown) => request('/customers', { method: 'POST', body: JSON.stringify(payload) }),
}

export type Category = {
  id: number;
  name: string;
  created_at: string;
};

export type Supplier = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
};

export const categoryService = {
  list: (params = "") => request<Category[]>(`/categories${params}`),
  create: (payload: unknown) =>
    request("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const supplierService = {
  list: (params = '') => request<Supplier[]>(`/suppliers${params}`),
  create: (payload: unknown) => request('/suppliers', { method: 'POST', body: JSON.stringify(payload) }),
}

export const dashboardService = { getSummary: () => request('/dashboard') }

export type SalesReport = {
  date: string;
  total_sales: string;
  total_revenue: string;
};


export const reportService = { sales: (params = '') => request<SalesReport[]>(`/reports/sales${params}`) }


export type LoginResponse = {
message: string;
token:string;
user: {
id: number;
name: string;
email: string;
role: string;
};
};

export type SessionResponse = {
authenticated: boolean;
user: {
id: number;
role: string;
};
};

export const authService = {
  login: (payload: { identifier: string; password: string }) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => request<SessionResponse>("/auth/me"),
};



export { request }
