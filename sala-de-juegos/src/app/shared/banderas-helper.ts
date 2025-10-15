export const flagUrl = (alpha2: string, size: 40 | 80 | 160 | 320 = 80) => `https://flagcdn.com/w${size}/${alpha2.toLowerCase()}.png`;
