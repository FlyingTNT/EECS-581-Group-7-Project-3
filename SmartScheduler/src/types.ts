export interface ClassData
{
  id: string,
  name: string,
  description: string,
  minCredits: number,
  maxCredits: number,
  lectures: SectionData[],
  labs: SectionData[],
  discussions: SectionData[],
  pinnedLecture: number,
  pinnedLab: number,
  pinnedDiscussion: number,
  color: string
}

export interface SectionData
{
  classId: string,
  sectionNumber: number
  instructor: string,
  minCredits: number,
  maxCredits: number,
  topic: string,
  type: string,
  location: string,
  openSeats: number,
  times: ScheduledTime[]
} 

export interface ScheduledTime
{
  day: number,
  startTime: number,
  endTime: number
}