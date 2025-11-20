import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type ScheduleAlgorithmState = {
  allSchedules: any[];         // all valid schedules
  generatedSchedules: any[];   // filtered schedules
  pinnedSections: number[];    // sectionNumbers the user pinned
};

const initialState: ScheduleAlgorithmState = {
  allSchedules: [],
  generatedSchedules: [],
  pinnedSections: [],
};

export const scheduleAlgorithmSlice = createSlice({
  name: "scheduleAlgorithm",
  initialState,
  reducers: {
    setAllSchedules(state, action: PayloadAction<any[]>) {
      state.allSchedules = action.payload;
    },
    setGeneratedSchedules(state, action: PayloadAction<any[]>) {
      state.generatedSchedules = action.payload;
    },
    setPinnedSections(state, action: PayloadAction<number[]>) {
      state.pinnedSections = action.payload;
    },

    clearAll(state) {
      state.allSchedules = [];
      state.generatedSchedules = [];
      state.pinnedSections = [];
    },
  },
});

export const {
  setAllSchedules,
  setGeneratedSchedules,
  setPinnedSections,
  clearAll
} = scheduleAlgorithmSlice.actions;

export default scheduleAlgorithmSlice.reducer;
