import { Request, Response } from "express";
import AdminBooking from "../../models/admin/adminBookingModel";
import AdminUser from "../../models/admin/adminUserModel";
import AdminMovie from "../../models/admin/adminMovieModel";
import AdminShowtime from "../../models/admin/adminShowtimeModel";

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await AdminBooking.find({ paymentStatus: "completed" });
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTickets = bookings.reduce((sum, b) => sum + b.seats.length, 0);
    const totalMembers = await AdminUser.countDocuments({ role: "customer" });
    const totalMovies = await AdminMovie.countDocuments();
    const totalShowtimes = await AdminShowtime.countDocuments({ status: "active" });
    const totalBookings = await AdminBooking.countDocuments();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayBookings = await AdminBooking.find({
      paymentStatus: "completed",
      createdAt: { $gte: todayStart },
    });
    const todayRevenue = todayBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const todayTickets = todayBookings.reduce((sum, b) => sum + b.seats.length, 0);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalTickets,
        totalMembers,
        totalMovies,
        totalShowtimes,
        totalBookings,
        todayRevenue,
        todayTickets,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi tính toán thống kê", error: error.message });
  }
};

export const getRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    const filter: any = { paymentStatus: "completed" };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }
    const bookings = await AdminBooking.find(filter).sort({ createdAt: 1 });
    const revenueByDate: Record<string, { date: string; revenue: number; tickets: number }> = {};
    bookings.forEach((b) => {
      const dateKey = b.createdAt.toISOString().slice(0, 10);
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = { date: dateKey, revenue: 0, tickets: 0 };
      }
      revenueByDate[dateKey].revenue += b.totalAmount;
      revenueByDate[dateKey].tickets += b.seats.length;
    });
    res.status(200).json(Object.values(revenueByDate));
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy doanh thu", error: error.message });
  }
};

export const getRevenueByMovie = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await AdminBooking.find({ paymentStatus: "completed" }).populate({
      path: "showtime_id",
      select: "movieId",
      populate: { path: "movieId", select: "title" },
    });
    const revenueByMovie: Record<string, { title: string; revenue: number; tickets: number }> = {};
    bookings.forEach((b: any) => {
      const movieTitle = b.showtime_id?.movieId?.title || "Unknown";
      if (!revenueByMovie[movieTitle]) {
        revenueByMovie[movieTitle] = { title: movieTitle, revenue: 0, tickets: 0 };
      }
      revenueByMovie[movieTitle].revenue += b.totalAmount;
      revenueByMovie[movieTitle].tickets += b.seats.length;
    });
    res.status(200).json(Object.values(revenueByMovie).sort((a, b) => b.revenue - a.revenue));
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy doanh thu theo phim", error: error.message });
  }
};

export const getTopMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const bookings = await AdminBooking.find({ paymentStatus: "completed" }).populate({
      path: "showtime_id",
      select: "movieId",
      populate: { path: "movieId", select: "title poster" },
    });
    const movieStats: Record<string, any> = {};
    bookings.forEach((b: any) => {
      const movie = b.showtime_id?.movieId;
      if (!movie) return;
      const id = movie._id.toString();
      if (!movieStats[id]) {
        movieStats[id] = {
          _id: id,
          title: movie.title,
          poster: movie.poster,
          revenue: 0,
          tickets: 0,
        };
      }
      movieStats[id].revenue += b.totalAmount;
      movieStats[id].tickets += b.seats.length;
    });
    res
      .status(200)
      .json(Object.values(movieStats).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, limit));
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy top phim", error: error.message });
  }
};
