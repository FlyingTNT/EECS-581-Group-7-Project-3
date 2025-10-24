import {type ScheduleState} from "../features/scheduleSlice.ts"
import {type Course} from "../types.ts"
import { store } from "../redux/store.ts";

function getState(): ScheduleState
{
    return store.getState().schedule;
}

export function get101s(): Course[]
{
    return getState().sections.filter(course => course.id == "CS101");
}