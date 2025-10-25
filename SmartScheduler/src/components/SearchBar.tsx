import { Autocomplete, Snackbar, TextField } from "@mui/material";
import { useState } from "react";
import { addSection } from "../features/scheduleSlice";
import { useDispatch } from "react-redux";
import type { Course } from "../types";
import "../styles/SearchBarStyles.css";
import { useAppSelector } from "../redux/hooks";
import { fetchCourses } from "../utils/getCourses";

export default function SearchBar() {
  const dispatch = useDispatch();
  const fakeCourses = [
    "Introduction to Computer Science",
    "Data Structures and Algorithms",
    "Operating Systems",
    "Database Management systems",
    "EECS 581",
    "EECS 582",
    "EECS 443",
    "EECS 447",
  ];

  const selectedCourses = useAppSelector((state) => state.schedule.sections);
  const [isDropDownOpen, setIsDropdownOpen] = useState(false);
  const [courses, setCourses] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSnackBarOpen, setIsSnackBarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Check if the course we are looking to add is already in the selected courses list
  const isAlreadySelected = (value: string) => {
    return selectedCourses.some((course) => course.id === value);
  };

  async function handleSearch(text: string) {
    try {
      const html = await fetchCourses(text);
      console.log("Server returned HTML:", html);
      // TODO: parse the HTML to extract course data
    } catch (err) {
      console.error(err);
    }
  }

  const handleKeyDown = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      // Set the state of loading to true while we search for there courses
      setIsLoading(true);
      setIsDropdownOpen(true);

      // prevent a submission of the form because we dont want to add the raw input as the course
      // rather the option they select
      event.stopPropagation();
      event.preventDefault();

      const target = event.target as HTMLInputElement;
      const searchKeyWord = target.value.trim();
      if (!searchKeyWord) {
        setIsLoading(false);
        return;
      }

      await handleSearch(searchKeyWord);

      const coursesFound = fakeCourses.filter((course) =>
        course.toLowerCase().includes(searchKeyWord.toLowerCase())
      );

      if (coursesFound.length === 0) {
        setSnackbarMessage("No courses found matching that search.");
        setIsSnackBarOpen(true);
      } else {
        setCourses(coursesFound);
      }

      // Now that we have found and displayed the results, set loading back to false
      setIsLoading(false);
    }
  };

  return (
    <>
      <Autocomplete
        className="searchbar"
        freeSolo
        value={null} // keep value controlled by inputValue and state for safety
        options={courses}
        open={isDropDownOpen}
        loading={isLoading}
        onOpen={() => setIsDropdownOpen(true)}
        onClose={() => setIsDropdownOpen(false)}
        inputValue={inputValue}
        onInputChange={(_event, value, reason) => {
          setInputValue(value);
          // This is just if the input changed, like if they were typing we want to remove
          // old results and close the dropdown but we don't want to clear the input value
          if (reason === "input") {
            setCourses([]);
            setIsDropdownOpen(false);

            // This is the case they press the x button on the left to clear the input
          } else if (reason === "clear") {
            setInputValue("");
            setCourses([]);
            setIsDropdownOpen(false);
          }
        }}
        onChange={(_event, value, reason) => {
          if (reason === "selectOption") {
            if (value === null) return;
            else if (isAlreadySelected(value)) {
              // The selected course is already in the list
              console.log(selectedCourses);
              setSnackbarMessage("Course already selected.");
              setIsSnackBarOpen(true);
            } else {
              // Add the selected course to the selected courses list
              dispatch(
                addSection({ id: String(value), name: String(value) } as Course)
              );
            }
            setInputValue(""); // Clear the text field after a selection
            setIsDropdownOpen(false); // Close dropdown
            setCourses([]); // Clear the results of the search
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search for a class"
            onKeyDown={handleKeyDown}
          />
        )}
      />
      <Snackbar
        className="snackbar"
        open={isSnackBarOpen}
        message={snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setIsSnackBarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        ContentProps={{
          className: "snackbar",
        }}
      />
    </>
  );
}
