/**
 * API Client
 * Centralized HTTP client with auth, retry logic, and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_access_token'); // Match auth service key
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make HTTP request with retry logic
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = MAX_RETRIES
): Promise<Response> {
    try {
        const response = await fetch(url, options);

        // If successful or client error (4xx), return immediately
        if (response.ok || (response.status >= 400 && response.status < 500)) {
            return response;
        }

        // Server error (5xx) - retry
        if (retries > 0) {
            await sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1)); // Exponential backoff
            return fetchWithRetry(url, options, retries - 1);
        }

        return response;
    } catch (error) {
        // Network error - retry
        if (retries > 0) {
            await sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}

/**
 * Main API client function
 */
export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // Add auth token if available
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[API Client] Auth token present:', token.substring(0, 20) + '...');
    } else {
        console.log('[API Client] ⚠️ No auth token found in localStorage');
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        const response = await fetchWithRetry(url, config);

        // Handle non-OK responses
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            let errorData;

            try {
                errorData = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch {
                // Response is not JSON
            }

            // Handle specific status codes with user-friendly messages
            if (response.status === 401) {
                errorMessage = 'Your session has expired. Please log in again.';
                // Redirect to login after a short delay
                if (typeof window !== 'undefined') {
                    setTimeout(() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                    }, 1500);
                }
            } else if (response.status === 403) {
                errorMessage = 'You do not have permission to access this resource.';
            } else if (response.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            throw new ApiError(errorMessage, response.status, errorData);
        }

        // Parse JSON response
        const data = await response.json();
        return data as T;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Network or other errors
        const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
        throw new ApiError(
            isNetworkError
                ? 'Network error. Please check your internet connection and try again.'
                : error instanceof Error ? error.message : 'An unexpected error occurred',
            undefined,
            error
        );
    }
}

/**
 * Convenience methods
 */
export const api = {
    get: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'GET' }),

    post: <T>(endpoint: string, data?: any) =>
        apiClient<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }),

    put: <T>(endpoint: string, data?: any) =>
        apiClient<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T>(endpoint: string) =>
        apiClient<T>(endpoint, { method: 'DELETE' }),
};
