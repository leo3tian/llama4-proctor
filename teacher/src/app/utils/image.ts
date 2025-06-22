// Utility to get a valid image src from a base64 string or data URL
export const getScreenshotSrc = (screenshot: string | null | undefined): string => {
  // If the screenshot is a valid base64 string, create a data URL.
  if (screenshot && screenshot.length > 100) { // Basic check for a non-empty, non-path string
    return `data:image/png;base64,${screenshot}`;
  }
  
  // Otherwise, return the path to the fallback image.
  return '/greekhistory1.png';
};
