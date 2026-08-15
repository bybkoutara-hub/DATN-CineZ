import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Genre from "../models/genreModel";
import Movie from "../models/movieModel";
import Room from "../models/roomModel";
import Showtime from "../models/showtimeModel";
import Combo from "../models/comboModel";
import Promotion from "../models/promotionModel";
import Slider from "../models/sliderModel";
import Seat from "../models/seatModel";
import Booking from "../models/bookingModel";
import Invoice from "../models/invoiceModel";
import User from "../models/userModel";
import Actor from "../models/actorModel";
import Director from "../models/directorModel";
import Review from "../models/reviewModel";
import {
  buildDefaultLayout,
  getLayout,
  getRowSeatNumbers,
  getSeatLabels,
  getSeatPrice,
  sanitizeLayout,
} from "../utils/seatLayout";

// ==================== AUTH ====================

export const adminRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;
    if (!username || !password || !fullName) {
      res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
      return;
    }
    const userExists = await User.findOne({ username });
    if (userExists) {
      res.status(400).json({ success: false, message: "Tên tài khoản đã tồn tại!" });
      return;
    }
    const newUser = new User({ username, password, fullName, email, phone, role: role || "customer" });
    await newUser.save();
    res.status(201).json({ success: true, message: "Tạo tài khoản thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng ký", error: error.message });
  }
};

export const adminGetProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy thông tin", error: error.message });
  }
};

export const adminUpdateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { fullName, email, phone },
      { new: true }
    ).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật thông tin thành công!", data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật", error: error.message });
  }
};

// ==================== GENRES ====================

export const getGenres = async (_req: Request, res: Response): Promise<void> => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.status(200).json(genres);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách thể loại", error });
  }
};

export const getGenreById = async (req: Request, res: Response): Promise<void> => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      res.status(404).json({ success: false, message: "Không tìm thấy thể loại" });
      return;
    }
    res.status(200).json(genre);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết thể loại", error });
  }
};

export const createGenre = async (req: Request, res: Response): Promise<void> => {
  try {
    const newGenre = new Genre(req.body);
    const saved = await newGenre.save();
    res.status(201).json({ success: true, message: "Thêm thể loại thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo thể loại", error });
  }
};

export const updateGenre = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy thể loại" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật thể loại thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật thể loại", error });
  }
};

export const deleteGenre = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Genre.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Không tìm thấy thể loại" });
      return;
    }
    res.status(200).json({ success: true, message: "Xóa thể loại thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xóa thể loại", error });
  }
};

// ==================== MOVIES ====================

export const getAdminMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    let filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };
    const movies = await Movie.find(filter).sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách phim", error });
  }
};

export const getAdminMovieById = async (req: Request, res: Response): Promise<void> => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      res.status(404).json({ success: false, message: "Không tìm thấy phim" });
      return;
    }
    res.status(200).json(movie);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết phim", error });
  }
};

export const createAdminMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating, total_reviews, ...movieData } = req.body;
    const newMovie = new Movie(movieData);
    const saved = await newMovie.save();
    res.status(201).json({ success: true, message: "Đã thêm phim mới vào hệ thống!", data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Không thể thêm phim mới", error });
  }
};

export const updateAdminMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating, total_reviews, ...movieData } = req.body;
    const updated = await Movie.findByIdAndUpdate(req.params.id, movieData, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy phim" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật phim", error });
  }
};

export const deleteAdminMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const hasShowtime = await Showtime.exists({ movie: req.params.id });
    if (hasShowtime) {
      res.status(400).json({
        success: false,
        message: "Không thể xóa phim đang có suất chiếu! Hãy xóa suất chiếu trước.",
      });
      return;
    }

    const deleted = await Movie.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Không tìm thấy phim" });
      return;
    }
    res.status(200).json({ success: true, message: "Đã xóa phim thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xóa phim", error });
  }
};

// ==================== ROOMS ====================

export const getRooms = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await Room.find().sort({ name: 1 });
    res.status(200).json(rooms);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách phòng", error });
  }
};

export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
      return;
    }
    res.status(200).json(room);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết phòng", error });
  }
};

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = { ...req.body };
    if (!data.layout) {
      data.layout = buildDefaultLayout(data.rows_count || 8, data.seats_per_row || 15);
    }
    if (data.layout) {
      data.totalSeats = getSeatLabels(data.layout).length;
    } else if (data.rows_count && data.seats_per_row && !data.totalSeats) {
      data.totalSeats = data.rows_count * data.seats_per_row;
    }
    const newRoom = new Room(data);
    const saved = await newRoom.save();
    res.status(201).json({ success: true, message: "Thêm phòng thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo phòng", error });
  }
};

export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật phòng thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật phòng", error });
  }
};

// Cập nhật sơ đồ ghế của phòng + đồng bộ xuống toàn bộ suất chiếu (web & app)
export const updateRoomLayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
      return;
    }

    const layout = sanitizeLayout(req.body.layout);
    if (!layout) {
      res.status(400).json({ success: false, message: "Layout sơ đồ ghế không hợp lệ!" });
      return;
    }

    // 1. Lưu layout mới vào phòng
    room.layout = layout as any;
    room.rows_count = layout.rows.length;
    room.seats_per_row = layout.cols;
    room.totalSeats = getSeatLabels(layout).length;
    await room.save();

    // 2. Tái tạo ghế theo layout mới (giữ trạng thái của ghế cùng label)
    const oldSeats = await Seat.find({ room: room._id });
    const oldByLabel: Record<string, any> = {};
    oldSeats.forEach((s: any) => (oldByLabel[s.label] = s));

    const seatsToInsert: any[] = [];
    layout.rows.forEach((row) => {
      const type = layout.rowTypes?.[row] || "standard";
      getRowSeatNumbers(layout, row).forEach((number) => {
        const label = `${row}${number}`;
        const old = oldByLabel[label];
        seatsToInsert.push({
          room: room._id,
          row,
          number,
          label,
          type,
          status: old?.status || "available",
          price: getSeatPrice(type),
        });
      });
    });
    await Seat.deleteMany({ room: room._id });
    await Seat.insertMany(seatsToInsert);

    // 3. Đồng bộ xuống toàn bộ suất chiếu của phòng
    //    (giữ các ghế đã được đặt là đã đặt, chỉ cập nhật layout + danh sách ghế)
    const labels = getSeatLabels(layout);
    const disabledLabels = new Set(
      (await Seat.find({ room: room._id, status: { $in: ["maintenance", "broken"] } })).map(
        (s: any) => s.label
      )
    );
    const showtimes = await Showtime.find({ room: room._id });
    for (const st of showtimes) {
      const bookings = await Booking.find({
        showtime: st._id,
        status: "paid",
      });
      const booked = new Set<string>();
      bookings.forEach((b: any) => (b.seats || []).forEach((s: string) => booked.add(s)));
      st.layout = layout;
      st.availableSeats = labels.filter((l) => !booked.has(l) && !disabledLabels.has(l));
      await st.save();
    }

    res.status(200).json({ success: true, message: "Cập nhật layout thành công!", data: room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật layout", error });
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
      return;
    }
    await Seat.deleteMany({ room: req.params.id });
    res.status(200).json({ success: true, message: "Xóa phòng thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xóa phòng", error });
  }
};

export const getRoomSeats = async (req: Request, res: Response): Promise<void> => {
  try {
    const seats = await Seat.find({ room: req.params.id }).sort({ row: 1, number: 1 });
    res.status(200).json(seats);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy sơ đồ ghế", error });
  }
};

// ==================== SHOWTIMES ====================

export const getAdminShowtimes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movie, movieId, movie_id, roomName, date } = req.query;
    let filter: Record<string, any> = {};
    if (movie || movieId || movie_id) filter.movie = movie || movieId || movie_id;
    if (roomName) filter.roomName = roomName;
    if (date) {
      const start = new Date(date as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date as string);
      end.setHours(23, 59, 59, 999);
      filter.startTime = { $gte: start, $lte: end };
    }
    const showtimes = await Showtime.find(filter)
      .populate("movie", "title poster_url duration")
      .populate("room", "name type")
      .sort({ startTime: 1 });
    res.status(200).json(showtimes);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách suất chiếu", error });
  }
};

export const getAdminShowtimeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate("movie", "title poster_url duration genres");
    if (!showtime) {
      res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
      return;
    }
    res.status(200).json(showtime);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết suất chiếu", error });
  }
};

// Kiểm tra suất chiếu trùng giờ trong cùng phòng: [startA, endA] ∩ [startB, endB]
const findTimeConflict = async (
  roomId: string,
  startTime: Date,
  durationMin: number,
  excludeShowtimeId?: string
): Promise<any> => {
  const endTime = new Date(startTime.getTime() + durationMin * 60000);
  const dayStart = new Date(startTime);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(startTime);
  dayEnd.setHours(23, 59, 59, 999);

  const sameDay = await Showtime.find({
    room: roomId,
    _id: { $ne: excludeShowtimeId },
    startTime: { $gte: dayStart, $lte: dayEnd },
    status: { $ne: "cancelled" },
  }).populate("movie", "title duration");

  for (const st of sameDay) {
    const stStart = new Date(st.startTime);
    const stDuration = (st as any).movie?.duration || 120;
    const stEnd = new Date(stStart.getTime() + stDuration * 60000);
    if (stStart < endTime && startTime < stEnd) {
      return st;
    }
  }
  return null;
};

export const createAdminShowtime = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movie, movieId, room: roomBody, roomId, roomName: roomNameBody, date, startTime, basePrice, price: priceBody, status } = req.body;
    const movieIdResolved = movie || movieId;  // movie là chuẩn; movieId giữ để tương thích client cũ
    const roomIdResolved = roomBody || roomId;  // roomBody là chuẩn; roomId giữ để tương thích client cũ

    if (!movieIdResolved) {
      res.status(400).json({ success: false, message: "Thiếu thông tin phim" });
      return;
    }
    if (!roomIdResolved) {
      res.status(400).json({ success: false, message: "Thiếu thông tin phòng chiếu" });
      return;
    }
    if (!date || !startTime) {
      res.status(400).json({ success: false, message: "Vui lòng nhập ngày và giờ chiếu" });
      return;
    }

    const movieDoc = await Movie.findById(movieIdResolved);
    if (!movieDoc) {
      res.status(404).json({ success: false, message: "Không tìm thấy phim" });
      return;
    }

    const room = await Room.findById(roomIdResolved);
    if (!room) {
      res.status(404).json({ success: false, message: "Không tìm thấy phòng chiếu" });
      return;
    }

    const price = Number(basePrice ?? priceBody ?? 0);
    if (!price || price <= 0) {
      res.status(400).json({ success: false, message: "Giá vé phải lớn hơn 0" });
      return;
    }

    const [yy, mm, dd] = (date as string).split("-").map(Number);
    if (!yy || !mm || !dd) {
      res.status(400).json({ success: false, message: "Ngày chiếu không hợp lệ" });
      return;
    }
    const parts = (startTime as string).split(":");
    const hh = Number(parts[0]);
    const mmin = Number(parts[1]);
    if (isNaN(hh) || isNaN(mmin) || hh > 23 || mmin > 59) {
      res.status(400).json({ success: false, message: "Giờ chiếu không hợp lệ" });
      return;
    }
    const startDate = new Date(yy, mm - 1, dd, hh, mmin, 0, 0);

    if (startDate.getTime() < Date.now() - 5 * 60000) {
      res.status(400).json({ success: false, message: "Không thể tạo suất chiếu trong quá khứ" });
      return;
    }

    // Chặn trùng giờ chiếu trong cùng phòng
    const conflict = await findTimeConflict(String(roomIdResolved), startDate, movieDoc.duration);
    if (conflict) {
      const cStart = new Date(conflict.startTime);
      res.status(400).json({
        success: false,
        message: `Phòng này đã có suất chiếu "${(conflict as any).movie?.title || "phim khác"}` +
          `" lúc ${cStart.getHours()}:${String(cStart.getMinutes()).padStart(2, "0")} cùng ngày. Vui lòng chọn giờ khác.`,
      });
      return;
    }

    const layout = getLayout(room);
    const seatLabels = getSeatLabels(layout);

    // Loại ghế đang bảo trì/hỏng khỏi danh sách ghế trống
    const disabledSeats = await Seat.find({
      room: room._id,
      status: { $in: ["maintenance", "broken"] },
    });
    const disabledLabels = new Set(disabledSeats.map((s: any) => s.label));
    const availableSeats = seatLabels.filter((label) => !disabledLabels.has(label));

    const showtimeData = {
      movie: movieIdResolved,
      room: roomIdResolved,
      roomName: room.name,
      startTime: startDate,
      price,
      availableSeats,
      layout,
      status: status || "active",
    };

    const saved = await Showtime.create(showtimeData);
    res.status(201).json({ success: true, message: "Tạo suất chiếu thành công!", data: saved });
  } catch (error: any) {
    console.error("createAdminShowtime error:", error);
    res.status(500).json({ success: false, message: "Không thể tạo suất chiếu", error: error.message || error, stack: error.stack });
  }
};

export const updateAdminShowtime = async (req: Request, res: Response): Promise<void> => {
  try {
    const { room, roomId, date, startTime, basePrice, price: priceBody, ...rest } = req.body;
    const existing = await Showtime.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
      return;
    }
    const roomIdResolved = room || roomId;
    const updateData: Record<string, any> = { ...rest };
    let effectiveRoomId = existing.room ? String(existing.room) : "";
    let effectiveStart = new Date(existing.startTime);
    let durationMin = 120;

    const movieDoc = await Movie.findById(rest.movie || existing.movie);
    if (movieDoc?.duration) durationMin = movieDoc.duration;

    if (roomIdResolved) {
      const room = await Room.findById(roomIdResolved);
      if (!room) {
        res.status(404).json({ success: false, message: "Không tìm thấy phòng chiếu" });
        return;
      }
      effectiveRoomId = String(room._id);
      updateData.roomName = room.name;
      updateData.room = room._id;
      const layout = getLayout(room);
      updateData.layout = layout;
      updateData.availableSeats = getSeatLabels(layout);
    }

    if (date) {
      const [y, m, d] = (date as string).split("-").map(Number);
      if (y && m && d) effectiveStart.setFullYear(y, m - 1, d);
    }
    if (startTime) {
      const parts = (startTime as string).split(":");
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);
      if (isNaN(hours) || isNaN(minutes)) {
        res.status(400).json({ success: false, message: "Giờ chiếu không hợp lệ" });
        return;
      }
      effectiveStart.setHours(hours, minutes, 0, 0);
    }

    if (effectiveStart.getTime() < Date.now() - 5 * 60000) {
      res.status(400).json({ success: false, message: "Không thể đặt suất chiếu trong quá khứ" });
      return;
    }

    if (roomIdResolved || date || startTime) {
      const conflict = await findTimeConflict(effectiveRoomId, effectiveStart, durationMin, String(req.params.id));
      if (conflict) {
        const cStart = new Date(conflict.startTime);
        res.status(400).json({
          success: false,
          message: `Phòng này đã có suất chiếu "${(conflict as any).movie?.title || "phim khác"}"` +
            ` lúc ${cStart.getHours()}:${String(cStart.getMinutes()).padStart(2, "0")} cùng ngày. Vui lòng chọn giờ khác.`,
        });
        return;
      }
    }

    updateData.startTime = effectiveStart;

    if (basePrice !== undefined || priceBody !== undefined) {
      const price = Number(basePrice ?? priceBody);
      if (!price || price <= 0) {
        res.status(400).json({ success: false, message: "Giá vé phải lớn hơn 0" });
        return;
      }
      updateData.price = price;
    }

    const updated = await Showtime.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Cập nhật suất chiếu thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật suất chiếu", error: error.message || error });
  }
};

export const deleteAdminShowtime = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Showtime.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
      return;
    }
    res.status(200).json({ success: true, message: "Đã xóa suất chiếu thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xóa suất chiếu", error });
  }
};

export const getBookedSeats = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({
      showtime: req.params.id,
      status: { $in: ["paid", "completed"] },
    });
    const bookedSeats: string[] = [];
    bookings.forEach((b) => bookedSeats.push(...b.seats));
    res.status(200).json({ success: true, bookedSeats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy trạng thái ghế", error });
  }
};

// ==================== COMBOS ====================

export const getCombos = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const filter: Record<string, any> = status ? { status } : {};
    const combos = await Combo.find(filter).sort({ price: 1 });
    res.status(200).json(combos);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách combo", error });
  }
};

export const getComboById = async (req: Request, res: Response): Promise<void> => {
  try {
    const combo = await Combo.findById(req.params.id);
    if (!combo) {
      res.status(404).json({ success: false, message: "Không tìm thấy combo" });
      return;
    }
    res.status(200).json(combo);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết combo", error });
  }
};

export const createCombo = async (req: Request, res: Response): Promise<void> => {
  try {
    const newCombo = new Combo(req.body);
    const saved = await newCombo.save();
    res.status(201).json({ success: true, message: "Thêm combo thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo combo", error });
  }
};

export const updateCombo = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Combo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy combo" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật combo thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật combo", error });
  }
};

export const deleteCombo = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Combo.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Không tìm thấy combo" });
      return;
    }
    res.status(200).json({ success: true, message: "Đã xóa combo" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xóa combo", error });
  }
};

// ==================== PROMOTIONS ====================

export const getPromotions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active, search } = req.query;
    let filter: Record<string, any> = {};
    if (active !== undefined) filter.active = active === "true";
    if (search) filter.code = { $regex: search, $options: "i" };
    const promotions = await Promotion.find(filter).sort({ createdAt: -1 });
    res.status(200).json(promotions);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách khuyến mãi", error });
  }
};

export const getPromotionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      res.status(404).json({ success: false, message: "Không tìm thấy khuyến mãi" });
      return;
    }
    res.status(200).json(promotion);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết khuyến mãi", error });
  }
};

export const createPromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const newPromotion = new Promotion(req.body);
    const saved = await newPromotion.save();
    res.status(201).json({ success: true, message: "Thêm khuyến mãi thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo khuyến mãi", error });
  }
};

export const updatePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy khuyến mãi" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật khuyến mãi thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật khuyến mãi", error });
  }
};

export const deletePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Promotion.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Không tìm thấy khuyến mãi" });
      return;
    }
    res.status(200).json({ success: true, message: "Xóa khuyến mãi thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xóa khuyến mãi", error });
  }
};

export const validatePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderValue } = req.body;
    const promotion = await Promotion.findOne({ code: (code as string).toUpperCase(), active: true });
    if (!promotion) {
      res.status(404).json({ success: false, message: "Mã khuyến mãi không hợp lệ!" });
      return;
    }
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      res.status(400).json({ success: false, message: "Mã khuyến mãi đã hết hạn!" });
      return;
    }
    if (promotion.usageLimit > 0 && promotion.usedCount >= promotion.usageLimit) {
      res.status(400).json({ success: false, message: "Mã khuyến mãi đã hết lượt sử dụng!" });
      return;
    }
    if (orderValue && orderValue < promotion.minOrderValue) {
      res.status(400).json({ success: false, message: `Giá trị đơn hàng tối thiểu là ${promotion.minOrderValue.toLocaleString()}đ!` });
      return;
    }

    let discount = 0;
    if (promotion.discountType === "percent") {
      discount = Math.round((orderValue || 0) * promotion.discountValue / 100);
      if (promotion.maxDiscount > 0 && discount > promotion.maxDiscount) {
        discount = promotion.maxDiscount;
      }
    } else {
      discount = promotion.discountValue;
    }

    res.status(200).json({
      success: true,
      data: {
        code: promotion.code,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        discount,
        description: promotion.description,
      },
      message: "Áp dụng mã khuyến mãi thành công!",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi kiểm tra khuyến mãi", error: error.message });
  }
};

// ==================== MEMBERS ====================

export const getMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status } = req.query;
    let filter: Record<string, any> = { role: "customer" };
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status !== undefined) filter.active = status === "active";
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách thành viên", error });
  }
};

export const getMemberById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy thành viên" });
      return;
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết thành viên", error });
  }
};

export const updateMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, active } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, phone, active },
      { new: true }
    ).select("-password");
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy thành viên" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật thành viên thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật thành viên", error });
  }
};

export const getMemberBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.params.id })
      .populate({ path: "showtime", populate: { path: "movie", select: "title poster_url" } })
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy lịch sử đặt vé", error });
  }
};

// ==================== STAFF ====================

export const getStaffs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, active } = req.query;
    let filter: Record<string, any> = {};
    if (role) filter.role = role;
    if (active !== undefined) filter.active = active === "true";
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }
    const staff = await User.find({ ...filter, role: { $in: ["staff", "admin"] } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(staff);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách nhân viên", error });
  }
};

export const getStaffById = async (req: Request, res: Response): Promise<void> => {
  try {
    const staff = await User.findById(req.params.id).select("-password");
    if (!staff) {
      res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
      return;
    }
    res.status(200).json(staff);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết nhân viên", error });
  }
};

export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;
    if (!username || !password || !fullName) {
      res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
      return;
    }
    const existing = await User.findOne({ username });
    if (existing) {
      res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại!" });
      return;
    }
    const newStaff = new User({
      username, password, fullName, email, phone,
      role: role || "staff", active: true,
    });
    const saved = await newStaff.save();
    res.status(201).json({
      success: true,
      message: "Thêm nhân viên thành công!",
      data: { _id: saved._id, username: saved.username, fullName: saved.fullName, email: saved.email, phone: saved.phone, role: saved.role },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo nhân viên", error: error.message });
  }
};

export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, role, active } = req.body;
    const updateData: Record<string, any> = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = active;
    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật nhân viên thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật nhân viên", error });
  }
};

export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
      return;
    }
    res.status(200).json({ success: true, message: "Xóa nhân viên thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xóa nhân viên", error });
  }
};

// ==================== SLIDERS ====================

export const getSliders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active } = req.query;
    const filter = active !== undefined ? { active: active === "true" } : {};
    const sliders = await Slider.find(filter).sort({ order: 1, createdAt: -1 });
    res.status(200).json(sliders);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách slider", error });
  }
};

export const getSliderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      res.status(404).json({ success: false, message: "Không tìm thấy slider" });
      return;
    }
    res.status(200).json(slider);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết slider", error });
  }
};

export const createSlider = async (req: Request, res: Response): Promise<void> => {
  try {
    const newSlider = new Slider(req.body);
    const saved = await newSlider.save();
    res.status(201).json({ success: true, message: "Thêm slider thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo slider", error });
  }
};

export const updateSlider = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Slider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy slider" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật slider thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật slider", error });
  }
};

export const deleteSlider = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Slider.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Không tìm thấy slider" });
      return;
    }
    res.status(200).json({ success: true, message: "Xóa slider thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xóa slider", error });
  }
};

export const reorderSliders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ!" });
      return;
    }
    for (const item of items) {
      await Slider.findByIdAndUpdate(item._id, { order: item.order });
    }
    res.status(200).json({ success: true, message: "Sắp xếp slider thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi sắp xếp slider", error });
  }
};

// ==================== SEATS ====================

export const getSeats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { room: roomId, type, status } = req.query;
    let filter: Record<string, any> = {};
    if (roomId) filter.room = roomId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    const seats = await Seat.find(filter).populate("room", "name").sort({ row: 1, number: 1 });
    res.status(200).json(seats);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách ghế", error });
  }
};

export const getSeatsByRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const seats = await Seat.find({ room: req.params.roomId }).sort({ row: 1, number: 1 });
    res.status(200).json(seats);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy ghế theo phòng", error });
  }
};

export const bulkCreateSeats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { room: roomId, seats: seatsData } = req.body;
    if (!roomId || !Array.isArray(seatsData) || seatsData.length === 0) {
      res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ!" });
      return;
    }

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
      return;
    }

    // Lưu layout chuẩn vào phòng nếu chưa có (đồng bộ với web & app)
    if (!room.layout || !Array.isArray(room.layout.rows) || room.layout.rows.length === 0) {
      room.layout = buildDefaultLayout(room.rows_count || 8, room.seats_per_row || 15);
      room.totalSeats = getSeatLabels(room.layout).length;
      await room.save();
    }

    const layout = getLayout(room);
    const statusByLabel: Record<string, string> = {};
    seatsData.forEach((s: any) => {
      const label = s.label || `${s.row}${s.number}`;
      if (s.status) statusByLabel[label] = s.status;
    });

    await Seat.deleteMany({ room: roomId });

    const seatsToInsert: any[] = [];
    layout.rows.forEach((row) => {
      getRowSeatNumbers(layout, row).forEach((number) => {
        const label = `${row}${number}`;
        const type = layout.rowTypes?.[row] || "standard";
        seatsToInsert.push({
          room: roomId,
          row,
          number,
          label,
          type,
          status: statusByLabel[label] || "available",
          price: getSeatPrice(type),
        });
      });
    });

    const saved = await Seat.insertMany(seatsToInsert);

    // Đồng bộ trạng thái ghế (bảo trì/hỏng) xuống toàn bộ suất chiếu của phòng:
    // loại ghế không dùng được khỏi availableSeats để app hiển thị đúng
    const disabledLabels = new Set(
      (
        await Seat.find({ room: roomId, status: { $in: ["maintenance", "broken"] } })
      ).map((s: any) => s.label)
    );
    const allLabels = getSeatLabels(layout);
    const showtimes = await Showtime.find({ room: roomId });
    for (const st of showtimes) {
      const bookings = await Booking.find({
        showtime: st._id,
        status: "paid",
      });
      const booked = new Set<string>();
      bookings.forEach((b: any) => (b.seats || []).forEach((s: string) => booked.add(s)));
      st.availableSeats = allLabels.filter((l) => !booked.has(l) && !disabledLabels.has(l));
      await st.save();
    }

    res.status(201).json({ success: true, message: "Tạo ghế thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo ghế hàng loạt", error });
  }
};

export const updateSeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Seat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy ghế" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật ghế thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật ghế", error });
  }
};

export const deleteSeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Seat.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Không tìm thấy ghế" });
      return;
    }
    res.status(200).json({ success: true, message: "Xóa ghế thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xóa ghế", error });
  }
};

// ==================== BOOKINGS ====================

export const getAdminBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentStatus, search, from, to } = req.query;
    let filter: Record<string, any> = {};
    if (paymentStatus) filter.$or = [{ status: paymentStatus }, { paymentStatus }];
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }
    const bookings = await Booking.find(filter)
      .populate("user", "username fullName email phone")
      .populate({ path: "showtime", populate: { path: "movie", select: "title poster_url duration" } })
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách đặt vé", error });
  }
};

export const getAdminBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "username fullName email phone")
      .populate({ path: "showtime", populate: { path: "movie", select: "title poster_url duration genres" } });
    if (!booking) {
      res.status(404).json({ success: false, message: "Không tìm thấy đặt vé" });
      return;
    }
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết đặt vé", error });
  }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, paymentStatus } = req.body;
    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    const updated = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy đặt vé" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật đặt vé thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật đặt vé", error });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled", paymentStatus: "cancelled" },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy đặt vé" });
      return;
    }
    res.status(200).json({ success: true, message: "Hủy đặt vé thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hủy đặt vé", error });
  }
};

// ==================== INVOICES ====================

export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, method, from, to } = req.query;
    let filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (from || to) {
      filter.issuedAt = {};
      if (from) filter.issuedAt.$gte = new Date(from as string);
      if (to) filter.issuedAt.$lte = new Date(to as string);
    }
    const invoices = await Invoice.find(filter)
      .populate({
        path: "booking",
        populate: [
          { path: "user", select: "username fullName" },
          { path: "showtime", populate: { path: "movie", select: "title" } },
        ],
      })
      .sort({ issuedAt: -1 });
    res.status(200).json(invoices);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách hóa đơn", error });
  }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: "booking",
        populate: [
          { path: "user", select: "username fullName email phone" },
          { path: "showtime", populate: { path: "movie", select: "title poster_url duration genres" } },
        ],
      });
    if (!invoice) {
      res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" });
      return;
    }
    res.status(200).json(invoice);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết hóa đơn", error });
  }
};

export const getInvoiceByBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findOne({ booking: req.params.bookingId })
      .populate({
        path: "booking",
        populate: [
          { path: "user", select: "username fullName email phone" },
          { path: "showtime", populate: { path: "movie", select: "title poster_url duration" } },
        ],
      });
    if (!invoice) {
      res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn cho đặt vé này" });
      return;
    }
    res.status(200).json(invoice);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy hóa đơn theo đặt vé", error });
  }
};

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { booking: bookingId, method, transactionId, status } = req.body;
    if (!bookingId) {
      res.status(400).json({ success: false, message: "Thiếu thông tin đặt vé!" });
      return;
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: "Không tìm thấy đặt vé!" });
      return;
    }
    const existing = await Invoice.findOne({ booking: bookingId });
    if (existing) {
      res.status(400).json({ success: false, message: "Hóa đơn cho đặt vé này đã tồn tại!" });
      return;
    }
    const newInvoice = new Invoice({
      booking: bookingId,
      amount: booking.totalPrice,
      method: method || "cash",
      status: status || "paid",
      transactionId: transactionId || "",
    });
    const saved = await newInvoice.save();
    if (saved.status === "paid") {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "completed" });
    }
    res.status(201).json({ success: true, message: "Tạo hóa đơn thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo hóa đơn", error });
  }
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, method, transactionId } = req.body;
    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (method) updateData.method = method;
    if (transactionId !== undefined) updateData.transactionId = transactionId;
    const updated = await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật hóa đơn thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật hóa đơn", error });
  }
};

// ==================== DASHBOARD ====================

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({
      status: { $in: ["paid", "completed"] },
    });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalTickets = bookings.reduce((sum, b) => sum + b.seats.length, 0);
    const totalMembers = await User.countDocuments({ role: "customer" });
    const totalMovies = await Movie.countDocuments();
    const totalShowtimes = await Showtime.countDocuments({ status: "active" });
    const totalBookings = await Booking.countDocuments();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayBookings = await Booking.find({
      status: { $in: ["paid", "completed"] },
      createdAt: { $gte: todayStart },
    });
    const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const todayTickets = todayBookings.reduce((sum, b) => sum + b.seats.length, 0);

    res.status(200).json({
      success: true,
      data: { totalRevenue, totalTickets, totalMembers, totalMovies, totalShowtimes, totalBookings, todayRevenue, todayTickets },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tính toán thống kê", error: error.message });
  }
};

export const getDashboardRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    let filter: Record<string, any> = {
      status: { $in: ["paid", "completed"] },
    };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }
    const bookings = await Booking.find(filter).sort({ createdAt: 1 });

    const revenueByDate: Record<string, { date: string; revenue: number; tickets: number }> = {};
    bookings.forEach((b: any) => {
      const dateKey = b.createdAt.toISOString().slice(0, 10);
      if (!revenueByDate[dateKey]) revenueByDate[dateKey] = { date: dateKey, revenue: 0, tickets: 0 };
      revenueByDate[dateKey].revenue += b.totalPrice || 0;
      revenueByDate[dateKey].tickets += b.seats.length;
    });

    res.status(200).json(Object.values(revenueByDate));
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy doanh thu", error: error.message });
  }
};

export const getDashboardRevenueByMovie = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({
      status: { $in: ["paid", "completed"] },
    })
      .populate({ path: "showtime", select: "movie", populate: { path: "movie", select: "title" } });

    const revenueByMovie: Record<string, { title: string; revenue: number; tickets: number }> = {};
    bookings.forEach((b) => {
      const movieTitle = (b as any).showtime?.movie?.title || "Unknown";
      if (!revenueByMovie[movieTitle]) revenueByMovie[movieTitle] = { title: movieTitle, revenue: 0, tickets: 0 };
      revenueByMovie[movieTitle].revenue += b.totalPrice || 0;
      revenueByMovie[movieTitle].tickets += b.seats.length;
    });

    res.status(200).json(Object.values(revenueByMovie).sort((a, b) => b.revenue - a.revenue));
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy doanh thu theo phim", error: error.message });
  }
};

export const getDashboardTopMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const bookings = await Booking.find({
      status: { $in: ["paid", "completed"] },
    })
      .populate({ path: "showtime", select: "movie", populate: { path: "movie", select: "title poster_url" } });

    const movieStats: Record<string, any> = {};
    bookings.forEach((b) => {
      const movie = (b as any).showtime?.movie;
      if (!movie) return;
      const id = movie._id.toString();
      if (!movieStats[id]) movieStats[id] = { _id: id, title: movie.title, poster_url: movie.poster_url, revenue: 0, tickets: 0 };
      movieStats[id].revenue += b.totalPrice || 0;
      movieStats[id].tickets += b.seats.length;
    });

    res.status(200).json(Object.values(movieStats).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, limit));
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy top phim", error: error.message });
  }
};

// ==================== ACTORS (Admin) ====================

export const getAdminActors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const actors = await Actor.find().sort({ name: 1 });
    res.status(200).json(actors);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách diễn viên", error });
  }
};

export const getAdminActorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const actor = await Actor.findById(req.params.id);
    if (!actor) {
      res.status(404).json({ success: false, message: "Không tìm thấy diễn viên" });
      return;
    }
    res.status(200).json(actor);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết diễn viên", error });
  }
};

export const createActor = async (req: Request, res: Response): Promise<void> => {
  try {
    const newActor = new Actor(req.body);
    const saved = await newActor.save();
    res.status(201).json({ success: true, message: "Thêm diễn viên thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo diễn viên", error });
  }
};

export const updateActor = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Actor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy diễn viên" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật diễn viên thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật diễn viên", error });
  }
};

export const deleteActor = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Actor.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Không tìm thấy diễn viên" });
      return;
    }
    res.status(200).json({ success: true, message: "Xóa diễn viên thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xóa diễn viên", error });
  }
};

// ==================== DIRECTORS (Admin) ====================

export const getAdminDirectors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const directors = await Director.find().sort({ name: 1 });
    res.status(200).json(directors);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách đạo diễn", error });
  }
};

export const getAdminDirectorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const director = await Director.findById(req.params.id);
    if (!director) {
      res.status(404).json({ success: false, message: "Không tìm thấy đạo diễn" });
      return;
    }
    res.status(200).json(director);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết đạo diễn", error });
  }
};

export const createDirector = async (req: Request, res: Response): Promise<void> => {
  try {
    const newDirector = new Director(req.body);
    const saved = await newDirector.save();
    res.status(201).json({ success: true, message: "Thêm đạo diễn thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo đạo diễn", error });
  }
};

export const updateDirector = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Director.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy đạo diễn" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật đạo diễn thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật đạo diễn", error });
  }
};

export const deleteDirector = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Director.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Không tìm thấy đạo diễn" });
      return;
    }
    res.status(200).json({ success: true, message: "Xóa đạo diễn thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xóa đạo diễn", error });
  }
};

// ==================== REVIEWS (Admin) ====================

export const getAdminReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, page = "1", limit = "20" } = req.query;
    const filter = movieId ? { movie: String(movieId) } : {};
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("movie", "title poster_url")
        .populate("user", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách bình luận", error });
  }
};

export const getAdminReviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("movie", "title poster_url")
      .populate("user", "fullName email");
    if (!review) {
      res.status(404).json({ success: false, message: "Không tìm thấy bình luận" });
      return;
    }
    res.status(200).json(review);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết bình luận", error });
  }
};

export const deleteAdminReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Không tìm thấy bình luận" });
      return;
    }

    const stats = await Review.aggregate([
      { $match: { movie: deleted.movie } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await Movie.findByIdAndUpdate(deleted.movie, {
        rating: Math.round(stats[0].avgRating * 2 * 10) / 10,
        total_reviews: stats[0].count,
      });
    } else {
      await Movie.findByIdAndUpdate(deleted.movie, { rating: 0, total_reviews: 0 });
    }

    res.status(200).json({ success: true, message: "Xóa bình luận thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xóa bình luận", error });
  }
};
