/**
 * scheduleSlice.ts
 * Inputs: None
 * Outputs: Various functions for modifying the global state for the ScheduleBuilder app
 * Creation Date: 2025-10-23
 * Authors: Micheal Buckendahl, C. Cooper, Delaney Gray, Cole Charpentier
 */

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ClassData, SectionData } from "../types";
import { getClass, getCurrentPermutation, getPinnedSections } from "../utils/Utilities";
import { filterSchedules, generateSchedules } from "../utils/scheduleAlgorithm";

type ScheduleState = {
  /** The classes that the user has selected thru the search bar */
  selectedClasses: ClassData[];
  /** All possible permutations of the sections of {@link ScheduleState.selectedClasses} */
  permutations: SectionData[][];
  /** The index of the permutation in {@link ScheduleState.permutations} that the user has selected, or -1 if there is no valid permutation. */
  currentPermutation: number;

  /** The times that the user has blocked classes from occuring at.
   * The first index is the day of the week and the second is the time of the day, in 30-minute increments from 12:00am.
   * i.e. blockedTimes[2][3] would refer to Tuesday (2) at 1:30am (3)
   */
  blockedTimes: boolean[][];
};

const initialState: ScheduleState = {
  selectedClasses: [],
  permutations: [],
  currentPermutation: -1,
  blockedTimes: Array.from([0, 1, 2, 3, 4, 5, 6], (_) =>
    Array(2 * 24).fill(false)
  ),
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    addCourse(state, action: PayloadAction<ClassData>) {
      state.selectedClasses.push(action.payload);
      console.log("Added class:", action.payload);
    },
    removeCourse(state, action: PayloadAction<string>) {
      state.selectedClasses = state.selectedClasses.filter(
        (s) => s.id !== action.payload
      );
    },
    clearSchedule(state) {
      state.selectedClasses = [];
    },
    /**
     * Regenerate the permutations based on the currently selected courses
     * @param state The current state
     * @param action True payload if the permutations need to be fully regenerated, or false if they can just be re-filtered (e.g. only need to be filtered if a time was blocked)
     */
    regenerateSchedules(state, action: PayloadAction<boolean>)
    {
      const fullRegenerate = action.payload;

      console.log("Re-generating schedules from selectedCourses:", state.selectedClasses);

      // The unfiltered schedules - just the current schedules if we don't need to fully regenerate
      let schedules = fullRegenerate ? generateSchedules(state.selectedClasses) : state.permutations;

      // Filter the schedules
      schedules = filterSchedules(schedules, getPinnedSections(state.selectedClasses), state.blockedTimes);

      // Push the filtered schedules
      scheduleSlice.caseReducers.reportSchedules(state, {type: "SectionData[][]", payload: schedules});
    },
    /**
     * Push a new set of schedule permutations that have been generated
     * @param state The current state
     * @param action The new permutations
     */
    reportSchedules(state, action: PayloadAction<SectionData[][]>) {
      state.permutations = action.payload;
      if (state.permutations.length === 0) {
        state.currentPermutation = -1;
      } else {
        if (
          state.currentPermutation < 0 ||
          state.currentPermutation >= state.permutations.length
        ) {
          state.currentPermutation = 0;
        }
      }
    },
    togglePin(state, action: PayloadAction<number>){
      const permutation = getCurrentPermutation(state);
      const selection = permutation?.find(s => s.sectionNumber === action.payload);
      if(!selection)
      {
        return;
      }

      const course = getClass(selection, state);

      // Update the pin in the class object
      outer: for(const sectionType in course?.sections)
      {
        for(const section of course.sections[sectionType])
        {
          if(section.sectionNumber === action.payload)
          {
            section.pinned = !section.pinned;
            break outer;
          }
        }
      }

      // Update the pin in the permutation object
      selection.pinned = !selection.pinned;

      // Regenerate the schedules, doing a full regeneration if the section was unpinned
      scheduleSlice.caseReducers.regenerateSchedules(state, {type: "boolean", payload: !selection.pinned})
    },
    incrementCurrentPermutation(state) {
      if (state.currentPermutation < state.permutations.length - 1) {
        state.currentPermutation += 1;
      }
    },
    decrementCurrentPermutation(state) {
      if (state.currentPermutation > 0) state.currentPermutation -= 1;
    },
    toggleBlockedTime(state, action: PayloadAction<{ day: number; timeSlot: number }>) {
      const { day, timeSlot } = action.payload;
      state.blockedTimes[day][timeSlot] = !state.blockedTimes[day][timeSlot];
    },
  },
});

export const {
  addCourse,
  removeCourse,
  clearSchedule,
  reportSchedules,
  togglePin,
  incrementCurrentPermutation,
  decrementCurrentPermutation,
  toggleBlockedTime,
  regenerateSchedules
} = scheduleSlice.actions;
export { type ScheduleState };
export default scheduleSlice.reducer;
