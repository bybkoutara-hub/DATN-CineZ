import { type Request, type Response } from "express";
import Movie from "../models/movieModel.js";
import Showtime from "../models/showtimeModel.js";

export const getMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) {
      filter = { status };
    }
    const movies = await Movie.find(filter);
    res.status(200).json({ success: true, data: movies });
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
    res.status(200).json({
      success: true,
      data: {
        movie: movie,
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

// Hàm hỗ trợ Manager thêm suất chiếu (ĐÃ FIX ĐỒNG BỘ TÊN TRƯỜNG SCHEMA movie_id)
export const addShowtime = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, roomName, startTime, price } = req.body;
    
    // Tạo sẵn cụm 20 ghế mặc định tự động từ A1 -> B10
    const availableSeats = [];
    for (let row of ["A", "B"]) {
      for (let i = 1; i <= 10; i++) {
        availableSeats.push(`${row}${i}`);
      }
    }

    // Đổi trường gán từ movieId sang movie_id cho đúng Schema Database
    const newShowtime = new Showtime({ 
      movie_id: movieId, 
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