// Generate a blur placeholder for images
// Using a simple solid color that matches the team colors for better UX
export function getBlurPlaceholder(teamColor: string): string {
  // Return a simple data URL for a blur placeholder
  // Format: data:image/svg+xml;base64,...
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="${teamColor}" width="200" height="200"/></svg>`
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

// Map team names to colors for blur placeholders
export const teamBlurColors: Record<string, string> = {
  "天月麻雀": "#5d3a1a",
  "狂戰士": "#7f1c1c",
  "壞拍子": "#854d0e",
  "Bad Beat": "#854d0e",
  "牌道": "#1e3a8a",
  "易和團": "#166534",
  "愚形上等": "#c2410c",
  "錦鯉咪好勁": "#831843",
  "御無礼": "#4c1d95",
}
