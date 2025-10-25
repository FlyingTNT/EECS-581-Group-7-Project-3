import axios from "axios";

export async function fetchCourses(q: string) {
  const { data } = await axios.get("/api/courses", { params: { q } });
  return data; // HTML string from backend
}
