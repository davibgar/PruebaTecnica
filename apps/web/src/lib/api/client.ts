/**
 * Cliente HTTP único hacia el backend NestJS. Centraliza la URL base, el header
 * multi-tenant `x-business-id` y el manejo de errores (toda respuesta no-2xx se
 * convierte en `ApiError` con el mensaje que envía Nest).
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const BUSINESS_ID =
  process.env.NEXT_PUBLIC_BUSINESS_ID ??
  "11111111-1111-1111-1111-111111111111";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const baseHeaders: HeadersInit = {
  "x-business-id": BUSINESS_ID,
};

async function toError(res: Response): Promise<ApiError> {
  let message = `Error ${res.status}`;
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (body?.message) {
      message = Array.isArray(body.message)
        ? body.message.join(", ")
        : body.message;
    }
  } catch {
    // respuesta sin cuerpo JSON: nos quedamos con el status
  }
  return new ApiError(res.status, message);
}

/** GET/POST/PATCH que devuelve JSON tipado. */
export async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...baseHeaders, ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    throw await toError(res);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

/** Descarga binaria (export CSV/PDF): devuelve el Blob para forzar la descarga. */
export async function requestBlob(path: string): Promise<Blob> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: baseHeaders,
    cache: "no-store",
  });
  if (!res.ok) {
    throw await toError(res);
  }
  return res.blob();
}

/** Serializa un objeto de filtros a query string, omitiendo claves vacías. */
export function toQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, value);
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
