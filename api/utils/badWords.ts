const badWords: string[] = [
  "địt", "đụ", "lồn", "buồi", "cặc", "chó", "đĩ", "lol", "cc", "vkl",
  "đm", "vl", "cl", "vãi", "lz", "loz", "cặc", "bú", "cu", "cak",
  "đĩ", "đit", "dit", "du", "lon", "buoi", "cac", "chim", "dkm",
  "dmm", "đmm", "dm", "ml", "mẹ", "má", "đụ mẹ", "đụ má",
  "fuck", "shit", "bitch", "ass", "damn", "dick", "cock",
  "porn", "sex", "đéo", "đếu", "địt mẹ", "địt má", "đụ mẹ",
  "cặc chó", "đĩ mẹ", "loằn", "lồn mẹ",
];

export function containsBadWords(text: string): boolean {
  const lower = text.toLowerCase();
  return badWords.some(word => lower.includes(word));
}
