import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3001;

const BASE_URL = "https://classes.ku.edu/Classes/CourseSearch.action";

function getTermCode(year, season) {
  const base = 4000;
  const yearOffset = (year - 2000) * 10;
  const seasonOffset = season === "spring" ? 2 : season === "summer" ? 6 : 9;
  return base + yearOffset + seasonOffset;
}

function getSearchMessage(text, term = getTermCode(2026, "spring")) {
  return {
    classesSearchText: text,
    searchCareer: "UndergraduateGraduate",
    searchTerm: String(term),
    searchSchool: "",
    searchDept: "",
    searchSubject: "",
    searchCode: "",
    textbookOptions: "",
    searchAreaOfInterest: "",
    searchCampus: "",
    searchBuilding: "",
    searchCourseNumberMin: "001",
    searchCourseNumberMax: "999",
    searchCreditHours: "",
    searchInstructor: "",
    searchStartTime: "",
    searchEndTime: "",
    searchClosed: "false",
    searchHonorsClasses: "false",
    searchShortClasses: "false",
    searchOnlineClasses: "",
    searchIncludeExcludeDays: "include",
    searchDays: "",
  };
}

app.use(cors()); // allow Vite dev origin

app.get("/api/courses", async (req, res) => {
  try {
    const q = String(req.query.q ?? "");
    const form = new URLSearchParams(getSearchMessage(q));
    const r = await axios.post(BASE_URL, form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    res.status(200).send(r.data); // KU returns HTML
  } catch (err) {
    console.error("Upstream error:", err?.message);
    res.status(502).json({ error: "Failed to fetch KU courses" });
  }
});

app.listen(PORT, () =>
  console.log(`API listening on http://localhost:${PORT}`)
);
