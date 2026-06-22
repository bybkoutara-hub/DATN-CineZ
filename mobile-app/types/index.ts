// Domain types dùng chung cho mobile-app (khớp với api/models)

export interface Movie {
  _id: string;
  title: string;
  poster_url: string;
  duration: number;
  genres: string[];
  rating: number;
  total_reviews: string;
  release_date: string;
  status: "now_playing" | "coming_soon";
}

export interface Cinema {
  _id: string;
  name: string;
  address: string;
  city: string;
  rooms: string[];
  image: string;
}

export interface Showtime {
  _id: string;
  movieId: string;
  roomName: string;
  startTime: string;
  price: number;
  availableSeats: string[];
}

export interface Combo {
  _id: string;
  name: string;
  price: number;
  image: string;
  items: string[];
}

export interface Booking {
  _id: string;
  user: string;
  showtime: Showtime;
  seats: string[];
  combo?: Combo;
  totalPrice: number;
  status: "pending" | "paid" | "cancelled";
  qrCode?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "staff";
  loyaltyPoints: number;
}
