/// getCourses.ts
/// Utility function to fetch course data from the backend server.
/// Inputs: q - search query string.
/// Outputs: HTML string containing course data.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025

import axios from "axios";

export async function fetchCourses(q: string) {
  const { data } = await axios.get("/api/courses", { params: { q } });
  return data; // HTML string from backend
}
