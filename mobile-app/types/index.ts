export interface Movie {
  _id: string;
  title: string;
  poster_url: string;
  duration: number;
  genres: string[];
  rating: number;
  total_reviews: number;
  release_date: string;
  status: "now_playing" | "coming_soon";
  description: string;
  director: string;
  cast: string[];
  storyline: string;
  language: string;
  rated: "P" | "C13" | "C16" | "C18";
}

export interface Genre {
  _id: string;
  name: string;
  description: string;
}

export interface Director {
  _id: string;
  name: string;
  bio: string;
  avatar: string;
  birthDate: string;
  nationality: string;
}

export interface Actor {
  _id: string;
  name: string;
  bio: string;
  avatar: string;
  birthDate: string;
  nationality: string;
}

export interface Review {
  _id: string;
  movie: string;
  user: { _id: string; name: string };
  rating: number;
  comment: string;
  createdAt: string;
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
