#!/usr/bin/env bash
# Bộ test toàn bộ API node-api (cổng 5001)
BASE="http://localhost:5001"
PASS=0; FAIL=0
RND=$RANDOM

# Hàm test: tên | method | path | data | mã kỳ vọng | [header auth]
check() {
  local name="$1" method="$2" path="$3" data="$4" expect="$5" auth="$6"
  local args=(-s -m 10 -o /tmp/body.json -w "%{http_code}" -X "$method" "$BASE$path")
  [ -n "$data" ] && args+=(-H "Content-Type: application/json" -d "$data")
  [ -n "$auth" ] && args+=(-H "Authorization: Bearer $auth")
  local code=$(curl "${args[@]}")
  if [ "$code" = "$expect" ]; then
    echo "✅ [$code] $name"
    PASS=$((PASS+1))
  else
    echo "❌ [got $code, mong $expect] $name"
    echo "     → $(head -c 200 /tmp/body.json)"
    FAIL=$((FAIL+1))
  fi
}

echo "==================== AUTH ===================="
EMAIL="test${RND}@gmail.com"
check "Đăng ký (thiếu field)" POST /api/auth/register '{"name":"A"}' 400
check "Đăng ký thành công" POST /api/auth/register "{\"name\":\"Người Test\",\"email\":\"$EMAIL\",\"password\":\"123456\",\"phone\":\"0900000000\"}" 201
check "Đăng ký trùng email" POST /api/auth/register "{\"name\":\"X\",\"email\":\"$EMAIL\",\"password\":\"123456\"}" 400
check "Đăng nhập sai mật khẩu" POST /api/auth/login "{\"email\":\"$EMAIL\",\"password\":\"sai\"}" 401
check "Đăng nhập thành công" POST /api/auth/login "{\"email\":\"$EMAIL\",\"password\":\"123456\"}" 200
TOKEN=$(node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).token||'')}catch(e){console.log('')}})" < /tmp/body.json)
echo "   🔑 Token: ${TOKEN:0:25}..."
check "Profile (không token)" GET /api/auth/profile "" 401
check "Profile (có token)" GET /api/auth/profile "" 200 "$TOKEN"

echo "==================== MOVIES ===================="
check "Health check /" GET / "" 200
check "Danh sách phim" GET /api/movies "" 200
check "Lọc phim now_playing" GET "/api/movies?status=now_playing" "" 200
check "Thêm phim mới" POST /api/movies '{"title":"Phim Test API","poster_url":"http://x/p.jpg","duration":120,"genres":["Test"],"release_date":"2026-07-01","status":"coming_soon"}' 201
MOVIE_ID=$(node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).data._id)}catch(e){console.log('')}})" < /tmp/body.json)
echo "   🎬 Movie ID mới: $MOVIE_ID"
check "Chi tiết phim + suất chiếu" GET "/api/movies/$MOVIE_ID" "" 200
check "Chi tiết phim ID sai" GET "/api/movies/000000000000000000000000" "" 404

echo "==================== SHOWTIMES ===================="
check "Thêm suất chiếu" POST /api/movies/showtimes "{\"movieId\":\"$MOVIE_ID\",\"roomName\":\"Phòng Test\",\"startTime\":\"2026-09-01T10:00:00Z\",\"price\":80000}" 201
SHOW_ID=$(node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).data._id)}catch(e){console.log('')}})" < /tmp/body.json)
echo "   🕐 Showtime ID mới: $SHOW_ID"
check "Chi tiết suất chiếu" GET "/api/movies/showtimes/$SHOW_ID" "" 200

echo "==================== BOOKINGS ===================="
check "Đặt vé (không token)" POST /api/bookings '{"showtimeId":"x","seats":["A1"]}' 401
# Lấy 1 showtime thật từ seed để đặt vé
REAL_SHOW=$(curl -s -m 10 "$BASE/api/movies" | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',async()=>{const m=JSON.parse(d).data[0];const r=await fetch('$BASE/api/movies/'+m._id);const j=await r.json();console.log((j.data.showtimes[0]||{})._id||'')})")
echo "   🎟️  Showtime thật để đặt: $REAL_SHOW"
check "Đặt vé thành công" POST /api/bookings "{\"showtimeId\":\"$REAL_SHOW\",\"seats\":[\"A1\",\"A2\"],\"totalPrice\":180000}" 201 "$TOKEN"
check "Lịch sử đặt vé của tôi" GET /api/bookings/my-history "" 200 "$TOKEN"

echo ""
echo "==================== KẾT QUẢ ===================="
echo "✅ PASS: $PASS    ❌ FAIL: $FAIL"
