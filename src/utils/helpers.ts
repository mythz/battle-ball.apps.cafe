// Helper utility functions

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const randomRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomRange(min, max + 1));
};

export const degToRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const radToDeg = (radians: number): number => {
  return (radians * 180) / Math.PI;
};
