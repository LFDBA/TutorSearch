const availability = {
    day: "",
    times: []
};

function Tutor(name, language, subject, year, availability, id){
    this.name = name;
    this.language = language;
    this.subject = subject;
    this.year = year;
    this.availability = availability;
    this.id = id;
};

const tutors = [];

function addTutor(name, language, subject, year, availability){
    tutors.push(new Tutor(name, language, subject, year, availability, tutors.length));
    console.log(tutors);
}