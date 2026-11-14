
const API_BASE_URL = "http://127.0.0.1:8000";

function getErrorMessage(data, status) {
  const detail = data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const location = item.loc?.join(".");
        return `${location ? location + ": " : ""}${item.msg}`;
      })
      .join("\n");
  }

  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") {
    return detail.message || JSON.stringify(detail);
  }

  if (typeof data === "string" && data) return data;

  return data?.message || `Request failed (${status})`;
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("campusbite_token");

  const headers = { ...(options.headers || {}) };

  if (
    options.body !== undefined &&
    !(options.body instanceof URLSearchParams)
  ) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response.status));
  }

  return data;
}
