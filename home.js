import { fetchTutorData } from "./supabase-client.js";
import { makeTutorCardClickable } from "./tutor-card.js";

//Find the AI-image switch and every image identified as AI-generated
const aiImageToggle = document.querySelector(".ai-image-toggle");
const aiImages = document.querySelectorAll("[data-ai-image]");

//Keep the visitor's AI-image preference between page visits
const savedAiImagePreference = localStorage.getItem("showAiImages");
let showAiImages = savedAiImagePreference === "true";

//Show or hide AI images and keep the switch text accessible
function updateAiImages() {
    document.body.classList.toggle("ai-images-hidden", !showAiImages);

    aiImages.forEach((image) => {
        image.hidden = !showAiImages;
    });

    aiImageToggle.setAttribute("aria-checked", String(showAiImages));
    aiImageToggle.setAttribute("aria-label", showAiImages ? "Hide AI images" : "Show AI images");
    aiImageToggle.querySelector(".ai-image-toggle__state").textContent = showAiImages ? "on" : "off";
}

//Reverse the preference whenever the visitor uses the switch
aiImageToggle.addEventListener("click", () => {
    showAiImages = !showAiImages;
    localStorage.setItem("showAiImages", String(showAiImages));
    updateAiImages();
});

//Apply the saved preference when the home page loads
updateAiImages();

//Convert stored JSON text and database arrays into one predictable format
function getStoredArray(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {
        try {
            const parsedValue = JSON.parse(value);
            return Array.isArray(parsedValue) ? parsedValue : [];
        } catch {
            return [];
        }
    }

    return [];
}

//Create a readable subject label that keeps its stored year level
function getSubjectLabel(subject) {
    const subjectName = subject.subjectName ?? subject.name ?? subject.subjectId ?? "Subject";
    const subjectYear = Number(subject.year);

    return Number.isFinite(subjectYear)
        ? `${subjectName} (Yr ${subjectYear})`
        : subjectName;
}

//Turn the database day value into display text
function getDayLabel(day) {
    const dayValue = String(day ?? "").trim();

    return dayValue
        ? dayValue.charAt(0).toUpperCase() + dayValue.slice(1).toLowerCase()
        : "Day unavailable";
}

//Build the small line icon used beside languages and availability
function createDetailIcon(type) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.classList.add("home-tutor-card__detail-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");

    if (type === "languages") {
        svg.innerHTML = `
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"></path>
        `;
    } else {
        svg.innerHTML = `
            <path d="M8 2v4M16 2v4"></path>
            <rect x="3" y="4" width="18" height="17" rx="2"></rect>
            <path d="M3 10h18"></path>
        `;
    }

    return svg;
}

//Use a stored profile picture and fall back to the tutor's saved initial
function createTutorAvatar(tutor) {
    const avatar = document.createElement("div");
    const tutorName = String(tutor.name ?? "Tutor").trim() || "Tutor";
    const fallbackInitial = [...tutorName][0]?.toLocaleUpperCase() ?? "?";
    const profileInitial = tutor.profile_initial ?? tutor.profileInitial ?? fallbackInitial;
    const profilePicture = tutor.profile_picture ?? tutor.profilePicture;

    avatar.className = "home-tutor-card__avatar";

    const showInitial = () => {
        const initial = document.createElement("span");
        initial.textContent = profileInitial;
        initial.setAttribute("aria-hidden", "true");
        avatar.replaceChildren(initial);
        avatar.setAttribute("aria-label", `${tutorName}'s profile initial`);
    };

    if (!profilePicture) {
        showInitial();
        return avatar;
    }

    const image = document.createElement("img");
    image.src = profilePicture;
    image.alt = `${tutorName}'s profile picture`;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", showInitial, { once: true });
    avatar.append(image);

    return avatar;
}

//Create the list of real subject and year combinations for one tutor
function createTutorSubjects(tutor) {
    const list = document.createElement("ul");
    const subjects = getStoredArray(tutor.subject ?? tutor.subjects);

    list.className = "home-tutor-card__subjects";

    if (subjects.length === 0) {
        const item = document.createElement("li");
        item.textContent = "No subjects listed";
        list.append(item);
        return list;
    }

    for (const subject of subjects) {
        const item = document.createElement("li");
        item.textContent = getSubjectLabel(subject);
        list.append(item);
    }

    return list;
}

//Create a compact language or availability row from stored tutor data
function createTutorDetail(type, text) {
    const detail = document.createElement("p");
    const value = document.createElement("span");

    detail.className = "home-tutor-card__detail";
    value.textContent = text;
    detail.append(createDetailIcon(type), value);

    return detail;
}

//Format every stored availability timeframe without inventing a summary
function getAvailabilityLabel(tutor) {
    const availability = getStoredArray(tutor.availability);

    if (availability.length === 0) {
        return "No availability listed";
    }

    return availability
        .map(timeframe =>
            `${getDayLabel(timeframe.day)} ${timeframe.start ?? "?"}–${timeframe.end ?? "?"}`
        )
        .join(" · ");
}

//Build one homepage tutor card entirely from a Supabase record
function createHomepageTutorCard(tutor) {
    const card = document.createElement("article");
    const content = document.createElement("div");
    const tutorName = document.createElement("h3");
    const languages = getStoredArray(tutor.language ?? tutor.languages);

    card.className = "home-tutor-card";
    content.className = "home-tutor-card__content";
    tutorName.textContent = String(tutor.name ?? "Tutor").trim() || "Tutor";

    content.append(
        tutorName,
        createTutorSubjects(tutor),
        createTutorDetail(
            "languages",
            languages.length > 0 ? languages.join(" · ") : "No languages listed"
        ),
        createTutorDetail("availability", getAvailabilityLabel(tutor))
    );

    card.append(createTutorAvatar(tutor), content);
    return makeTutorCardClickable(card, tutor);
}

//Fetch and display only the first three tutor records on the home page
async function loadHomepageTutors() {
    const tutorList = document.querySelector("#home-tutor-list");
    const tutors = await fetchTutorData(3);

    tutorList.replaceChildren();

    if (!Array.isArray(tutors) || tutors.length === 0) {
        const message = document.createElement("p");
        message.className = "home-tutors__status";
        message.textContent = "Tutor profiles are unavailable right now.";
        tutorList.append(message);
        return;
    }

    for (const tutor of tutors.slice(0, 3)) {
        tutorList.append(createHomepageTutorCard(tutor));
    }
}

loadHomepageTutors();
