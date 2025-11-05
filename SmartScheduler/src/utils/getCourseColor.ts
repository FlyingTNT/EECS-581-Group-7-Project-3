import type { ClassData } from "../types";

export default function getCourseColor(allSelectedCourse: ClassData[]) {
  const colors = [
    "#FF3B30", //Red
    "#FF9500", // Orange
    "#FFCC00", // Yellow
    "#34C759", // Green
    "#30B0FF", // Blue
    "#5856D6", // Indigo
    "#AF52DE", // Purple
    "#FF2D55", // Pink
    "#00C7BE", // Teal
    "#007AFF", // Bright Blue
    "#5AC8FA", // Sky Blue
    "#4CD964", // Lime Green
    "#FFD60A", // Golden Yellow
    "#FF9F0A", // Vivid Orange
    "#FF375F", // Hot Pink
    "#BF5AF2", // Vivid Purple
    "#64D2FF", // Aqua
    "#32ADE6", // Ocean Blue
    "#E02020", // Crimson Red
    "#34E5EB", // Cyan
    "#1ABC9C", // Turquoise
    "#2ECC71", // Emerald
    "#3498DB", // Bright Blue
    "#9B59B6", // Violet
    "#E67E22", // Pumpkin Orange
    "#E74C3C", // Tomato Red
    "#F1C40F", // Bright Yellow
    "#16A085", // Aqua Green
    "#2980B9", // Medium Blue
    "#8E44AD",
  ];

  const allUsedColors = allSelectedCourse.map((c) => c.color);
  const availableColors = colors.filter((c) => !allUsedColors.includes(c));
  return availableColors[Math.floor(Math.random() * availableColors.length)];
}
