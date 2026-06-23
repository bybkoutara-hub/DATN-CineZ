// Tập trung các endpoint API (khớp api/server.ts)
// Base URL nằm ở services/api.ts

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
  movies: "/movies", // ?status=now_playing | coming_soon
  cinemas: "/cinemas", // ?city=
  showtimes: "/showtimes", // ?movieId=
  bookings: "/bookings",
  payments: "/payments",
  combos: "/combos",
  promotions: "/promotions",
  reviews: "/reviews", // ?movieId=
} as const;
