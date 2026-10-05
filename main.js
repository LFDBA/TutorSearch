const tutors = [];

function addTutor({ name, language, subjects, year, availability = [] }) {
    const tutor = {
        id: `tutor-${tutors.length + 1}`,
        name,
        language,
        subjects,
        year,
        availability
    };

    tutors.push(tutor);
    return tutor;
}

addTutor({
    name: "h",
    language: "jap",
    subjects: ["eng", "mat"],
    year: 13,
    availability: [
        { day: "monday", start: "02:00", end: "04:00" },
        { day: "monday", start: "13:00", end: "14:00" }
    ]
});
