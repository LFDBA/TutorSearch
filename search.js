import { fetchTutorData } from './supabase-client.js';
import { getProfile } from './main.js';


const searchTutorsButton = document.querySelector("#search-tutors");

const tutors = await fetchTutorData();

//Points awarded for each type of subject comparison
const subjectMatchScores = {
    exactSubjectAndYear: 100,
    subjectOnly: 25,
    yearOnly: 10
};

//Return the subject array stored by Supabase
function getTutorSubjects(tutor) {
    const subjects = tutor.subject ?? tutor.subjects;

    if (Array.isArray(subjects)) {
        return subjects;
    }

    //Support subject arrays that have been stored as JSON text
    if (typeof subjects === "string") {
        try {
            const parsedSubjects = JSON.parse(subjects);
            return Array.isArray(parsedSubjects) ? parsedSubjects : [];
        } catch {
            return [];
        }
    }

    return [];
}

//Return the language array stored by Supabase
function getTutorLanguages(tutor) {
    const languages = tutor.language ?? tutor.languages;

    if (Array.isArray(languages)) {
        return languages;
    }

    //Support language arrays that have been stored as JSON text
    if (typeof languages === "string") {
        try {
            const parsedLanguages = JSON.parse(languages);
            return Array.isArray(parsedLanguages) ? parsedLanguages : [parsedLanguages];
        } catch {
            return [languages];
        }
    }

    return [];
}

//Make language names comparable despite differences in case or spacing
function getLanguageKey(language) {
    return String(language).trim().toLowerCase();
}

//Keep tutors who speak at least one selected language
function matchesLanguageFilter(tutor, searchedLanguages) {
    if (searchedLanguages.length === 0) {
        return true;
    }

    const tutorLanguages = new Set(
        getTutorLanguages(tutor).map(getLanguageKey)
    );

    return searchedLanguages.some(language =>
        tutorLanguages.has(getLanguageKey(language))
    );
}

//Return the availability array stored by Supabase
function getTutorAvailability(tutor) {
    const availability = tutor.availability;

    if (Array.isArray(availability)) {
        return availability;
    }

    //Support availability arrays that have been stored as JSON text
    if (typeof availability === "string") {
        try {
            const parsedAvailability = JSON.parse(availability);
            return Array.isArray(parsedAvailability) ? parsedAvailability : [];
        } catch {
            return [];
        }
    }

    return [];
}

//Convert an HH:MM time into minutes after midnight
function timeToMinutes(time) {
    const timeParts = String(time).match(/^(\d{1,2}):(\d{2})$/);

    if (!timeParts) {
        return undefined;
    }

    const hours = Number(timeParts[1]);
    const minutes = Number(timeParts[2]);

    if (hours > 24 || minutes > 59 || (hours === 24 && minutes !== 0)) {
        return undefined;
    }

    return (hours * 60) + minutes;
}

//Calculate how much of one searched timeframe a tutor covers
function compareTimeframes(searchedTimeframe, tutorTimeframe) {
    const searchedDay = String(searchedTimeframe.day).trim().toLowerCase();
    const tutorDay = String(tutorTimeframe.day).trim().toLowerCase();

    if (!searchedDay || searchedDay !== tutorDay) {
        return 0;
    }

    const searchedStart = timeToMinutes(searchedTimeframe.start);
    const searchedEnd = timeToMinutes(searchedTimeframe.end);
    const tutorStart = timeToMinutes(tutorTimeframe.start);
    const tutorEnd = timeToMinutes(tutorTimeframe.end);

    if (
        searchedStart === undefined ||
        searchedEnd === undefined ||
        tutorStart === undefined ||
        tutorEnd === undefined ||
        searchedStart >= searchedEnd ||
        tutorStart >= tutorEnd
    ) {
        return 0;
    }

    const overlapStart = Math.max(searchedStart, tutorStart);
    const overlapEnd = Math.min(searchedEnd, tutorEnd);
    const overlapMinutes = Math.max(0, overlapEnd - overlapStart);
    const searchedDuration = searchedEnd - searchedStart;

    return overlapMinutes / searchedDuration;
}

//Average the best coverage for every searched availability timeframe
function getTutorAvailabilityScore(tutor, searchedAvailability) {
    if (searchedAvailability.length === 0) {
        return null;
    }

    const tutorAvailability = getTutorAvailability(tutor);

    if (tutorAvailability.length === 0) {
        return 0;
    }

    const bestCoverageScores = searchedAvailability.map(searchedTimeframe =>
        Math.max(
            ...tutorAvailability.map(tutorTimeframe =>
                compareTimeframes(searchedTimeframe, tutorTimeframe)
            )
        )
    );
    const totalCoverage = bestCoverageScores.reduce(
        (total, coverage) => total + coverage,
        0
    );

    return Math.round((totalCoverage / searchedAvailability.length) * 100);
}

//Create one comparable subject name from either an ID or a display name
function getSubjectKey(subject) {
    return String(subject.subjectId ?? subject.subjectName ?? "")
        .trim()
        .toLowerCase();
}

//Score one searched subject against one subject offered by a tutor
function compareSubjects(searchedSubject, tutorSubject) {
    const searchedSubjectKey = getSubjectKey(searchedSubject);
    const tutorSubjectKey = getSubjectKey(tutorSubject);
    const hasSameSubject = searchedSubjectKey.length > 0 &&
        searchedSubjectKey === tutorSubjectKey;
    const searchedYear = Number(searchedSubject.year);
    const tutorYear = Number(tutorSubject.year);
    const hasValidYears = Number.isFinite(searchedYear) && Number.isFinite(tutorYear);
    const hasSameYear = hasValidYears && searchedYear === tutorYear;

    if (hasSameSubject && hasSameYear) {
        return subjectMatchScores.exactSubjectAndYear;
    }

    if (hasSameSubject) {
        return subjectMatchScores.subjectOnly;
    }

    if (hasSameYear) {
        return subjectMatchScores.yearOnly;
    }

    return 0;
}

//Find the tutor's best comparison for every subject in the search profile
function getTutorSubjectScore(tutor, searchedSubjects) {
    const tutorSubjects = getTutorSubjects(tutor);

    if (searchedSubjects.length === 0 || tutorSubjects.length === 0) {
        return 0;
    }

    const bestScores = searchedSubjects.map(searchedSubject =>
        Math.max(
            ...tutorSubjects.map(tutorSubject =>
                compareSubjects(searchedSubject, tutorSubject)
            )
        )
    );

    const totalScore = bestScores.reduce((total, score) => total + score, 0);
    return Math.round(totalScore / searchedSubjects.length);
}

//Score every tutor and place the strongest subject matches first
function searchForMatch(tutorList, profile) {
    const searchedSubjects = profile?.subjects ?? [];
    const searchedLanguages = profile?.languages ?? [];
    const searchedAvailability = profile?.availability ?? [];

    return (Array.isArray(tutorList) ? tutorList : [])
        .filter(tutor => matchesLanguageFilter(tutor, searchedLanguages))
        .map(tutor => ({
            tutor,
            subjectScore: getTutorSubjectScore(tutor, searchedSubjects),
            availabilityScore: getTutorAvailabilityScore(tutor, searchedAvailability)
        }))
        .filter(match =>
            match.subjectScore > 0 &&
            (searchedAvailability.length === 0 || match.availabilityScore > 0)
        )
        .sort((first, second) =>
            second.subjectScore - first.subjectScore ||
            (second.availabilityScore ?? 0) - (first.availabilityScore ?? 0)
        );
}

searchTutorsButton.addEventListener("click", () => {
    const profile = getProfile();
    const matches = searchForMatch(tutors, profile);

    console.log("Tutor matches:", matches);
});
