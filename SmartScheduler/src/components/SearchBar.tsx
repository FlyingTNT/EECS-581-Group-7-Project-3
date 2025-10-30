/// SearchBar.tsx
/// React component that will allow the user to search for courses to add to their schedule.
/// Inputs: Not from the props, but will take input from the user via a text field.
/// Outputs: JSX.Element representing the search bar with autocomplete functionality.
/// Authors: Micheal Buckendahl
/// Creation Date: 10/24/2025

import { Autocomplete, Snackbar, TextField } from "@mui/material";
import { useState } from "react";
import { addCourse } from "../features/scheduleSlice";
import { useDispatch } from "react-redux";
import type { ClassData } from "../types";
import "../styles/SearchBarStyles.css";
import { useAppSelector } from "../redux/hooks";
import { fetchCourses } from "../utils/getCourses";
import {parseHTMLResponse, deepCopyClass} from "../utils/Utilities";

export default function SearchBar() {
  const dispatch = useDispatch(); // Redux dispatch function

  // Grab the selected courses from the Redux store
  const selectedCourses = useAppSelector((state) => state.schedule.selectedClasses);

  // Local state variables to control different aspects of the search bar like
  // dropdown visibility, course options, loading state, input value, snackbar state,
  // and the snackbar message.
  const [isDropDownOpen, setIsDropdownOpen] = useState(false);
  const [courses, setCourses] = useState<ClassData[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSnackBarOpen, setIsSnackBarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Check if the course we are looking to add is already in the selected courses list
  const isAlreadySelected = (value: string) => {
    return selectedCourses.some((course) => course.id === value);
  };

  // Use the fetchCourses utility to get the courses from the backend
  async function handleSearch(text: string) : Promise<ClassData[]>
  {
    try {
      const html = await fetchCourses(text);

      return parseHTMLResponse(html);

      //console.log("Server returned HTML:", html);
      // TODO: parse the HTML to extract course data
    } catch (err) {
      console.error(err);
    }

    return [];
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

      // Extract the search keyword from the text field
      const target = event.target as HTMLInputElement;
      const searchKeyWord = target.value.trim(); // Trim whitespace

      // If the search keyword is empty, do not perform the search and reset the loading state.
      if (!searchKeyWord) {
        setIsLoading(false);
        return;
      }

      // Call the backend to search for courses
      const returnedClasses = await handleSearch(searchKeyWord);

      // If no courses were found, we want to notify the user of that via a snackbar message
      if (returnedClasses.length === 0) {
        setSnackbarMessage("No courses found matching that search.");
        setIsSnackBarOpen(true);
        // Otherwise set the courses found to be the courses state variable
      }
      else
      {
        setCourses(returnedClasses);
      }

      // Now that we have found and displayed the results, set loading back to false
      setIsLoading(false);
    }
  };

  return (
    <>
      <Autocomplete
        className="searchbar"
        freeSolo // allow free text input
        value={null} // keep value controlled by inputValue and state for safety
        getOptionLabel={course => (course as ClassData).id} // Only show the course ids
        options={courses} // options are the courses found from the search
        open={isDropDownOpen} // we need to control when the dropdown is shown so we show results when we have them
        loading={isLoading} // Because we have a backend call we need to handle the situation when the call might take some time
        onOpen={() => setIsDropdownOpen(true)}
        onClose={() => setIsDropdownOpen(false)}
        inputValue={inputValue} // we have to control the input value ourselves to get the correct behavior
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
          // This is the case that the value of the input field changed due to them selecting an option
          // from the dropdown
          if (reason === "selectOption") {
            if (value === null) return;
            else if (isAlreadySelected((value as ClassData).id)) {
              // The selected course is already in the list
              console.log(selectedCourses);
              setSnackbarMessage("Course already selected.");
              setIsSnackBarOpen(true);
            } else {
              // Need to deep copy the class to avoid a call stack overflow
              const copy = deepCopyClass(value as ClassData);

              // Add the selected course to the selected courses list
              dispatch(
                  addCourse(copy)
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
      {/* There are a two cases that we will need to display some information to the user
          First if there search came back empty and if they try to add an already selected course
       */}
      <Snackbar
        className="snackbar"
        open={isSnackBarOpen}
        message={snackbarMessage}
        autoHideDuration={3000} // Auto hide after 3 seconds
        onClose={() => setIsSnackBarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Position at the top center of the screen
        // Custom styling for the snackbar component
        ContentProps={{
          className: "snackbar",
        }}
      />
    </>
  );
}
