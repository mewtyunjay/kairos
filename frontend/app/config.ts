const getApiBaseUrl = () => {
  // Check if we're running on the client side
  if (typeof window !== 'undefined') {
    // Get the current hostname (e.g., 192.168.29.63 or localhost)
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  // Default fallback for server-side
  return 'http://localhost:8000';
};

export const config = {
  apiBaseUrl: getApiBaseUrl(),
}; 