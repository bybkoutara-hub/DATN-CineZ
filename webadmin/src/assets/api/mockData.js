// ============================================================
// CineZ Admin Dashboard - Mock Data
// Dữ liệu mẫu cho hệ thống quản lý rạp chiếu phim
// ============================================================

// Helper tạo ngày
const today = new Date();
const formatDate = (d) => d.toISOString().split('T')[0];
const addDays = (d, days) => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};
const subtractDays = (d, days) => addDays(d, -days);
const formatDateTime = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

// ============================================================
// USERS - Tài khoản hệ thống
// ============================================================
export const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    fullName: 'Nguyễn Văn Admin',
    role: 'admin',
    avatar: '',
    email: 'admin@cinez.vn',
    phone: '0901234567',
  },
  {
    id: 2,
    username: 'staff',
    password: 'staff123',
    fullName: 'Trần Thị Staff',
    role: 'staff',
    avatar: '',
    email: 'staff@cinez.vn',
    phone: '0912345678',
  },
];

// ============================================================
// GENRES - Thể loại phim
// ============================================================
export const genres = [
  { id: 1, name: 'Hành Động', description: 'Phim hành động, đánh đấm, rượt đuổi gay cấn' },
  { id: 2, name: 'Tình Cảm', description: 'Phim tình cảm, lãng mạn, drama' },
  { id: 3, name: 'Kinh Dị', description: 'Phim kinh dị, rùng rợn, giật gân' },
  { id: 4, name: 'Hài', description: 'Phim hài hước, vui nhộn, giải trí' },
  { id: 5, name: 'Khoa Học Viễn Tưởng', description: 'Phim khoa học viễn tưởng, công nghệ tương lai' },
  { id: 6, name: 'Hoạt Hình', description: 'Phim hoạt hình dành cho mọi lứa tuổi' },
  { id: 7, name: 'Tâm Lý', description: 'Phim tâm lý, kịch tính, sâu sắc' },
  { id: 8, name: 'Phiêu Lưu', description: 'Phim phiêu lưu, mạo hiểm, khám phá' },
  { id: 9, name: 'Tài Liệu', description: 'Phim tài liệu, thực tế, giáo dục' },
  { id: 10, name: 'Âm Nhạc', description: 'Phim âm nhạc, ca hát, nhảy múa' },
];

// ============================================================
// MOVIES - Danh sách phim
// ============================================================
export const movies = [
  {
    id: 1,
    title: 'Lật Mặt 8: Vòng Tay Nắng',
    originalTitle: 'Lật Mặt 8: Vòng Tay Nắng',
    poster: 'https://picsum.photos/seed/latmat8/300/450',
    description: 'Phần 8 của thương hiệu Lật Mặt do Lý Hải đạo diễn, kể câu chuyện cảm động về tình cảm gia đình, sự hy sinh của người mẹ Việt Nam qua nhiều thế hệ.',
    genres: [2, 7, 4],
    director: 'Lý Hải',
    cast: ['Lý Hải', 'Trấn Thành', 'Kiều Minh Tuấn', 'Ốc Thanh Vân', 'NSND Mỹ Uyên'],
    duration: 132,
    releaseDate: '2025-04-25',
    language: 'Tiếng Việt',
    subtitle: '',
    trailerUrl: 'https://youtube.com/watch?v=latmat8',
    rated: 'P',
    status: 'showing',
    rating: 8.5,
  },
  {
    id: 2,
    title: 'Mai',
    originalTitle: 'Mai',
    poster: 'https://picsum.photos/seed/mai2024/300/450',
    description: 'Câu chuyện tình yêu giữa Dương - một chàng trai Sài Gòn sống phóng khoáng và Mai - cô gái massage với quá khứ đau buồn. Phim của đạo diễn Trấn Thành.',
    genres: [2, 7],
    director: 'Trấn Thành',
    cast: ['Phương Anh Đào', 'Tuấn Trần', 'Hồng Đào', 'NSƯT Hữu Châu', 'Trấn Thành'],
    duration: 131,
    releaseDate: '2025-02-10',
    language: 'Tiếng Việt',
    subtitle: '',
    trailerUrl: 'https://youtube.com/watch?v=mai2025',
    rated: 'C16',
    status: 'showing',
    rating: 8.2,
  },
  {
    id: 3,
    title: 'Đào, Phở và Piano',
    originalTitle: 'Đào, Phở và Piano',
    poster: 'https://picsum.photos/seed/daopho/300/450',
    description: 'Bộ phim lấy bối cảnh Hà Nội năm 1946 trong những ngày đầu toàn quốc kháng chiến, kể về câu chuyện tình yêu và lòng yêu nước của những người trẻ.',
    genres: [2, 7, 1],
    director: 'Phi Tiến Sơn',
    cast: ['Doãn Quốc Đam', 'Cao Thùy Linh', 'NSƯT Trần Lực', 'Tuấn Hưng'],
    duration: 100,
    releaseDate: '2025-02-12',
    language: 'Tiếng Việt',
    subtitle: '',
    trailerUrl: 'https://youtube.com/watch?v=daopho',
    rated: 'C13',
    status: 'ended',
    rating: 7.8,
  },
  {
    id: 4,
    title: 'Godzilla x Kong: Đế Chế Mới',
    originalTitle: 'Godzilla x Kong: The New Empire',
    poster: 'https://picsum.photos/seed/godzillakong/300/450',
    description: 'Godzilla và Kong cùng hợp sức chống lại mối đe dọa chưa từng có từ thế giới ngầm, nơi ẩn chứa lịch sử bí ẩn về các Titan.',
    genres: [1, 5, 8],
    director: 'Adam Wingard',
    cast: ['Rebecca Hall', 'Brian Tyree Henry', 'Dan Stevens', 'Kaylee Hottle'],
    duration: 115,
    releaseDate: '2025-03-29',
    language: 'Tiếng Anh',
    subtitle: 'Phụ đề Tiếng Việt',
    trailerUrl: 'https://youtube.com/watch?v=godzillakong',
    rated: 'C13',
    status: 'showing',
    rating: 7.5,
  },
  {
    id: 5,
    title: 'Inside Out 2: Thế Giới Cảm Xúc 2',
    originalTitle: 'Inside Out 2',
    poster: 'https://picsum.photos/seed/insideout2/300/450',
    description: 'Riley bước vào tuổi thiếu niên và trụ sở cảm xúc trong tâm trí cô bé phải đối mặt với những cảm xúc mới bất ngờ: Lo Âu, Ghen Tỵ, Chán Nản và Xấu Hổ.',
    genres: [6, 4, 7],
    director: 'Kelsey Mann',
    cast: ['Amy Poehler', 'Maya Hawke', 'Ayo Edebiri', 'Liza Lapira'],
    duration: 96,
    releaseDate: '2025-06-14',
    language: 'Lồng Tiếng Việt',
    subtitle: '',
    trailerUrl: 'https://youtube.com/watch?v=insideout2',
    rated: 'P',
    status: 'coming',
    rating: 9.0,
  },
  {
    id: 6,
    title: 'Quật Mộ Trùng Ma',
    originalTitle: 'Quật Mộ Trùng Ma',
    poster: 'https://picsum.photos/seed/quatmo/300/450',
    description: 'Một nhóm bạn trẻ vô tình đánh thức linh hồn cổ đại khi khai quật ngôi mộ bí ẩn trong rừng sâu miền Tây Nam Bộ. Sự kinh hoàng bắt đầu.',
    genres: [3, 7],
    director: 'Trần Hữu Tấn',
    cast: ['Quốc Trường', 'Bảo Ngọc', 'Lê Giang', 'Huỳnh Đông'],
    duration: 108,
    releaseDate: '2025-05-01',
    language: 'Tiếng Việt',
    subtitle: '',
    trailerUrl: 'https://youtube.com/watch?v=quatmo',
    rated: 'C18',
    status: 'showing',
    rating: 7.0,
  },
  {
    id: 7,
    title: 'Kung Fu Panda 4',
    originalTitle: 'Kung Fu Panda 4',
    poster: 'https://picsum.photos/seed/kungfupanda4/300/450',
    description: 'Po phải tìm kiếm và huấn luyện người kế nhiệm mới trước khi đối mặt với phù thủy Chameleon - kẻ có thể biến hình thành bất cứ ai.',
    genres: [6, 1, 4],
    director: 'Mike Mitchell',
    cast: ['Jack Black', 'Awkwafina', 'Viola Davis', 'Dustin Hoffman'],
    duration: 94,
    releaseDate: '2025-03-08',
    language: 'Lồng Tiếng Việt',
    subtitle: '',
    trailerUrl: 'https://youtube.com/watch?v=kfp4',
    rated: 'P',
    status: 'ended',
    rating: 7.3,
  },
  {
    id: 8,
    title: 'Deadpool & Wolverine',
    originalTitle: 'Deadpool & Wolverine',
    poster: 'https://picsum.photos/seed/deadpoolwolv/300/450',
    description: 'Deadpool gia nhập MCU với sự trở lại của Wolverine. Cả hai buộc phải hợp tác để đối mặt với mối đe dọa đa vũ trụ chưa từng có.',
    genres: [1, 4, 5],
    director: 'Shawn Levy',
    cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Morena Baccarin'],
    duration: 128,
    releaseDate: '2025-07-26',
    language: 'Tiếng Anh',
    subtitle: 'Phụ đề Tiếng Việt',
    trailerUrl: 'https://youtube.com/watch?v=deadpool3',
    rated: 'C18',
    status: 'coming',
    rating: 8.8,
  },
  {
    id: 9,
    title: 'Nhà Bà Nữ',
    originalTitle: 'Nhà Bà Nữ',
    poster: 'https://picsum.photos/seed/nhabanu/300/450',
    description: 'Câu chuyện hài hước và cảm động về ba thế hệ phụ nữ trong gia đình bà Nữ - người mẹ bán bánh canh nổi tiếng Sài Gòn.',
    genres: [4, 2, 7],
    director: 'Trấn Thành',
    cast: ['Trấn Thành', 'Lê Giang', 'NSND Ngọc Giàu', 'Uyển Ân', 'NSƯT Hữu Châu'],
    duration: 135,
    releaseDate: '2025-01-01',
    language: 'Tiếng Việt',
    subtitle: '',
    trailerUrl: 'https://youtube.com/watch?v=nhabanu',
    rated: 'C13',
    status: 'ended',
    rating: 7.9,
  },
  {
    id: 10,
    title: 'Furiosa: Câu Chuyện Từ Mad Max',
    originalTitle: 'Furiosa: A Mad Max Saga',
    poster: 'https://picsum.photos/seed/furiosa/300/450',
    description: 'Câu chuyện về nguồn gốc của Furiosa, từ cô bé bị bắt cóc đến nữ chiến binh huyền thoại trên Đường Giận Dữ.',
    genres: [1, 8, 5],
    director: 'George Miller',
    cast: ['Anya Taylor-Joy', 'Chris Hemsworth', 'Tom Burke', 'Alyla Browne'],
    duration: 148,
    releaseDate: '2025-05-24',
    language: 'Tiếng Anh',
    subtitle: 'Phụ đề Tiếng Việt',
    trailerUrl: 'https://youtube.com/watch?v=furiosa',
    rated: 'C16',
    status: 'showing',
    rating: 8.1,
  },
];

// ============================================================
// ROOMS - Phòng chiếu
// ============================================================
export const rooms = [
  { id: 1, name: 'Phòng 1', type: '2D', totalSeats: 120, rows: 10, seatsPerRow: 12, status: 'active' },
  { id: 2, name: 'Phòng 2', type: '2D', totalSeats: 120, rows: 10, seatsPerRow: 12, status: 'active' },
  { id: 3, name: 'Phòng 3', type: '3D', totalSeats: 120, rows: 10, seatsPerRow: 12, status: 'active' },
  { id: 4, name: 'Phòng 4', type: 'IMAX', totalSeats: 120, rows: 10, seatsPerRow: 12, status: 'active' },
  { id: 5, name: 'Phòng 5', type: '4DX', totalSeats: 120, rows: 10, seatsPerRow: 12, status: 'active' },
  { id: 6, name: 'Phòng 6', type: '2D', totalSeats: 120, rows: 10, seatsPerRow: 12, status: 'maintenance' },
];

// ============================================================
// SEATS - Ghế ngồi (tạo tự động)
// ============================================================
const ROW_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

function generateSeats(roomList) {
  const allSeats = [];
  let seatId = 1;

  roomList.forEach((room) => {
    for (let r = 0; r < room.rows; r++) {
      const rowLetter = ROW_LETTERS[r];
      for (let s = 1; s <= room.seatsPerRow; s++) {
        let type = 'standard';
        let price = 75000;

        if (r >= 3 && r <= 6) {
          type = 'vip';
          price = 95000;
        } else if (r >= 7) {
          if (s % 2 === 1 && s < room.seatsPerRow) {
            type = 'couple';
            price = 150000;
          } else if (s % 2 === 0) {
            type = 'sweetbox';
            price = 150000;
          }
        }

        // Thêm phụ phí theo loại phòng
        if (room.type === '3D') price += 20000;
        if (room.type === 'IMAX') price += 40000;
        if (room.type === '4DX') price += 50000;

        // Một vài ghế bảo trì / hỏng
        let status = 'available';
        if (room.status === 'maintenance') {
          status = 'maintenance';
        } else if (seatId % 47 === 0) {
          status = 'broken';
        } else if (seatId % 73 === 0) {
          status = 'maintenance';
        }

        allSeats.push({
          id: seatId,
          roomId: room.id,
          row: rowLetter,
          number: s,
          type,
          price,
          status,
        });
        seatId++;
      }
    }
  });

  return allSeats;
}

export const seats = generateSeats(rooms);

// ============================================================
// SHOWTIMES - Suất chiếu
// ============================================================
const timeSlots = [
  { start: '08:00', endOffset: 0 },
  { start: '10:30', endOffset: 0 },
  { start: '13:00', endOffset: 0 },
  { start: '15:30', endOffset: 0 },
  { start: '18:00', endOffset: 0 },
  { start: '20:30', endOffset: 0 },
  { start: '22:45', endOffset: 0 },
];

function generateShowtimes() {
  const result = [];
  let id = 1;
  const showingMovies = movies.filter((m) => m.status === 'showing');
  const activeRooms = rooms.filter((r) => r.status === 'active');

  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const date = formatDate(addDays(today, dayOffset));

    activeRooms.forEach((room, roomIdx) => {
      // Mỗi phòng chiếu 3-4 suất/ngày
      const slotsForRoom = timeSlots.filter((_, i) => (i + roomIdx) % 2 === 0).slice(0, 4);

      slotsForRoom.forEach((slot, slotIdx) => {
        const movie = showingMovies[(roomIdx + slotIdx + dayOffset) % showingMovies.length];
        const durationHours = Math.floor(movie.duration / 60);
        const durationMins = movie.duration % 60;
        const [startH, startM] = slot.start.split(':').map(Number);
        let endH = startH + durationHours;
        let endM = startM + durationMins;
        if (endM >= 60) {
          endH += 1;
          endM -= 60;
        }
        const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        const basePrice = room.type === 'IMAX' ? 120000 : room.type === '4DX' ? 130000 : room.type === '3D' ? 90000 : 75000;

        result.push({
          id,
          movieId: movie.id,
          roomId: room.id,
          date,
          startTime: slot.start,
          endTime,
          basePrice,
          status: id % 23 === 0 ? 'cancelled' : 'active',
        });
        id++;
      });
    });
  }

  return result;
}

export const showtimes = generateShowtimes();

// ============================================================
// COMBOS - Bắp nước
// ============================================================
export const combos = [
  {
    id: 1,
    name: 'Combo Couple',
    image: 'https://picsum.photos/seed/combo1/200/200',
    description: '1 Bắp Rang Lớn + 2 Nước Ngọt Lớn',
    price: 115000,
    items: ['1 Bắp Rang Lớn', '2 Coca-Cola Lớn'],
    status: 'active',
  },
  {
    id: 2,
    name: 'Combo Single',
    image: 'https://picsum.photos/seed/combo2/200/200',
    description: '1 Bắp Rang Vừa + 1 Nước Ngọt Vừa',
    price: 75000,
    items: ['1 Bắp Rang Vừa', '1 Pepsi Vừa'],
    status: 'active',
  },
  {
    id: 3,
    name: 'Bắp Rang Lớn',
    image: 'https://picsum.photos/seed/combo3/200/200',
    description: 'Bắp rang bơ size lớn 64oz',
    price: 55000,
    items: ['1 Bắp Rang Lớn 64oz'],
    status: 'active',
  },
  {
    id: 4,
    name: 'Nước Ngọt Lớn',
    image: 'https://picsum.photos/seed/combo4/200/200',
    description: 'Nước ngọt size lớn 32oz (Coca/Pepsi/Fanta/Sprite)',
    price: 35000,
    items: ['1 Nước Ngọt Lớn 32oz'],
    status: 'active',
  },
  {
    id: 5,
    name: 'Combo Family',
    image: 'https://picsum.photos/seed/combo5/200/200',
    description: '2 Bắp Rang Lớn + 4 Nước Ngọt Lớn + 1 Khoai Lắc',
    price: 199000,
    items: ['2 Bắp Rang Lớn', '4 Nước Ngọt Lớn', '1 Khoai Lắc'],
    status: 'active',
  },
  {
    id: 6,
    name: 'Combo Party',
    image: 'https://picsum.photos/seed/combo6/200/200',
    description: '1 Bắp Rang Siêu Lớn + 4 Nước Ngọt Vừa + 2 Hotdog',
    price: 249000,
    items: ['1 Bắp Rang Siêu Lớn', '4 Nước Ngọt Vừa', '2 Hotdog'],
    status: 'active',
  },
  {
    id: 7,
    name: 'Hotdog Phô Mai',
    image: 'https://picsum.photos/seed/combo7/200/200',
    description: 'Hotdog xúc xích phô mai nóng hổi',
    price: 45000,
    items: ['1 Hotdog Phô Mai'],
    status: 'active',
  },
  {
    id: 8,
    name: 'Combo Snack',
    image: 'https://picsum.photos/seed/combo8/200/200',
    description: '1 Bắp Rang Vừa + 1 Khoai Lắc + 1 Nước Ngọt Vừa',
    price: 99000,
    items: ['1 Bắp Rang Vừa', '1 Khoai Lắc Phô Mai', '1 Nước Ngọt Vừa'],
    status: 'inactive',
  },
];

// ============================================================
// PROMOTIONS - Khuyến mãi
// ============================================================
export const promotions = [
  {
    id: 1,
    code: 'CINEZ10',
    name: 'Giảm 10% đơn hàng',
    description: 'Giảm 10% cho đơn hàng từ 200.000đ trở lên',
    type: 'percent',
    value: 10,
    minOrderValue: 200000,
    maxDiscount: 50000,
    startDate: formatDate(subtractDays(today, 15)),
    endDate: formatDate(addDays(today, 30)),
    usageLimit: 500,
    usedCount: 123,
    status: 'active',
  },
  {
    id: 2,
    code: 'NEWMEMBER',
    name: 'Chào thành viên mới',
    description: 'Giảm 30.000đ cho thành viên mới đăng ký',
    type: 'fixed',
    value: 30000,
    minOrderValue: 100000,
    maxDiscount: 30000,
    startDate: formatDate(subtractDays(today, 60)),
    endDate: formatDate(addDays(today, 60)),
    usageLimit: 1000,
    usedCount: 456,
    status: 'active',
  },
  {
    id: 3,
    code: 'WEEKEND20',
    name: 'Cuối tuần vui vẻ',
    description: 'Giảm 20% vào thứ 7 & Chủ nhật',
    type: 'percent',
    value: 20,
    minOrderValue: 150000,
    maxDiscount: 80000,
    startDate: formatDate(subtractDays(today, 10)),
    endDate: formatDate(addDays(today, 20)),
    usageLimit: 300,
    usedCount: 89,
    status: 'active',
  },
  {
    id: 4,
    code: 'SUMMER50',
    name: 'Hè sôi động',
    description: 'Giảm 50.000đ cho combo từ 150.000đ',
    type: 'fixed',
    value: 50000,
    minOrderValue: 150000,
    maxDiscount: 50000,
    startDate: formatDate(addDays(today, 10)),
    endDate: formatDate(addDays(today, 90)),
    usageLimit: 200,
    usedCount: 0,
    status: 'upcoming',
  },
  {
    id: 5,
    code: 'XMAS2024',
    name: 'Giáng sinh an lành',
    description: 'Giảm 25% cho mùa Giáng sinh',
    type: 'percent',
    value: 25,
    minOrderValue: 200000,
    maxDiscount: 100000,
    startDate: '2024-12-20',
    endDate: '2024-12-31',
    usageLimit: 500,
    usedCount: 500,
    status: 'expired',
  },
];

// ============================================================
// MEMBERS - Thành viên
// ============================================================
export const members = [
  {
    id: 1,
    fullName: 'Nguyễn Thị Lan Anh',
    email: 'lananh@gmail.com',
    phone: '0901111001',
    dateOfBirth: '1995-03-15',
    registerDate: '2024-01-10',
    points: 12500,
    tier: 'gold',
    totalSpent: 5200000,
    status: 'active',
  },
  {
    id: 2,
    fullName: 'Trần Văn Bình',
    email: 'binhtran@gmail.com',
    phone: '0901111002',
    dateOfBirth: '1990-07-22',
    registerDate: '2024-02-05',
    points: 25000,
    tier: 'platinum',
    totalSpent: 12800000,
    status: 'active',
  },
  {
    id: 3,
    fullName: 'Lê Hoàng Cường',
    email: 'cuongle@gmail.com',
    phone: '0901111003',
    dateOfBirth: '1998-11-08',
    registerDate: '2024-03-18',
    points: 3200,
    tier: 'member',
    totalSpent: 1500000,
    status: 'active',
  },
  {
    id: 4,
    fullName: 'Phạm Thị Dung',
    email: 'dungpham@gmail.com',
    phone: '0901111004',
    dateOfBirth: '1993-05-30',
    registerDate: '2024-01-25',
    points: 7800,
    tier: 'silver',
    totalSpent: 3400000,
    status: 'active',
  },
  {
    id: 5,
    fullName: 'Hoàng Minh Đức',
    email: 'duchoang@gmail.com',
    phone: '0901111005',
    dateOfBirth: '2000-09-14',
    registerDate: '2024-04-02',
    points: 1500,
    tier: 'member',
    totalSpent: 750000,
    status: 'active',
  },
  {
    id: 6,
    fullName: 'Vũ Thị Hương Giang',
    email: 'giangvu@gmail.com',
    phone: '0901111006',
    dateOfBirth: '1997-01-20',
    registerDate: '2024-05-11',
    points: 9200,
    tier: 'gold',
    totalSpent: 4100000,
    status: 'active',
  },
  {
    id: 7,
    fullName: 'Đỗ Quang Hải',
    email: 'haido@gmail.com',
    phone: '0901111007',
    dateOfBirth: '1988-12-05',
    registerDate: '2023-11-20',
    points: 18500,
    tier: 'platinum',
    totalSpent: 9200000,
    status: 'active',
  },
  {
    id: 8,
    fullName: 'Bùi Thị Kiều',
    email: 'kieubui@gmail.com',
    phone: '0901111008',
    dateOfBirth: '1996-08-17',
    registerDate: '2024-06-03',
    points: 4500,
    tier: 'silver',
    totalSpent: 2100000,
    status: 'active',
  },
  {
    id: 9,
    fullName: 'Ngô Thanh Long',
    email: 'longngo@gmail.com',
    phone: '0901111009',
    dateOfBirth: '1992-04-28',
    registerDate: '2024-07-15',
    points: 2800,
    tier: 'member',
    totalSpent: 1200000,
    status: 'inactive',
  },
  {
    id: 10,
    fullName: 'Đặng Thị Mai',
    email: 'maidang@gmail.com',
    phone: '0901111010',
    dateOfBirth: '1999-06-10',
    registerDate: '2024-08-22',
    points: 6100,
    tier: 'silver',
    totalSpent: 2800000,
    status: 'active',
  },
  {
    id: 11,
    fullName: 'Lý Quốc Nam',
    email: 'namly@gmail.com',
    phone: '0901111011',
    dateOfBirth: '1994-10-03',
    registerDate: '2024-02-14',
    points: 15000,
    tier: 'gold',
    totalSpent: 6500000,
    status: 'active',
  },
  {
    id: 12,
    fullName: 'Trương Thị Oanh',
    email: 'oanhtruong@gmail.com',
    phone: '0901111012',
    dateOfBirth: '2001-02-25',
    registerDate: '2024-09-05',
    points: 800,
    tier: 'member',
    totalSpent: 350000,
    status: 'active',
  },
  {
    id: 13,
    fullName: 'Cao Văn Phúc',
    email: 'phuccao@gmail.com',
    phone: '0901111013',
    dateOfBirth: '1991-07-19',
    registerDate: '2024-03-30',
    points: 11000,
    tier: 'gold',
    totalSpent: 4800000,
    status: 'active',
  },
  {
    id: 14,
    fullName: 'Hồ Thị Quỳnh',
    email: 'quynhho@gmail.com',
    phone: '0901111014',
    dateOfBirth: '1987-11-12',
    registerDate: '2023-12-01',
    points: 22000,
    tier: 'platinum',
    totalSpent: 11000000,
    status: 'active',
  },
  {
    id: 15,
    fullName: 'Mai Xuân Sơn',
    email: 'sonmai@gmail.com',
    phone: '0901111015',
    dateOfBirth: '2002-03-08',
    registerDate: '2024-10-18',
    points: 500,
    tier: 'member',
    totalSpent: 250000,
    status: 'inactive',
  },
];

// ============================================================
// STAFF - Nhân viên
// ============================================================
export const staffList = [
  {
    id: 1,
    fullName: 'Nguyễn Văn Quản Lý',
    email: 'quanly@cinez.vn',
    phone: '0908001001',
    role: 'manager',
    department: 'Quản lý',
    startDate: '2022-01-15',
    salary: 18000000,
    status: 'active',
  },
  {
    id: 2,
    fullName: 'Trần Thị Thu Ngân',
    email: 'thungan1@cinez.vn',
    phone: '0908001002',
    role: 'cashier',
    department: 'Thu ngân',
    startDate: '2023-03-10',
    salary: 9500000,
    status: 'active',
  },
  {
    id: 3,
    fullName: 'Lê Minh Soát Vé',
    email: 'soatve1@cinez.vn',
    phone: '0908001003',
    role: 'usher',
    department: 'Soát vé',
    startDate: '2023-06-01',
    salary: 7500000,
    status: 'active',
  },
  {
    id: 4,
    fullName: 'Phạm Thị Hồng Nhung',
    email: 'nhungpham@cinez.vn',
    phone: '0908001004',
    role: 'cashier',
    department: 'Thu ngân',
    startDate: '2023-08-15',
    salary: 9000000,
    status: 'active',
  },
  {
    id: 5,
    fullName: 'Hoàng Đức Anh',
    email: 'ducanhhoang@cinez.vn',
    phone: '0908001005',
    role: 'usher',
    department: 'Soát vé',
    startDate: '2024-01-20',
    salary: 7500000,
    status: 'active',
  },
  {
    id: 6,
    fullName: 'Vũ Thị Thanh Tâm',
    email: 'tamvu@cinez.vn',
    phone: '0908001006',
    role: 'cashier',
    department: 'Thu ngân',
    startDate: '2024-02-10',
    salary: 8500000,
    status: 'active',
  },
  {
    id: 7,
    fullName: 'Đỗ Trung Kiên',
    email: 'kiendo@cinez.vn',
    phone: '0908001007',
    role: 'usher',
    department: 'Soát vé',
    startDate: '2024-04-05',
    salary: 7000000,
    status: 'inactive',
  },
  {
    id: 8,
    fullName: 'Bùi Thị Ngọc Trâm',
    email: 'trambui@cinez.vn',
    phone: '0908001008',
    role: 'manager',
    department: 'Quản lý',
    startDate: '2022-06-20',
    salary: 16000000,
    status: 'active',
  },
];

// ============================================================
// SLIDERS - Banner quảng cáo
// ============================================================
export const sliders = [
  {
    id: 1,
    title: 'Lật Mặt 8 - Khởi chiếu',
    image: 'https://picsum.photos/seed/slider1/1200/400',
    link: '/movies/1',
    order: 1,
    status: 'active',
    createdAt: formatDate(subtractDays(today, 10)),
  },
  {
    id: 2,
    title: 'Ưu đãi thành viên mới - Giảm 30K',
    image: 'https://picsum.photos/seed/slider2/1200/400',
    link: '/promotions',
    order: 2,
    status: 'active',
    createdAt: formatDate(subtractDays(today, 20)),
  },
  {
    id: 3,
    title: 'Combo Family - Chỉ 199K',
    image: 'https://picsum.photos/seed/slider3/1200/400',
    link: '/combos',
    order: 3,
    status: 'active',
    createdAt: formatDate(subtractDays(today, 5)),
  },
  {
    id: 4,
    title: 'Inside Out 2 - Sắp ra mắt',
    image: 'https://picsum.photos/seed/slider4/1200/400',
    link: '/movies/5',
    order: 4,
    status: 'active',
    createdAt: formatDate(subtractDays(today, 3)),
  },
  {
    id: 5,
    title: 'Mùa hè sôi động cùng CineZ',
    image: 'https://picsum.photos/seed/slider5/1200/400',
    link: '/promotions',
    order: 5,
    status: 'inactive',
    createdAt: formatDate(subtractDays(today, 30)),
  },
];

// ============================================================
// BOOKINGS - Đặt vé
// ============================================================
const paymentMethods = ['cash', 'card', 'momo', 'zalopay'];
const paymentStatuses = ['paid', 'paid', 'paid', 'paid', 'pending', 'cancelled']; // 66% paid

function generateBookings() {
  const result = [];
  const activeShowtimes = showtimes.filter((s) => s.status === 'active').slice(0, 30);

  for (let i = 1; i <= 20; i++) {
    const showtime = activeShowtimes[(i - 1) % activeShowtimes.length];
    const movie = movies.find((m) => m.id === showtime.movieId);
    const room = rooms.find((r) => r.id === showtime.roomId);
    const roomSeats = seats.filter((s) => s.roomId === showtime.roomId && s.status === 'available');

    // Chọn 2-4 ghế ngẫu nhiên
    const numSeats = 2 + (i % 3);
    const startIdx = ((i * 7) % (roomSeats.length - numSeats));
    const selectedSeats = roomSeats.slice(startIdx, startIdx + numSeats);
    const seatTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);

    // Chọn combo
    const bookingCombos = [];
    if (i % 3 !== 0) {
      bookingCombos.push({ comboId: i % 2 === 0 ? 1 : 2, quantity: 1 });
    }
    if (i % 5 === 0) {
      bookingCombos.push({ comboId: 4, quantity: 2 });
    }
    const comboTotal = bookingCombos.reduce((sum, c) => {
      const combo = combos.find((cb) => cb.id === c.comboId);
      return sum + (combo ? combo.price * c.quantity : 0);
    }, 0);

    const totalAmount = seatTotal + comboTotal;
    const hasPromo = i % 4 === 0;
    const discountAmount = hasPromo ? Math.min(totalAmount * 0.1, 50000) : 0;
    const finalAmount = totalAmount - discountAmount;

    const paymentStatus = paymentStatuses[i % paymentStatuses.length];
    const createdDate = subtractDays(today, Math.floor(i / 3));

    result.push({
      id: i,
      memberId: (i % 15) + 1,
      showtimeId: showtime.id,
      seats: selectedSeats.map((s) => s.id),
      combos: bookingCombos,
      totalAmount,
      discountAmount,
      finalAmount,
      promotionId: hasPromo ? 1 : null,
      paymentMethod: paymentMethods[i % paymentMethods.length],
      paymentStatus,
      createdAt: formatDateTime(createdDate),
      createdBy: i % 2 === 0 ? 'admin' : 'staff',
    });
  }

  return result;
}

export const bookings = generateBookings();

// ============================================================
// INVOICES - Hóa đơn
// ============================================================
function generateInvoices() {
  return bookings.map((booking, idx) => {
    const showtime = showtimes.find((s) => s.id === booking.showtimeId);
    const movie = movies.find((m) => m.id === (showtime ? showtime.movieId : 1));
    const room = rooms.find((r) => r.id === (showtime ? showtime.roomId : 1));
    const member = members.find((m) => m.id === booking.memberId);

    const bookingSeats = booking.seats
      .map((seatId) => {
        const seat = seats.find((s) => s.id === seatId);
        return seat ? `${seat.row}${seat.number}` : '';
      })
      .filter(Boolean)
      .join(', ');

    const comboStr = booking.combos
      .map((c) => {
        const combo = combos.find((cb) => cb.id === c.comboId);
        return combo ? `${combo.name} x${c.quantity}` : '';
      })
      .filter(Boolean)
      .join(', ');

    return {
      id: idx + 1,
      bookingId: booking.id,
      invoiceNumber: `HD${String(idx + 1).padStart(3, '0')}`,
      customerName: member ? member.fullName : 'Khách vãng lai',
      movieTitle: movie ? movie.title : '',
      roomName: room ? room.name : '',
      showDate: showtime ? showtime.date : '',
      showTime: showtime ? showtime.startTime : '',
      seats: bookingSeats,
      combos: comboStr,
      subtotal: booking.totalAmount,
      discount: booking.discountAmount,
      total: booking.finalAmount,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt,
      createdBy: booking.createdBy,
    };
  });
}

export const invoices = generateInvoices();
