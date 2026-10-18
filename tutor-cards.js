import { fetchTutorData } from "./supabase-client.js";
import { createTutorCard } from "./tutor-card.js";

//Tutor card container
const tutorCardsContainer = document.querySelector("#tutor-cards");

//Fetch the current tutor records for tutor card testing
async function loadTutors() {
    const tutors = await fetchTutorData();

    if (!Array.isArray(tutors)) {
        console.error("Tutor records could not be loaded.");
        return [];
    }

    console.log("Fetched tutors:", tutors);
    return tutors;
}

//Fetch the tutors and render only the first one for this card test
export const tutors = await loadTutors();

if (tutors[0]) {
    tutorCardsContainer.append(createTutorCard(tutors[0]));
} else {
    console.warn("There is no tutor at tutors[0] to display.");
}
