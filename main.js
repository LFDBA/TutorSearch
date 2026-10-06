//Tutors array
const tutors = [];

//Add tutor to tutors array. Params: name - string, lang - string array, sub - string array, year - int array, avail - json array
function addTutor({ name, language, subject, year, availability = [] }) {
    const tutor = {
        id: `tutor-${tutors.length + 1}`,
        name,
        language,
        subject,
        year,
        availability
    };

    tutors.push(tutor);
    return tutor;
}

//Functionality check
addTutor({
    name: "h",
    language: ["jap"],
    subject: ["eng", "mat"],
    year: [13],
    availability: [
        { day: "monday", start: "02:00", end: "04:00" },
        { day: "monday", start: "13:00", end: "14:00" }
    ],
    email: "s@gmail.com"
});

