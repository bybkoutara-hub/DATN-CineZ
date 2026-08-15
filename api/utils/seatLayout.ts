export interface ICenterZone {
  rows: string[];
  cols: number[];
}

export interface IRoomLayout {
  rows: string[];
  cols: number;
  numbering: "forward" | "reverse";
  rowTypes: Record<string, string>;
  rowStartNumbers: Record<string, number>;
  centerZone: ICenterZone | null;
}

// ==================== LAYOUT CHUẨN ====================
// 8 hàng (A-H) x 15 cột, đánh số NGƯỢC từ phải sang trái (15 bên trái -> 01 bên phải)
// A, B, C: Ghế thường | D, E, F, G: Ghế VIP | H: Ghế đôi (couple)
// Vùng trung tâm (Prime): C05-C11, D05-D11, E05-E11, F05-F11
export const DEFAULT_LAYOUT: IRoomLayout = {
  rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
  cols: 15,
  numbering: "reverse",
  rowTypes: {
    A: "standard",
    B: "standard",
    C: "standard",
    D: "vip",
    E: "vip",
    F: "vip",
    G: "vip",
    H: "couple",
  },
  rowStartNumbers: {
    A: 14,
    B: 15,
    C: 15,
    D: 13,
    E: 14,
    F: 14,
    G: 15,
    H: 12,
  },
  centerZone: {
    rows: ["C", "D", "E", "F"],
    cols: [5, 6, 7, 8, 9, 10, 11],
  },
};

// Fallback layout đơn giản (đánh số thuận 1..n) khi phòng cũ không có layout
export function buildDefaultLayout(rowsCount: number, seatsPerRow: number): IRoomLayout {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const rows = Array.from({ length: rowsCount }, (_, i) => letters[i] as string);
  const rowTypes: Record<string, string> = {};
  const rowStartNumbers: Record<string, number> = {};
  rows.forEach((row, i) => {
    const isCoupleRow = i >= rowsCount - 2;
    const isVipRow = i >= 3 && i <= 6;
    rowTypes[row] = isCoupleRow ? "couple" : isVipRow ? "vip" : "standard";
    rowStartNumbers[row] = isCoupleRow
      ? Math.floor(seatsPerRow / 2) * 2
      : seatsPerRow;
  });
  return {
    rows,
    cols: seatsPerRow,
    numbering: "forward",
    rowTypes,
    rowStartNumbers,
    centerZone: null,
  };
}

// Mongoose Map -> plain object (Object.entries không hoạt động với Mongoose Map)
function toRecord(v: any): Record<string, any> {
  if (!v) return {};
  if (typeof v.entries === "function") return Object.fromEntries(v as Iterable<[string, any]>);
  return { ...v };
}

function toPlain(v: any): any {
  if (v && typeof v.toObject === "function") return v.toObject();
  return v;
}

export function getLayout(room: any): IRoomLayout {
  const layout = toPlain(room?.layout) as IRoomLayout | undefined;
  if (
    layout &&
    Array.isArray(layout.rows) &&
    layout.rows.length > 0 &&
    layout.cols
  ) {
    return {
      ...layout,
      rowTypes: toRecord(layout.rowTypes),
      rowStartNumbers: toRecord(layout.rowStartNumbers),
      centerZone: toPlain(layout.centerZone) || null,
    };
  }
  return buildDefaultLayout(room?.rows_count || 8, room?.seats_per_row || 15);
}

// Danh sách số ghế của một hàng (theo thứ tự hiển thị trái -> phải)
export function getRowSeatNumbers(layout: IRoomLayout, row: string): number[] {
  const start = layout.rowStartNumbers?.[row] ?? layout.cols;
  const nums: number[] = [];
  for (let n = start; n >= 1; n--) nums.push(n);
  return layout.numbering === "reverse" ? nums : nums.reverse();
}

// Các cặp ghế đôi của hàng couple, vd: [[12,11],[10,9],...]
export function getCouplePairs(layout: IRoomLayout, row: string): [number, number][] | null {
  if ((layout.rowTypes?.[row] || "standard") !== "couple") return null;
  const start = layout.rowStartNumbers?.[row] ?? layout.cols;
  const pairs: [number, number][] = [];
  for (let n = start; n >= 2; n -= 2) pairs.push([n, n - 1]);
  return layout.numbering === "reverse" ? pairs : pairs.reverse();
}

// Kiểm tra ghế có thuộc vùng trung tâm không
export function isCenterSeat(layout: IRoomLayout, row: string, number: number): boolean {
  const zone: ICenterZone | null = layout.centerZone;
  if (!zone) return false;
  return zone.rows.includes(row) && zone.cols.includes(number);
}

// Toàn bộ label ghế hợp lệ (A14, A13, ..., H02, H01)
export function getSeatLabels(layout: IRoomLayout): string[] {
  const labels: string[] = [];
  layout.rows.forEach((row) => {
    getRowSeatNumbers(layout, row).forEach((n) => labels.push(`${row}${n}`));
  });
  return labels;
}

// Giá vé mặc định theo loại ghế
export function getSeatPrice(type: string): number {
  if (type === "vip") return 95000;
  if (type === "couple") return 150000;
  return 75000;
}

const VALID_TYPES = ["standard", "vip", "couple", "disabled"];

// Kiểm tra & chuẩn hóa layout từ client trước khi lưu vào DB
export function sanitizeLayout(input: any): IRoomLayout | null {
  if (
    !input ||
    !Array.isArray(input.rows) ||
    input.rows.length === 0 ||
    input.rows.length > 26
  ) {
    return null;
  }

  const cols = Math.min(Math.max(parseInt(input.cols, 10) || 15, 1), 50);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const used = new Set<string>();
  const rows: string[] = [];
  for (const r of input.rows) {
    const row = String(r || "").trim().toUpperCase();
    if (!row || row.length !== 1 || !letters.includes(row) || used.has(row)) return null;
    used.add(row);
    rows.push(row);
  }

  const numbering = input.numbering === "forward" ? "forward" : "reverse";
  const rowTypes: Record<string, string> = {};
  const rowStartNumbers: Record<string, number> = {};
  for (const row of rows) {
    const type = VALID_TYPES.includes(input.rowTypes?.[row])
      ? input.rowTypes[row]
      : "standard";
    let start = Math.min(
      Math.max(parseInt(input.rowStartNumbers?.[row], 10) || cols, 1),
      cols
    );
    if (type === "couple") {
      if (start % 2 !== 0) start -= 1;
      if (start < 2) start = 2;
    }
    rowTypes[row] = type;
    rowStartNumbers[row] = start;
  }

  let centerZone: ICenterZone | null = null;
  if (
    input.centerZone &&
    Array.isArray(input.centerZone.rows) &&
    Array.isArray(input.centerZone.cols) &&
    input.centerZone.cols.length > 0
  ) {
    const cRows = input.centerZone.rows.filter((r: string) => rows.includes(r));
    const minCol = Math.max(1, Math.min(cols, Math.min(...input.centerZone.cols)));
    const maxCol = Math.max(minCol, Math.min(cols, Math.max(...input.centerZone.cols)));
    if (cRows.length > 0) {
      centerZone = {
        rows: cRows,
        cols: Array.from({ length: maxCol - minCol + 1 }, (_, i) => minCol + i),
      };
    }
  }

  return { rows, cols, numbering, rowTypes, rowStartNumbers, centerZone };
}

export const SEAT_TYPE_LABELS: Record<string, string> = {
  standard: "Thường",
  vip: "VIP",
  couple: "Đôi",
  disabled: "Người khuyết tật",
};
