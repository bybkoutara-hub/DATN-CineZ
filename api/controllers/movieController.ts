import { type Request, type Response } from "express";
import Movie from "../models/movieModel";
import AdminMovie from "../models/admin/adminMovieModel";
import Showtime from "../models/showtimeModel";

const statusMap: Record<string, string> = {
  showing: "now_playing",
  coming: "coming_soon",
  ended: "ended",
};

const reverseStatusMap: Record<string, string> = {
  now_playing: "showing",
  coming_soon: "coming",
};

const mapMovie = (m: any) => {
  if (!m) return m;
  const obj = m._doc || m;
  return {
    ...obj,
    poster_url: obj.poster_url || obj.poster || "",
    poster: undefined,
    release_date: obj.release_date || obj.releaseDate || "",
    releaseDate: undefined,
    status: statusMap[obj.status] || obj.status,
  };
};

export const getMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = {};

    const movies1 = await Movie.find(filter).lean();
    const adminStatus = status ? reverseStatusMap[status as string] || status : undefined;
    const filter2: any = {};
    if (adminStatus) filter2.status = adminStatus;
    const movies2 = await AdminMovie.find(filter2).lean();

    const seen = new Set();
    const all = [...movies1, ...movies2].filter((m: any) => {
      if (seen.has(m._id.toString())) return false;
      seen.add(m._id.toString());
      return true;
    });

    let result = all.map(mapMovie);
    if (status) {
      result = result.filter((m: any) => m.status === status);
    }

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const newMovie = new Movie(req.body);
    await newMovie.save();
    res.status(201).json({ success: true, data: newMovie });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMovieDetailWithShowtimes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, message: "Mã định danh phim không hợp lệ" });
      return;
    }

    let movie: any = await Movie.findById(id).lean();
    if (!movie) movie = await AdminMovie.findById(id).lean();

    if (!movie) {
      res.status(404).json({ success: false, message: "Không tìm thấy phim này" });
      return;
    }

    const showtimes = await Showtime.find({
      movieId: id,
    }).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      data: {
        movie: mapMovie(movie),
        showtimes: showtimes || [],
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy chi tiết phim",
      error: error.message,
    });
  }
};

export const addShowtime = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, roomName, startTime, price } = req.body;

    const availableSeats = [];
    for (let row of ["A", "B"]) {
      for (let i = 1; i <= 10; i++) {
        availableSeats.push(`${row}${i}`);
      }
    }

    const newShowtime = new Showtime({
      movie_id: movieId,
      roomName,
      startTime,
      price,
      availableSeats,
    });

    await newShowtime.save();
    res.status(201).json({ success: true, data: newShowtime });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getShowtimeDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const showtime = await Showtime.findById(id);

    if (!showtime) {
      res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
      return;
    }

    res.status(200).json({ success: true, data: showtime });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getShowtimesByMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.query;
    const filter: Record<string, unknown> = {};
    if (movieId) filter.movieId = movieId;
    const showtimes = await Showtime.find(filter).sort({ startTime: 1 });
    res.status(200).json({ success: true, data: showtimes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
