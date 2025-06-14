export const API_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001'
    : 'https://compteur-des-api.onrender.com'; 