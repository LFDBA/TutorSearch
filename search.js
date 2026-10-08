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

    return (Array.isArray(tutorList) ? tutorList : [])
        .filter(tutor => matchesLanguageFilter(tutor, searchedLanguages))
        .map(tutor => ({
            tutor,
            score: getTutorSubjectScore(tutor, searchedSubjects)
        }))
        .filter(match => match.score > 0)
        .sort((first, second) => second.score - first.score);
}

searchTutorsButton.addEventListener("click", () => {
    const profile = getProfile();
    const matches = searchForMatch(tutors, profile);

    console.log("Subject matches:", matches);
});
