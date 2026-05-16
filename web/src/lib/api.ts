const BASE_URL = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function getProducts() {
  return request<{ data: import("./types").Product[] }>("/products");
}

export async function getProductById(id: string) {
  return request<{ data: import("./types").Product }>(`/products/${id}`);
}

export async function getStock(params?: { product_id?: string; region?: string }) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : "";
  return request<{ data: import("./types").StockEntry[] }>(`/stock${query}`);
}

export async function getSucursales() {
  return request<{ data: import("./types").Sucursal[] }>("/sucursales");
}

export async function getTestDriveSlots() {
  return request<{ data: import("./types").TestDriveSlot[] }>("/test-drive/slots");
}

export async function createTestDriveLead(data: {
  nombre: string;
  celular: string;
  ciudad: string;
  producto: string;
}) {
  return request<{ success: boolean; id: string }>("/test-drive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
