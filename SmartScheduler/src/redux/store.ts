import { configureStore } from "@reduxjs/toolkit";
import scheduleReducer from "../features/scheduleSlice";

export const store = configureStore({
  reducer: {
    schedule: scheduleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
