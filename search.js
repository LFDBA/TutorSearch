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

//Contribution of each score to the regular tutor ranking
const matchWeights = {
    subject: 0.7,
    availability: 0.3
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

//Compare one searched timeframe with one tutor timeframe
function compareTimeframes(searchedTimeframe, tutorTimeframe) {
    const searchedDay = String(searchedTimeframe.day).trim().toLowerCase();
    const tutorDay = String(tutorTimeframe.day).trim().toLowerCase();

    if (!searchedDay || searchedDay !== tutorDay) {
        return {
            score: 0,
            hasOverlap: false
        };
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
        return {
            score: 0,
            hasOverlap: false
        };
    }

    const overlapStart = Math.max(searchedStart, tutorStart);
    const overlapEnd = Math.min(searchedEnd, tutorEnd);
    const overlapMinutes = Math.max(0, overlapEnd - overlapStart);
    const searchedDuration = searchedEnd - searchedStart;

    if (overlapMinutes > 0) {
        return {
            score: Math.round((overlapMinutes / searchedDuration) * 100),
            hasOverlap: true
        };
    }

    //Give same-day near misses a small score for fallback recommendations
    const gapMinutes = tutorStart >= searchedEnd
        ? tutorStart - searchedEnd
        : searchedStart - tutorEnd;
    const proximityScore = Math.max(
        1,
        Math.round(20 * (1 - (gapMinutes / (24 * 60))))
    );

    return {
        score: proximityScore,
        hasOverlap: false
    };
}

//Average the closest comparison for every searched availability timeframe
function getTutorAvailabilityMatch(tutor, searchedAvailability) {
    if (searchedAvailability.length === 0) {
        return {
            score: null,
            hasOverlap: true
        };
    }

    const tutorAvailability = getTutorAvailability(tutor);

    if (tutorAvailability.length === 0) {
        return {
            score: 0,
            hasOverlap: false
        };
    }

    const bestComparisons = searchedAvailability.map(searchedTimeframe => {
        const comparisons = tutorAvailability.map(tutorTimeframe =>
            compareTimeframes(searchedTimeframe, tutorTimeframe)
        );

        //Prefer an actual overlap, even when a near miss has a larger numeric score
        return comparisons.sort((first, second) =>
            Number(second.hasOverlap) - Number(first.hasOverlap) ||
            second.score - first.score
        )[0];
    });
    const totalScore = bestComparisons.reduce(
        (total, comparison) => total + comparison.score,
        0
    );

    return {
        score: Math.round(totalScore / bestComparisons.length),
        hasOverlap: bestComparisons.some(comparison => comparison.hasOverlap)
    };
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

//Combine subject and availability without adding language to the score
function getOverallScore(subjectScore, availabilityScore) {
    if (availabilityScore === null) {
        return subjectScore;
    }

    return Math.round(
        (subjectScore * matchWeights.subject) +
        (availabilityScore * matchWeights.availability)
    );
}

//Create direct matches and availability-based fallback suggestions
function searchForMatch(tutorList, profile) {
    const searchedSubjects = profile?.subjects ?? [];
    const searchedLanguages = profile?.languages ?? [];
    const searchedAvailability = profile?.availability ?? [];

    const candidates = (Array.isArray(tutorList) ? tutorList : [])
        .filter(tutor => matchesLanguageFilter(tutor, searchedLanguages))
        .map(tutor => {
            const subjectScore = getTutorSubjectScore(tutor, searchedSubjects);
            const availabilityMatch = getTutorAvailabilityMatch(
                tutor,
                searchedAvailability
            );

            return {
                tutor,
                subjectScore,
                availabilityScore: availabilityMatch.score,
                hasAvailabilityOverlap: availabilityMatch.hasOverlap,
                score: getOverallScore(subjectScore, availabilityMatch.score)
            };
        })
        .filter(match => match.subjectScore > 0);

    const directMatches = candidates
        .filter(match => match.hasAvailabilityOverlap)
        .sort((first, second) =>
            second.score - first.score ||
            second.subjectScore - first.subjectScore
        );

    const availabilitySuggestions = [...candidates].sort((first, second) =>
        (second.availabilityScore ?? 0) - (first.availabilityScore ?? 0) ||
        second.subjectScore - first.subjectScore
    );

    return {
        directMatches,
        availabilitySuggestions
    };
}

searchTutorsButton.addEventListener("click", () => {
    const profile = getProfile();
    const { directMatches, availabilitySuggestions } = searchForMatch(tutors, profile);

    if (directMatches.length > 0) {
        console.log("Tutor matches:", directMatches);
    } else if (availabilitySuggestions.length > 0) {
        console.log("no direct matches: consider", availabilitySuggestions);
    } else {
        console.log("No matching tutors found.");
    }
});
