import {type ClassData, type SectionData, type ScheduledTime} from "../types";

export function parseHTMLResponse(html: string): ClassData[]
{
    const parser = new DOMParser();

    const document = parser.parseFromString(html, "text/html");

    if(document == null)
    {
        return [];
    }

    const table = document.getElementsByTagName("table")[0];

    if(table == null)
    {
        return [];
    }

    const body = table.getElementsByTagName("tbody")[0];

    return parseClasses(getTableRows(body));
}

function parseClasses(elements: Array<HTMLTableRowElement>): ClassData[]
{
    let out: ClassData[] = [];

    for(let i = 0; i + 3 < elements.length; i += 4)
    {
        let parsedClass = parseClass(elements, i);

        if(parsedClass != null)
        {
            out.push(parsedClass);
        }
    }

    return out;
}

function parseClass(elements: Array<HTMLTableRowElement>, index: number): ClassData | null
{
    const nameRow = elements[index];

    const classCode = nameRow.getElementsByTagName("h3")[0].textContent.replace(/\s+/, " ");

    const ns = nameRow.getElementsByTagName("td")[0];

    const nameString: string = getText(ns).replaceAll("/", "").trim();

    ////console.log("Ns:", nameString);

    if(nameString == "")
    {
        return null;
    }

    const openPns: number = nameString.lastIndexOf("(");
    const closePns: number = nameString.lastIndexOf(")");

    const qualifiedClassName = nameString.substring(0, openPns).trim();

    let className = "";

    const splitClassName = qualifiedClassName.split("-");

    if(splitClassName.length <= 1)
    {
        className = qualifiedClassName;
    }
    else
    {
        className = splitClassName[1].trim();

        for(let i = 2; i < splitClassName.length; i++)
        {
            className += " - " + splitClassName[i].trim();
        }
    }

    const creditRange = nameString.substring(openPns + 1, closePns).split("-");

    const minCreditHours = parseInt(creditRange[0].trim());
    const maxCreditHours = parseInt(creditRange.length > 1 ? creditRange[1].trim() : creditRange[0].trim());

    const term = nameString.substring(closePns + 1, nameString.length).trim();

    //console.log("Code:", classCode);
    //console.log("Name:", className);
    //console.log("Hours:", creditHours);
    //console.log("Term:", term);
    
    const descriptionElement = elements[index + 1].getElementsByTagName("td")[0];

    const descriptionString: string = getText(descriptionElement, true);

    //console.log("Description:", descriptionString);

    let parsedClass: ClassData = {
        id: classCode,
        name: className,
        description: descriptionString,
        minCredits: minCreditHours,
        maxCredits: maxCreditHours,
        lectures: [],
        labs: [],
        discussions: [],
        pinnedLab: -1,
        pinnedLecture: -1,
        pinnedDiscussion: -1,
        color: "FFFFFF"
    }

    const sectionList = elements[index + 2].getElementsByClassName("class_list")[0].getElementsByTagName("tbody")[0];

    const sections = parseSections(getTableRows(sectionList), parsedClass);

    for(let i = 0; i < sections.length; i++)
    {
        const section: SectionData = sections[i];

        if(section.type == "LBN")
        {
            parsedClass.labs.push(section);
        }
        else if(section.type == "LEC")
        {
            parsedClass.lectures.push(section);
        }
        else if(section.type == "DIS")
        {
            parsedClass.discussions.push(section);
        }
    }

    return parsedClass;
}

function parseSections(table: HTMLTableRowElement[], parentClass: ClassData): SectionData[]
{
    let out = [];

    for(let i = 1; i + 2 < table.length; i += 3)
    {
        const parsedSection = parseSection(table, i, parentClass);

        if(parsedSection != null)
        {
            out.push(parsedSection);
        }
    }

    return out;
}

function parseSection(elements: HTMLTableRowElement[], index: number, parentClass: ClassData): SectionData | null
{
    for(let i = 0; i < 3; i++)
    {
        //console.log(i, elements[index + i]);
    }

    const row0: HTMLTableRowElement = elements[index];
    const row1: HTMLTableRowElement = elements[index + 1];

    const row0Elements = row0.getElementsByTagName("td");
    const row1Elements = row1.getElementsByTagName("td");

    const sectionType = getText(row0Elements[0]).trim().toUpperCase();
    const instructor = row0Elements[1].getElementsByTagName("a")[0]?.text?.trim() ?? "No assigned instructor";
    const topic = getText(row0Elements[1]).replaceAll("Topic:", "").trim();
    const creditHours = parseInt(getText(row0Elements[2]).trim());
    const sectionNumber = parseInt(getText(row0Elements[3].getElementsByTagName("strong")[0]));
    const openSeats = parseInt(getText(row0Elements[4].getElementsByTagName("span")[0]));

    //console.log("Type:", sectionType);
    //console.log("Instructor:", instructor);
    if(topic != "")
    {
        //console.log("Topic:", topic);
    }
    //console.log("Section:", sectionNumber);
    //console.log("Open Seats:", isNaN(openSeats) ? "Unopened" : openSeats);

    let timeAndLocationString = getText(row1Elements[1]).trim();

    let days: number[] = []
    
    if(timeAndLocationString.startsWith("M"))
    {
        days.push(1);
        timeAndLocationString = timeAndLocationString.substring(1).trimStart();
    }

    if(timeAndLocationString.startsWith("Tu"))
    {
        days.push(2);
        timeAndLocationString = timeAndLocationString.substring(2).trimStart();
    }

    if(timeAndLocationString.startsWith("W"))
    {
        days.push(3);
        timeAndLocationString = timeAndLocationString.substring(1).trimStart();
    }

    if(timeAndLocationString.startsWith("Th"))
    {
        days.push(4);
        timeAndLocationString = timeAndLocationString.substring(2).trimStart();
    }

    if(timeAndLocationString.startsWith("F"))
    {
        days.push(5);
        timeAndLocationString = timeAndLocationString.substring(1).trimStart();
    }

    //console.log("Days:", days);

    const online = timeAndLocationString.toLowerCase().includes("onlin"); // "onlin" is intended

    if(online)
    {
        //console.log("Online course");
    }
    
    const split = timeAndLocationString.split("-");

    const start = parseTime(split[0]);
    const end = parseTime(split[1]);

    if(start == -1 || end == -1)
    {
        //console.log("No scheduled time");
    }
    else
    {
        //console.log("Start:", start, unparseTime(start));
        //console.log("End:", end, unparseTime(end));
    }

    const spans = row1Elements[1].getElementsByTagName("span");

    const location = spans.length == 0 ? "No location" : getText(spans[0]).trim();
    //console.log("Location:", location);

    let times: ScheduledTime[] = [];

    for(let i = 0; i < days.length; i++)
    {
        let time: ScheduledTime = {
            day: days[i],
            startTime: start,
            endTime: end
        }

        times.push(time);
    }

    return {
        class: parentClass,
        sectionNumber: sectionNumber,
        instructor: instructor,
        credits: creditHours,
        topic: topic,
        type: sectionType,
        location: location,
        openSeats: openSeats,
        times: times
    }
}

function parseTime(timeString: string): number
{
    timeString = timeString.trim().toLowerCase();

    const am = timeString.endsWith("am");
    timeString = timeString.substring(0, timeString.length - 2);

    const split = timeString.split(":");

    if(split.length < 2)
    {
        return -1;
    }

    const hour = (parseInt(split[0].trim()) + 1) % 12 + (am ? 0 : 12);
    const minute = parseInt(split[1].trim())

    return hour * 12 + Math.floor(minute / 5);
}

function unparseTime(time: number): string
{
    let am = time < 144;
    if(!am)
    {
        time -= 144;
    }

    let hour = (Math.floor(time / 12) + 11) % 12;

    if(hour == 0)
    {
        hour = 12;
    }

    const minutes = (time % 12) * 5;

    return hour.toString() + ":" + (minutes == 0 ? "00" : minutes.toString()) + (am ? " AM" : " PM");
}

function getTableRows(table: HTMLTableSectionElement): HTMLTableRowElement[]
{
    let topRows: HTMLTableRowElement[] = [];

    for(let i = 0; i < table.children.length; i++)
    {
        if(table.children[i].tagName.toLowerCase() == "tr")
        {
            topRows.push(table.children[i] as HTMLTableRowElement);
        }
    }

    return topRows;
}

function getText(element: HTMLElement, onlyFirst: boolean = false): string
{
    let text: string = ""; 

    for(let i = 0; i < element.childNodes.length; i++)
    {
        const child = element.childNodes[i];

        if(child.nodeType != Node.TEXT_NODE)
        {
            continue;
        }

        if(child.textContent != null)
        {
            text += child.textContent.trim();
        }

        if(onlyFirst && text.length > 0)
        {
            break;
        }
    }

    return text;
}

export function deepCopyClass(classData: ClassData): ClassData
{
    const out = {
        id: String(classData.id),
        name: String(classData.name),
        description: String(classData.description),
        minCredits: Number(classData.minCredits),
        maxCredits: Number(classData.maxCredits),
        lectures: [] as SectionData[],
        labs: [] as SectionData[],
        discussions: [] as SectionData[],
        pinnedLab: Number(classData.pinnedLab),
        pinnedLecture: Number(classData.pinnedLecture),
        pinnedDiscussion: Number(classData.pinnedDiscussion),
        color: String(classData.color)
    };

    // It is necessary to do this rather than using the .map function or you'll get a exception. I could not possibly tell you why.
    for(let i = 0; i < out.lectures.length; i++)
    {
        out.lectures.push(deepCopySection(classData.lectures[i], out))
    }

    for(let i = 0; i < out.labs.length; i++)
    {
        out.labs.push(deepCopySection(classData.labs[i], out))
    }

    for(let i = 0; i < out.discussions.length; i++)
    {
        out.discussions.push(deepCopySection(classData.discussions[i], out))
    }

    return out;
}

export function deepCopySection(sectionData: SectionData, ownerClass: ClassData): SectionData
{
    return {
        class: ownerClass,
        sectionNumber: Number(sectionData.sectionNumber),
        instructor: String(sectionData.instructor),
        credits: Number(sectionData.credits),
        topic: String(sectionData.topic),
        type: String(sectionData.type),
        location: String(sectionData.location),
        openSeats: Number(sectionData.openSeats),
        times: sectionData.times.map(time => deepCopyTime(time))
    };
}

export function deepCopyTime(timeData: ScheduledTime): ScheduledTime
{
    return {
        day: Number(timeData.day),
        startTime: Number(timeData.startTime),
        endTime: Number(timeData.endTime),
    };
}