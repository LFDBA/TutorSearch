function Day(times){
    this.times = times;
}

function Availability(day){
    this.day = day;
}

function Tutor(name, language, subject, year){
    this.name = name;
    this.language = language;
    this.subject = subject;
    this.year = year;
    this.availability = [];
};

const tutors = [];

function addTutor(name, language, subject, year, availability){
    tutors.push(new Tutor(name, language, subject, year));
    tutors[tutors.length-1].availability = availability;
    console.log(tutors);
}
addTutor("h", "jap", ["eng", "mat"], 13, new Availability(new Day([[2,4], [13, 14]])));