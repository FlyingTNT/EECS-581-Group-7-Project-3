import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ClassData, SectionData } from "../types";

type ScheduleState = {
  selectedClasses: ClassData[],
  permutations: SectionData[][],
  currentPermutation: number,
  blockedTimes: boolean[][]
};

const initialState: ScheduleState = {
  selectedClasses: [],
  permutations: [],
  currentPermutation: -1,
  blockedTimes: []
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
      state.selectedClasses = state.selectedClasses.filter((s) => s.id !== action.payload);
    },
    clearSchedule(state) {
      state.selectedClasses = [];
    },
  },
});

export const { addCourse, removeCourse, clearSchedule } =
  scheduleSlice.actions;
export default scheduleSlice.reducer;
