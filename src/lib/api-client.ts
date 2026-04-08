export type ApiError = {
  error: string;
};

async function safeReadJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function apiJson<T>(
  input: string,
  init?: Omit<RequestInit, "headers"> & { headers?: Record<string, string> }
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": "application/json",
    },
  });

  const body = await safeReadJson(res);

  if (!res.ok) {
    const message =
      typeof body === "object" && body && "error" in body && typeof (body as ApiError).error === "string"
        ? (body as ApiError).error
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return body as T;
}

