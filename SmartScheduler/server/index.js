/// index.js
/// Express server to proxy requests to KU course search.
/// Inputs: GET requests with query parameter 'q' for course search text.
/// Outputs: HTML response from KU course search.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025

import express from "express";
import cors from "cors";
import axios from "axios";

// Express app setup and configuration of the port it will be listening on
const app = express();
const PORT = process.env.PORT || 3001;

// KU course search base URL
const BASE_URL = "https://classes.ku.edu/Classes/CourseSearch.action";

// Helper function to compute the term code based on year and season
function getTermCode(year, season) {
  const base = 4000;
  const yearOffset = (year - 2000) * 10;
  const seasonOffset = season === "spring" ? 2 : season === "summer" ? 6 : 9;
  return base + yearOffset + seasonOffset;
}

// Helper function to construct the search message payload that the KU course search expects
// Note that right now we only give the user the ability to search by text and not term. But the
// function is built to allow term specification in the future.
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

// Define the /api/courses endpoint to handle course search requests
app.get("/api/courses", async (req, res) => {
  try {
    // Extract the search query parameter 'q' from the request
    const q = String(req.query.q ?? "");

    // Prepare the form data and make a POST request to the KU course search URL
    const form = new URLSearchParams(getSearchMessage(q));

    // Make a POST request to the KU course search URL
    const r = await axios.post(BASE_URL, form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    res.status(200).send(r.data); // KU returns HTML

    // Handle errors from the upstream KU server. Log them out and return a 502 Bad Gateway.
  } catch (err) {
    console.error("Upstream error:", err?.message);
    res.status(502).json({ error: "Failed to fetch KU courses" });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () =>
  console.log(`API listening on http://localhost:${PORT}`)
);
