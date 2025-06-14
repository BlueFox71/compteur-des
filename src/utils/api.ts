export const API_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001'
    : 'https://bluefox71.github.io/compteur-des-api'; 