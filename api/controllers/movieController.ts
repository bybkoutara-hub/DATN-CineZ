import { Request, Response } from "express";
import Movie from "../models/movieModel";
import Showtime from "../models/showtimeModel";

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

// Hàm lấy chi tiết phim và lịch chiếu tương ứng
export const getMovieDetailWithShowtimes = async (req: any, res: any): Promise<void> => {
  try {
    const { id } = req.params; // Nhận Movie ID từ đường dẫn URL

    // 1. Tìm thông tin bộ phim
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phim này" });
    }

    // 2. Tìm tất cả các suất chiếu của bộ phim đó lớn hơn hoặc bằng thời gian hiện tại
    const showtimes = await Showtime.find({
      movieId: id,
      startTime: { $gte: new Date() } // Chỉ lấy các suất chiếu từ thời điểm này trở đi
    }).sort({ startTime: 1 }); // Sắp xếp theo thời gian sớm nhất xếp trước

    res.status(200).json({
      success: true,
      data: {
        movie,
        showtimes
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

// Hàm hỗ trợ Manager thêm suất chiếu (Dùng để mồi dữ liệu test)
export const addShowtime = async (req: any, res: any): Promise<void> => {
  try {
    const { movieId, roomName, startTime, price } = req.body;
    
    // Tạo sẵn cụm 20 ghế mặc định tự động từ A1 -> B10
    const availableSeats = [];
    for (let row of ["A", "B"]) {
      for (let i = 1; i <= 10; i++) {
        availableSeats.push(`${row}${i}`);
      }
    }

    const newShowtime = new Showtime({ movieId, roomName, startTime, price, availableSeats });
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