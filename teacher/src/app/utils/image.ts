// Utility to get a valid image src from a base64 string or data URL
export function getScreenshotSrc(screenshot?: string) {
  if (!screenshot) return '';
  if (screenshot.startsWith('data:image')) return screenshot;
  return `data:image/png;base64,${screenshot}`;
}
