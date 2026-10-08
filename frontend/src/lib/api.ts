// Where the generated API lives.
//
// Set at build time: the platform bakes the deployed API URL into the frontend build.
// Next.js inlines only variables whose name starts with NEXT_PUBLIC_, so the name is not
// interchangeable with the single-page app's VITE_ one. The fallback is the local backend
// so a bare `npm run dev` still points somewhere real.
//
// The generated screens do NOT use this yet -- they render seeded sample data, exactly as
// they were approved. This is the seam to replace that with real calls, one screen at a
// time.
export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${response.status}`);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

// ---- Documents ----------------------------------------------------------

export interface ApiDocument {
  id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  status: string;
  failure_reason: string | null;
  uploaded_at: string;
}

export interface DocumentListResponse {
  items: ApiDocument[];
  next_cursor: string | null;
}

export interface DocumentStatusItem {
  id: string;
  status: string;
  failure_reason: string | null;
}

export interface DocumentStatusResponse {
  statuses: DocumentStatusItem[];
}

export interface DocumentRetryResponse {
  id: string;
  status: string;
}

export interface UploadDocumentResult {
  id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  status: string;
}

export function listDocuments(params?: {
  limit?: number;
  cursor?: string;
}): Promise<DocumentListResponse> {
  const q = new URLSearchParams();
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.cursor) q.set("cursor", params.cursor);
  const qs = q.toString();
  return apiFetch<DocumentListResponse>(`/documents${qs ? `?${qs}` : ""}`);
}

export function getDocumentStatuses(ids: string[]): Promise<DocumentStatusResponse> {
  const qs = ids.length ? `?ids=${encodeURIComponent(ids.join(","))}` : "";
  return apiFetch<DocumentStatusResponse>(`/documents/status${qs}`);
}

export function retryDocument(id: string): Promise<DocumentRetryResponse> {
  return apiFetch<DocumentRetryResponse>(`/documents/${id}/retry`, { method: "POST" });
}

export function deleteDocument(id: string): Promise<void> {
  return apiFetch<void>(`/documents/${id}`, { method: "DELETE" });
}

/** Fetches the original file and triggers a browser download under its stored filename. */
export async function downloadOriginal(id: string, filename: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/documents/${id}/original`);
  if (!response.ok) {
    throw new Error(`GET /documents/${id}/original failed: ${response.status}`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Uploads one file as multipart/form-data with real transfer progress via
 * XMLHttpRequest (fetch has no upload progress event). On a non-2xx response
 * the rejection message is the server's `{detail}` body when present -- this
 * is how 413 (too large) and 415 (unsupported type) surface to the caller --
 * falling back to a generic message otherwise.
 */
export function uploadDocument(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadDocumentResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/documents`);
    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as UploadDocumentResult);
        } catch {
          reject(new Error("Upload succeeded but the response could not be read."));
        }
        return;
      }
      let detail = `Upload failed with status ${xhr.status}.`;
      try {
        const body = JSON.parse(xhr.responseText) as { detail?: string };
        if (body && typeof body.detail === "string" && body.detail) {
          detail = body.detail;
        }
      } catch {
        // no JSON body: keep the generic message
      }
      reject(new Error(detail));
    };
    xhr.onerror = () => reject(new Error("Upload failed before the file was fully received."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}
