/**
 * An interface representing a college class
 */
export interface ClassData
{
  /** The id of the course (e.g. EECS 581) */
  id: string, 
  /** The name of the course (e.g. Software Engineering I) */
  name: string,
  /** A description of the class and its prerequisites */
  description: string,
  /** The minumim number of credit hours of the course */
  minCredits: number,
  /** The maximum number of credit hours of the course */
  maxCredits: number,
  /** A (section type (e.g. LEC) -> list of sections of that type) map of the specific sections of the course */
  sections: Record<string, SectionData[]>
  /** The color assigned to the course */
  color: string
}

/**
 * An interface representing a section of a college class
 */
export interface SectionData
{
  /** The id of the class associated with this section (e.g. EECS 581) */
  classId: string,
  /** The section number for this section */
  sectionNumber: number
  /** The instructor for this section */
  instructor: string,
  /** The minumim number of credit hours of the section */
  minCredits: number,
  /** The maximum number of credit hours of the section */
  maxCredits: number,
  /** The section topic (usually empty) */
  topic: string,
  /** The section type (e.g. LBN for labs, LEC for lectures,...) */
  type: string,
  /** The course location. May be "KULC APPT" for unscheduled courses or "ONLNE CRSE" for online courses*/
  location: string,
  /** The number of currently open seats for the section */
  openSeats: number,
  /** The times that the section is scheduled to meet */
  times: ScheduledTime[]
  /** Whether the section is pinned */
  pinned: boolean
} 

/**
 * An interface representing a time for a college class to meet
 */
export interface ScheduledTime
{
  /** The meeting day 0 (Sunday) - 6 (Saturday) */
  day: number,
  /** The start time of the meeting, in 5-minute increments from 12:00am (e.g. 12:00am = 0, 12:15am = 3, 12:00pm = 144,...) */
  startTime: number,
  /** The end time of the meeting, in 5-minute increments from 12:00am (e.g. 12:00am = 0, 12:15am = 3, 12:00pm = 144,...) */
  endTime: number
}