/* ===== Shared types for Quantum Guide ===== */

export type Product = {
  id: string;
  nombre: string;
  categoria: "VEHICULO" | "ACCESORIO" | "BATERIA" | "SERVICIO";
  precio: { monto: number; moneda: string };
  descripcion_corta: string;
  especificaciones: Record<string, number | string>;
  colores: string[];
  media: string[];
};

export type StockEntry = {
  product_id: string;
  region: string;
  sucursal_id: string;
  cantidad: number;
  estado: "DISPONIBLE" | "BAJO_STOCK" | "SIN_STOCK";
  ultima_actualizacion: string;
};

export type Sucursal = {
  id: string;
  ciudad: string;
  direccion: string;
  horario: string;
  telefono: string;
  maps_url: string;
};

export type TestDriveSlot = {
  region: string;
  sucursal_id: string;
  dias_horarios: string;
  requisitos: string;
};

export type MediaItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  title: string;
  product_id: string;
};

export type Dataset = {
  products: Product[];
  stock: StockEntry[];
  sucursales: Sucursal[];
  test_drive: TestDriveSlot[];
  media: MediaItem[];
};

/* Chat */
export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  timestamp: number;
};

/* Intent engine output */
export type Intent =
  | "WELCOME"
  | "VEHICLE"
  | "STOCK"
  | "SUCURSALES"
  | "TEST_DRIVE"
  | "UNKNOWN";

export type IntentResult = {
  intent: Intent;
  reply: string;
  productId?: string;
};

/* ===== Conversation engine ===== */
export type ConversationStep =
  | "WELCOME"
  | "ASKING_TYPE"
  | "ASKING_USE"
  | "ASKING_BUDGET"
  | "SHOWING_RESULTS"
  | "VEHICLE_DETAIL"
  | "SUCURSALES"
  | "TEST_DRIVE"
  | "UNKNOWN";

export type UserFilters = {
  type?: string;      // auto | moto | bici | camion | bus | accesorio | bateria
  use?: string;       // ciudad | delivery | carga | turismo | familia
  budget?: number;    // en BOB
  currency?: string;
};

export type ConversationContext = {
  step: ConversationStep;
  filters: UserFilters;
  lastProductId?: string;
  results?: string[]; // IDs de productos mostrados en el último paso
};

export type ConversationResult = {
  reply: string;
  context: ConversationContext;
  intent: Intent;
  productId?: string;
  productIds?: string[]; // para mostrar grid de resultados
};
