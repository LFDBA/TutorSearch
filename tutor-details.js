import { fetchTutorData } from "./supabase-client.js";
import { createTutorCard } from "./tutor-card.js";

//Read the tutor identifier placed in the page URL by a tutor card
const searchParameters = new URLSearchParams(window.location.search);
const selectedTutorId = searchParameters.get("id");
const selectedTutorEmail = searchParameters.get("email")?.trim().toLowerCase();

//Compare every supported database identifier with the selected URL value
function getTutorId(tutor) {
    return tutor.id ?? tutor.tutor_id ?? tutor.uuid;
}

//Show a helpful message when the selected tutor cannot be displayed
function showTutorError(message) {
    const status = document.querySelector("#tutor-profile-status");
    const cardContainer = document.querySelector("#tutor-profile-card");

    cardContainer.replaceChildren();
    status.textContent = message;
}

//Fetch the current tutor and display their existing full tutor card
async function loadTutorProfile() {
    if (!selectedTutorId && !selectedTutorEmail) {
        showTutorError("No tutor was selected. Please return to the tutor search.");
        return;
    }

    const tutors = await fetchTutorData();

    if (!Array.isArray(tutors)) {
        showTutorError("This tutor profile is unavailable right now.");
        return;
    }

    const tutor = tutors.find((candidate) => {
        if (selectedTutorId) {
            return String(getTutorId(candidate)) === selectedTutorId;
        }

        return String(candidate.email ?? "").trim().toLowerCase() === selectedTutorEmail;
    });

    if (!tutor) {
        showTutorError("This tutor profile could not be found.");
        return;
    }

    const tutorName = String(tutor.name ?? "Tutor").trim() || "Tutor";
    const title = document.querySelector("#tutor-profile-title");
    const status = document.querySelector("#tutor-profile-status");
    const cardContainer = document.querySelector("#tutor-profile-card");

    document.title = `Tutor Search | ${tutorName}`;
    title.textContent = `${tutorName}'s profile`;
    status.textContent = "";
    cardContainer.replaceChildren(createTutorCard(tutor, { clickable: false }));
}

loadTutorProfile();
