// Helper format tiền tệ VND + ngày giờ (kiểu CGV)

export const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);

// VD: "2026-06-18T10:00:00Z" -> "18/06/2026"
export const formatDate = (iso: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN");
};

// VD: "2026-06-18T10:00:00Z" -> "10:00"
export const formatTime = (iso: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};
