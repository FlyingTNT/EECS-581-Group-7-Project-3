import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Course } from "../types";

type ScheduleState = {
  sections: Course[];
};

const initialState: ScheduleState = {
  sections: [],
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    addSection(state, action: PayloadAction<Course>) {
      state.sections.push(action.payload);
    },
    removeSection(state, action: PayloadAction<string>) {
      state.sections = state.sections.filter((s) => s.id !== action.payload);
    },
    clearSchedule(state) {
      state.sections = [];
    }
  },
});

export type {ScheduleState};
export const { addSection, removeSection, clearSchedule } =
  scheduleSlice.actions;
export default scheduleSlice.reducer;
