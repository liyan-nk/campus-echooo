const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);
    if (activeToken) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }
    return headers;
  }

  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options;
    const config: RequestInit = {
      ...rest,
      headers: {
        ...this.getAuthHeaders(token),
        ...headers,
      },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (response.status === 401 && typeof window !== "undefined") {
      // Try refresh token logic
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken && endpoint !== "/auth/refresh" && endpoint !== "/auth/login") {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem("accessToken", data.accessToken);
            // Re-run the request
            const retriedHeaders = this.getAuthHeaders(data.accessToken);
            const retriedConfig = { ...config, headers: { ...retriedHeaders, ...headers } };
            const retriedResponse = await fetch(`${API_URL}${endpoint}`, retriedConfig);
            if (retriedResponse.ok) {
              return retriedResponse.json();
            }
          }
        } catch (e) {
          console.error("Token refresh failed:", e);
        }
      }
      // Logout if refresh fails or no refresh token
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      if (typeof window !== "undefined" && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string, options: FetchOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body: any, options: FetchOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: any, options: FetchOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string, options: FetchOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();
