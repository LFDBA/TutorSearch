//Convert database JSON text and arrays into a consistent array
function getArray(value) {
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

//Create a readable subject and year label
function getSubjectLabel(subject) {
    const name = subject.subjectName ?? subject.name ?? subject.subjectId ?? "Subject";
    const year = Number(subject.year);

    return Number.isFinite(year)
        ? `${name} (Year ${year})`
        : name;
}

//Turn a stored day value into a readable heading
function getDayLabel(day) {
    const value = String(day ?? "").trim();

    return value
        ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        : "Unknown day";
}

//Create the profile photo or its first-letter fallback
function createTutorAvatar(tutor) {
    const avatar = document.createElement("div");
    const profilePicture = tutor.profile_picture ?? tutor.profilePicture;
    const tutorName = String(tutor.name ?? "Tutor").trim() || "Tutor";
    const fallbackInitial = [...tutorName][0]?.toLocaleUpperCase() ?? "?";
    const profileInitial = tutor.profile_initial ?? tutor.profileInitial ?? fallbackInitial;

    avatar.className = "tutor-avatar";

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

//Create the tutor's subject pill list
function createSubjectList(tutor) {
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    const list = document.createElement("ul");
    const subjects = getArray(tutor.subject ?? tutor.subjects);

    section.className = "tutor-subjects";
    heading.textContent = "Subjects";
    list.className = "subject-list";

    if (subjects.length === 0) {
        const item = document.createElement("li");
        item.className = "empty-detail";
        item.textContent = "No subjects listed";
        list.append(item);
    } else {
        for (const subject of subjects) {
            const item = document.createElement("li");
            item.textContent = getSubjectLabel(subject);
            list.append(item);
        }
    }

    section.append(heading, list);
    return section;
}

//Create the expandable availability list
function createAvailabilityDetails(tutor) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const list = document.createElement("ul");
    const availability = getArray(tutor.availability);

    details.className = "tutor-availability";
    summary.textContent = "Availability";
    list.className = "availability-list";

    if (availability.length === 0) {
        const item = document.createElement("li");
        item.className = "empty-detail";
        item.textContent = "No availability listed";
        list.append(item);
    } else {
        for (const timeframe of availability) {
            const item = document.createElement("li");
            const day = document.createElement("span");
            const time = document.createElement("span");

            day.textContent = getDayLabel(timeframe.day);
            time.textContent = `${timeframe.start ?? "?"}\u2013${timeframe.end ?? "?"}`;
            item.append(day, time);
            list.append(item);
        }
    }

    details.append(summary, list);
    return details;
}

//Build one reusable tutor card from a database record
export function createTutorCard(tutor) {
    const card = document.createElement("article");
    const header = document.createElement("header");
    const identity = document.createElement("div");
    const name = document.createElement("h2");
    const tutorEmail = String(tutor.email ?? "").trim();
    const email = document.createElement(tutorEmail ? "a" : "span");

    card.className = "tutor-card";
    header.className = "tutor-card-header";
    identity.className = "tutor-card-identity";
    name.textContent = String(tutor.name ?? "Tutor").trim() || "Tutor";
    email.className = "tutor-email";
    email.textContent = tutorEmail || "No email listed";

    if (tutorEmail) {
        email.href = `mailto:${tutorEmail}`;
    }

    identity.append(name, email);
    header.append(createTutorAvatar(tutor), identity);
    card.append(
        header,
        createSubjectList(tutor),
        createAvailabilityDetails(tutor)
    );

    return card;
}
