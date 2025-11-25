/**
 * SessionSelector
 * Inputs: None
 * Outputs: A dropdown for selecting the term to make a schedule for
 * Creation Date: 2025-10-29
 * Authors: C. Cooper
 */

import { setCurrentTerm } from "../features/scheduleSlice";
import { useAppDispatch } from "../redux/hooks";
import { getNextTerm, getState, getTermAfter, getTermCode } from "../utils/Utilities";
import "../styles/TermSelectorStyles.css"

/**
 * Gets the terms that we should display in the dropdown
 * We use the next term plus the the three before it
 * @returns The next term and the three before it
 */
function getDisplayTerms(): { year: number, season: string }[]
{
    // Get the next term currently
    const nextSession = getNextTerm();

    const out: { year: number, season: string }[] = [];

    // Add the term 1 year ago (3 terms ago)
    out.push({year: nextSession.year - 1, season: nextSession.season});

    // Add the term after that (2 terms ago)
    out.push(getTermAfter(out[out.length - 1]));

    // Add the term after that (1 term ago/current term)
    out.push(getTermAfter(out[out.length - 1]));

    // Add the next term
    out.push(nextSession);

    // Reverse it to be newest to oldest
    return out.reverse();
}


// Displays the total amount of credit hours based on the currently selected courses.
export default function TermSelector() {
    const state = getState();
    const dispatch = useAppDispatch();

    const options = getDisplayTerms();

    return <div className="termSelector">
        <select defaultValue={state.selectedTerm} 
            onChange={event => dispatch(setCurrentTerm(Number(event.target.value)))}
            >
            {
                options.map(option => 
                    (<option value = {getTermCode(option.year, option.season)}>
                        {option.season} {option.year}
                    </option>))
            }
        </select>
    </div>;
}