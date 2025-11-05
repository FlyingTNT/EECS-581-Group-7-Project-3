/**
 * Utilities.ts
 * Inputs: None
 * Outputs: Various functions useful for the ScheduleBuilder app
 * Creation Date: 2025-10-29
 * Authors: C. Cooper
 */

import { type ClassData, type SectionData, type ScheduledTime } from "../types";
import { type ScheduleState } from "../features/scheduleSlice";
import { useAppSelector } from "../redux/hooks";

/**
 * Parses a list of ClassData from the given html string returned by the classes.ku.edu api
 * @param html A html string in the format returned by the classes.ku.edu api
 * @returns The list of ClassData parsed from the given string
 */
function parseHTMLResponse(html: string): ClassData[] {
  // Parse a HTML document from the given string
  const document = new DOMParser().parseFromString(html, "text/html");

  // If the parsing failed, return no ClassData's
  if (document == null) {
    return [];
  }

  // The classes in the html are stored in a table
  const table = document.getElementsByTagName("table")[0];

  // If there is no table, the API returned no classes
  if (table == null) {
    return [];
  }

  // Get the body of the table
  const body = table.getElementsByTagName("tbody")[0];

  // Split the table into its rows and parse the classes from the rows
  return parseClasses(getTableRows(body));
}

/**
 * Parse the list of classes displayed in the given list of HTML table rows
 * @param elements A list of HTML table rows containing data about classes
 * @returns A list of ClassData[] representing the classes displayed in the table rows
 */
function parseClasses(elements: HTMLTableRowElement[]): ClassData[] {
  const out: ClassData[] = [];

  // Iterate over every three rows of the table (3 rows correspond to 1 class)
  for (let i = 0; i + 3 < elements.length; i += 4) {
    // Parse the class in the three rows starting with row i
    const parsedClass = parseClass(elements, i);

    // If the class was able to be parsed, add it to the list of classes
    if (parsedClass != null) {
      out.push(parsedClass);
    }
  }

  return out;
}

/**
 * Parse the class displayed in the three rows of a HTML table, starting with row {index}
 * @param elements All of the rows in the table
 * @param index The row to start from (will use this row and the two subsequent rows)
 * @returns The class displayed in the three rows
 */
function parseClass(
  elements: HTMLTableRowElement[],
  index: number
): ClassData | null {
  // The first rows contains info including the class code, class name, class credit hour range, class term, and class description
  const nameRow = elements[index];

  // The class code is stored in a h3 element
  const classCode = compressSpaces(
    nameRow.getElementsByTagName("h3")[0].textContent
  );

  // The rest of the data is in a td element
  const ns = nameRow.getElementsByTagName("td")[0];

  // Get all of the text at the top level of the td element
  // This should be a string in the format: {department} - {name} ({credit range}) {term}
  const nameString: string = getText(ns).replaceAll("/", "").trim();

  // If there is no text, there is no class
  if (nameString == "") {
    return null;
  }

  // Get the index of the last opening and closing parentheses. Before the ( should be {department} - {name}, in between should be {credit range}, and after ) should be {term}
  // Note that we get the last parenetheses because the name may contain pareneteses, but the term never will
  const openPns: number = nameString.lastIndexOf("(");
  const closePns: number = nameString.lastIndexOf(")");

  // {department} - {name}
  const qualifiedClassName = nameString.substring(0, openPns).trim();

  let className = ""; // We want this to be just {name}, without {department} -

  // Split the {department} - {name} along hyphens
  const splitClassName = qualifiedClassName.split("-");

  // Keep all of the text after the first hyphen (i.e., cut off {department} and keep {name})
  if (splitClassName.length <= 1) {
    // If there was no departhement prefix, keep all of it (should never happen)
    className = qualifiedClassName;
  } // Keep all of the text after the first hyphen, retaining all of the hyphens in the {name}
  else {
    className = splitClassName[1].trim();

    for (let i = 2; i < splitClassName.length; i++) {
      className += " - " + splitClassName[i].trim();
    }
  }

  // Get {credit range} and split it along hyphens ({credit range} is in the format either: {minCredits} - {maxCredits}, or {exactCredits})
  const creditRange = nameString.substring(openPns + 1, closePns).split("-");

  // The min credits is always the first number in the split
  const minCreditHours = parseInt(creditRange[0].trim());

  // If there is no second item in the split, it is in the format {exactCredits} and the max credits is the same as the min; otherwise, it it the second item in the split
  const maxCreditHours =
    creditRange.length <= 1 ? minCreditHours : parseInt(creditRange[1].trim());

  // Get {term} (e.g. Spring 2026)
  const term = compressSpaces(
    nameString.substring(closePns + 1, nameString.length).trim()
  );

  // The second row contains only the descrpition, which is stored in a td element
  const descriptionElement = elements[index + 1].getElementsByTagName("td")[0];

  // The the text in the description
  const descriptionString: string = compressSpaces(
    getText(descriptionElement, true)
  );

  // Build a ClassData object from the data collected so far
  const parsedClass: ClassData = {
    id: classCode,
    name: className,
    description: descriptionString,
    minCredits: minCreditHours,
    maxCredits: maxCreditHours,
    sections: {},
    color: "FFFFFF",
  };

  // The list of sections is a table in a class_list object in the second row after the index
  const sectionList = elements[index + 2]
    .getElementsByClassName("class_list")[0]
    .getElementsByTagName("tbody")[0];

  // Parse the sections from the table
  const sections = parseSections(getTableRows(sectionList), parsedClass);

  // Add the sections to the parsedClass in the form of a dictionary from their section type (e.g. LEC) to a list of all the sections with that type
  for (let i = 0; i < sections.length; i++) {
    if (!(sections[i].type in parsedClass.sections)) {
      parsedClass.sections[sections[i].type] = [];
    }

    parsedClass.sections[sections[i].type].push(sections[i]);
  }

  console.log(parsedClass.lectures);
  return parsedClass;
}

/**
 * Parse the sections displayed in the given table rows, belonging to the given class
 * @param table The table displaying the sections
 * @param parentClass The class the sections belong to
 * @returns A SectionData representing the displayed sections
 */
function parseSections(
  table: HTMLTableRowElement[],
  parentClass: ClassData
): SectionData[] {
  let out = [];

  // Iterate over every three rows of the table (3 rows correspond to 1 class)
  // Skip the first row because that's a header
  for (let i = 1; i + 2 < table.length; i += 3) {
    // Parse the section starting at row i
    const parsedSection = parseSection(table, i, parentClass);

    // If there was a parsed section, add it to the out list
    if (parsedSection != null) {
      out.push(parsedSection);
    }
  }

  return out;
}

/**
 * Parse the section displayed in the three rows of a HTML table, starting with row {index}
 * @param elements All of the rows in the table
 * @param index The row to start from (will use this row and the two subsequent rows)
 * @param parentClass The class that this section belongs to
 * @returns The section displayed in the three rows
 */
function parseSection(
  elements: HTMLTableRowElement[],
  index: number,
  parentClass: ClassData
): SectionData | null {
  // Get the first two rows (the third row doesn't contain any information; it's just spacing)
  const row0: HTMLTableRowElement = elements[index];
  const row1: HTMLTableRowElement = elements[index + 1];

  // Get the td elements of the two rows
  const row0Elements = row0.getElementsByTagName("td");
  const row1Elements = row1.getElementsByTagName("td");

  // The sectiion type should be the first element in the first row
  const sectionType = getText(row0Elements[0]).trim().toUpperCase();

  // The instructor should be in a link object (a) in the second element in the first row
  const instructor = compressSpaces(
    row0Elements[1].getElementsByTagName("a")[0]?.text?.trim() ??
      "No assigned instructor"
  );

  // The topic should be the text not in a link in the second element of the first row
  const topic = compressSpaces(
    getText(row0Elements[1]).replaceAll("Topic:", "").trim()
  );

  // The credit range should be in the third element of the first row in the format either: {minCredits} - {maxCredits}, or {exactCredits})
  const creditRange = getText(row0Elements[2]).trim().split("-");

  // The min credits is always the first number in the split
  const minCreditHours = parseInt(creditRange[0].trim());

  // If there is no second item in the split, it is in the format {exactCredits} and the max credits is the same as the min; otherwise, it it the second item in the split
  const maxCreditHours =
    creditRange.length <= 1 ? minCreditHours : parseInt(creditRange[1].trim());

  // The section number should be in a strong element of the thrird item in the first row
  const sectionNumber = parseInt(
    getText(row0Elements[3].getElementsByTagName("strong")[0])
  );

  // The number of open seats should be in a span in the fifth element of the first row
  let openSeats = parseInt(
    getText(row0Elements[4].getElementsByTagName("span")[0])
  );

  // The open seats may not be a number (e.g. it could be "Full"); If this was the case, set it to zero
  if (isNaN(openSeats)) {
    openSeats = 0;
  }

  // The second row is a bunch of text containing information about the class's time and location
  // It takes the form: {daysOfWeek} {startTime} - {endTime} {location} - {campus}
  // e.g. TuTh 03:30 PM - 04:45 PM EATN 2 - LAWRENCE
  let timeAndLocationString = getText(row1Elements[1]).trim();

  let days: number[] = []; // The list of days the section occurs on

  // If it is a Sunday class, add that to the list of days and strip Su off the front of the string
  if (timeAndLocationString.startsWith("Su")) {
    days.push(0);
    timeAndLocationString = timeAndLocationString.substring(2).trimStart();
  }

  // If it is a Monday class, add that to the list of days and strip M off the front of the string
  if (timeAndLocationString.startsWith("M")) {
    days.push(1);
    timeAndLocationString = timeAndLocationString.substring(1).trimStart();
  }

  // If it is a Tuesday class, add that to the list of days and strip Tu off the front of the string
  if (timeAndLocationString.startsWith("Tu")) {
    days.push(2);
    timeAndLocationString = timeAndLocationString.substring(2).trimStart();
  }

  // If it is a Wednesday class, add that to the list of days and strip W off the front of the string
  if (timeAndLocationString.startsWith("W")) {
    days.push(3);
    timeAndLocationString = timeAndLocationString.substring(1).trimStart();
  }

  // If it is a Thursday class, add that to the list of days and strip Th off the front of the string
  if (timeAndLocationString.startsWith("Th")) {
    days.push(4);
    timeAndLocationString = timeAndLocationString.substring(2).trimStart();
  }

  // If it is a Friday class, add that to the list of days and strip F off the front of the string
  if (timeAndLocationString.startsWith("F")) {
    days.push(5);
    timeAndLocationString = timeAndLocationString.substring(1).trimStart();
  }

  // If it is a Saturday class, add that to the list of days and strip Sa off the front of the string
  if (timeAndLocationString.startsWith("Sa")) {
    days.push(6);
    timeAndLocationString = timeAndLocationString.substring(2).trimStart();
  }

  // If it is a Sunday class, add that to the list of days and strip Su off the front of the string
  // We check this at the front and end because we found no examples of Sunday classes so it is unknown if it would be first or last
  if (timeAndLocationString.startsWith("Su")) {
    days.push(0);
    timeAndLocationString = timeAndLocationString.substring(2).trimStart();
  }

  // The string will contain the word "onlin" if it is online
  const online = timeAndLocationString.toLowerCase().includes("onlin"); // "onlin" is intended

  // At this point, the string should be in the form {startTime} - {endTime} {location} - {campus}
  // Split the string along the hyphens
  const split = timeAndLocationString.split("-");

  // Parse the start and end times from the fronts of the first and second sections of the split
  const start = parseTime(split[0]);
  const end = parseTime(split[1]);

  // The location should be in a span in the second item of the second row
  const spans = row1Elements[1].getElementsByTagName("span");

  // If there is no span, there is no location; else, get the text from the span
  const location =
    spans.length == 0
      ? "No location"
      : compressSpaces(getText(spans[0]).trim());

  let times: ScheduledTime[] = [];

  // For each day the class occurs on, add a ScheduledTime with that day and the parsed start and end time
  for (let i = 0; i < days.length; i++) {
    let time: ScheduledTime = {
      day: days[i],
      startTime: start,
      endTime: end,
    };

    times.push(time);
  }

  // Return a section with the parsed data
  return {
    classId: parentClass.id,
    sectionNumber: sectionNumber,
    instructor: instructor,
    minCredits: minCreditHours,
    maxCredits: maxCreditHours,
    topic: topic,
    type: sectionType,
    location: location,
    openSeats: openSeats,
    times: times,
    pinned: false,
  };
}

/**
 * Parse a time from the given string.
 * The string should be in the form: hh:mm {am/pm}
 * Will return an integer of the number of 5-minute intervals after 12:00 am (e.g. 0 for 12:00 am, 3 for 12:15 am, 144 for 12:00 pm,...)
 * @param timeString A string in the form: hh:mm {am/pm}
 * @returns An integer of the number of 5-minute intervals after 12:00 am, or -1 if the given string is in a bad format
 */
function parseTime(timeString: string): number {
  // Trim any whitespace and normalize the string to lowercase
  timeString = timeString.trim().toLowerCase();

  // Check whether the string ends in am or pm
  const am = timeString.endsWith("am");

  // Strip the am/pm off the back of the string
  timeString = timeString.substring(0, timeString.length - 2);

  // Split the string along the colon
  const split = timeString.split(":");

  // If there are not two sections, return -1
  if (split.length < 2) {
    return -1;
  }

  // Get the hour of the string in 24-hour time, with 12am -> 0am
  const hour = ((parseInt(split[0].trim()) + 1) % 12) + (am ? 0 : 12);
  // Get the minutes of the string
  const minute = parseInt(split[1].trim());

  // Return the 5-minute format
  return hour * 12 + Math.floor(minute / 5);
}

/**
 * Gets a string representation of the given time.
 * The given time should be an integer of a number of 5-minute intervals after 12:00 am. e.g. 3 would unparse to 12:15 AM
 * @param time The number of 5-minute intervals after 12:00 am
 * @returns A string represencation of the time, in the form hh:mm {AM/PM}
 */
function unparseTime(time: number): string {
  // If we are less than 144 5-minutes after 12:00am, it is still am
  const am = time < 144;

  // If it is not an am time, subtract 12 hrs to bring it to am
  if (!am) {
    time -= 144;
  }

  // Get the hour
  let hour = (Math.floor(time / 12) + 11) % 12;

  // Convert hour 0 to hour 12
  if (hour == 0) {
    hour = 12;
  }

  // Get the minutes
  const minutes = (time % 12) * 5;

  // Return the time string
  return (
    hour.toString() +
    ":" +
    (minutes == 0 ? "00" : minutes == 5 ? "05" : minutes.toString()) +
    (am ? " AM" : " PM")
  );
}

/**
 * Get the rows of the given HTML table element, ignoring any rows in any nested tables
 * @param table
 * @returns
 */
function getTableRows(table: HTMLTableSectionElement): HTMLTableRowElement[] {
  let topRows: HTMLTableRowElement[] = [];

  // For each child of the table
  for (let i = 0; i < table.children.length; i++) {
    // If the child is a table row, add it to the list
    if (table.children[i].tagName.toLowerCase() == "tr") {
      topRows.push(table.children[i] as HTMLTableRowElement);
    }
  }

  return topRows;
}

/**
 * Get all of the text elements in the children given HTML element.
 * Only gets the direct children; does not get any nested children.
 * @param element The element to get the text children of.
 * @param onlyFirst If set, will stop after the first text child.
 * @returns A concatenation of all of the text in the direct children of the given element.
 */
function getText(element: HTMLElement, onlyFirst: boolean = false): string {
  let text: string = "";

  // For each child,
  for (let i = 0; i < element.childNodes.length; i++) {
    // Get the child node
    const child = element.childNodes[i];

    // If it isn't a text node, skip it
    if (child.nodeType != Node.TEXT_NODE) {
      continue;
    }

    // If it has non-null text, trim the text and add it to the concatenation
    if (child.textContent != null) {
      text += child.textContent.trim();
    }

    // If we are only keeping the first item and we have found a non-whitespace item, stop looking
    if (onlyFirst && text.length > 0) {
      break;
    }
  }

  return text;
}

/**
 * Replaces any double-spaces or other whitespace characters in the given string with single spaces.
 * @param text The text to remove double-spaces from.
 * @returns The input text with double-spaces and other whitespace characters replaced with single spaces.
 */
function compressSpaces(text: string): string {
  return text.replaceAll(/\s+/g, " ");
}

/**
 * Gets the current global state of the scheduler.
 * @returns The current global state of the scheduler.
 */
function getState(): ScheduleState {
  return useAppSelector((state) => state.schedule);
}

/**
 * Get the selected class associated with with the given section or id.
 * @param idOrSection The section or class id to get the class associated with
 * @param state The current global state. If in a component, this is unnecessary, but it needs to be provided if calling from one of the slice functions.
 * @returns The selected class associated with the given class id, or null if no such class exists.
 */
function getClass(
  idOrSection: string | SectionData,
  state: ScheduleState | null = null
): ClassData | null {
  // Get the id from the section if passed a SectionData, or else just use the given string
  const id =
    typeof idOrSection === "string" ? idOrSection : idOrSection.classId;

  // If the given state was null, get the current state
  state ??= getState();

  // Return the first class with a matching id, or null if none was found
  return state.selectedClasses.find((c) => c.id === id) ?? null;
}

export { getClass, getState, parseHTMLResponse, parseTime, unparseTime };
