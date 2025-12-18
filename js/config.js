// js/config.js

// Base URL API backend
// Untuk sekarang: IP LAN kantor
// Nanti tinggal ganti ke: https://api.desilhouette.com (misalnya)
const API_BASE_URL = "https://prudence-atrophic-nelida.ngrok-free.dev";

// Mapping mode ke endpoint backend
const API_ENDPOINTS = {
  precision: `${API_BASE_URL}/api/remove-bg-premium`,
  originalQuality: `${API_BASE_URL}/api/remove-bg-lossless`,
};

// Biar bisa diakses global dari main.js
window.DeSilhouetteConfig = {
  API_BASE_URL,
  API_ENDPOINTS,
};
