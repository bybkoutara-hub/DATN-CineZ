import { type Request, type Response } from "express";
import Movie from "../models/movieModel.js";
import Showtime from "../models/showtimeModel.js";

const fixPosterUrl = (url: string): string => {
  if (!url) return "";
  return url.replace("media.themoviedb.org", "image.tmdb.org");
};

export const getMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, genre } = req.query;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: String(search), $options: "i" };
    if (genre) filter.genres = { $in: [genre] };
    const movies = await Movie.find(filter);
    const data = movies.map((m) => {
      const obj = m.toObject();
      obj.poster_url = fixPosterUrl(obj.poster_url);
      return obj;
    });
    res.status(200).json({ success: true, data });
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

// Hàm lấy chi tiết phim và lịch chiếu tương ứng (ĐÃ FIX LỒNG CẤU TRÚC THEO FRONTEND)
export const getMovieDetailWithShowtimes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Nhận Movie ID từ đường dẫn URL

    if (!id) {
      res.status(400).json({ success: false, message: "Mã định danh phim không hợp lệ" });
      return;
    }

    // 1. Tìm thông tin bộ phim
    const movie = await Movie.findById(id);
    if (!movie) {
      res.status(404).json({ success: false, message: "Không tìm thấy phim này" });
      return;
    }

    // 2. Tìm tất cả các suất chiếu của bộ phim đó lớn hơn hoặc bằng thời gian hiện tại
    const showtimes = await Showtime.find({
      movieId: id as string, 
      startTime: { $gte: new Date() } 
    }).sort({ startTime: 1 }); 

    // 3. ĐÓNG GÓI ĐÚNG DẠNG LỒNG NHAU THEO KỲ VỌNG CỦA FRONTEND MOVIE_SERVICE
    const movieObj = movie.toObject();
    movieObj.poster_url = fixPosterUrl(movieObj.poster_url);
    res.status(200).json({
      success: true,
      data: {
        movie: movieObj,
        showtimes: showtimes || []
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy chi tiết phim",
      error: error.message
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
      movieId, 
      roomName, 
      startTime, 
      price, 
      availableSeats 
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