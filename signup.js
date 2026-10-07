const languageCodes = [
    "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az",
    "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs",
    "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy",
    "da", "de", "dv", "dz",
    "ee", "el", "en", "eo", "es", "et", "eu",
    "fa", "ff", "fi", "fj", "fo", "fr", "fy",
    "ga", "gd", "gl", "gn", "gu", "gv",
    "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz",
    "ia", "id", "ie", "ig", "ii", "ik", "io", "is", "it", "iu",
    "ja", "jv",
    "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky",
    "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv",
    "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my",
    "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny",
    "oc", "oj", "om", "or", "os",
    "pa", "pi", "pl", "ps", "pt",
    "qu",
    "rm", "rn", "ro", "ru", "rw",
    "sa", "sc", "sd", "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw",
    "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty",
    "ug", "uk", "ur", "uz",
    "ve", "vi", "vo",
    "wa", "wo",
    "xh",
    "yi", "yo",
    "za", "zh", "zu",

    // Widely used languages without a two-letter code, plus languages relevant in Aotearoa.
    "ase", "asf", "bfi", "bik", "ceb", "cmn", "fil", "hak", "haw", "hif", "hil",
    "ilo", "nan", "niu", "nzs", "pag", "pam", "rar", "tkl", "tpi", "tvl", "war", "wuu", "yue"
];

const languageLabelOverrides = {
    aa: "Afar",
    ab: "Abkhazian",
    ae: "Avestan",
    ase: "American Sign Language",
    asf: "Australian Sign Language (Auslan)",
    av: "Avaric",
    ba: "Bashkir",
    bfi: "British Sign Language",
    bi: "Bislama",
    bik: "Bikol",
    bo: "Tibetan",
    ce: "Chechen",
    ch: "Chamorro",
    cmn: "Mandarin Chinese",
    cr: "Cree",
    cu: "Church Slavonic",
    cv: "Chuvash",
    dz: "Dzongkha",
    ff: "Fulah",
    fil: "Filipino",
    fj: "Fijian",
    gv: "Manx",
    hak: "Hakka Chinese",
    hif: "Fiji Hindi",
    hil: "Hiligaynon",
    ho: "Hiri Motu",
    hz: "Herero",
    ie: "Interlingue",
    ii: "Sichuan Yi",
    ik: "Inupiaq",
    io: "Ido",
    kg: "Kongo",
    ki: "Kikuyu",
    kj: "Kuanyama",
    kl: "Greenlandic",
    kr: "Kanuri",
    ks: "Kashmiri",
    kv: "Komi",
    kw: "Cornish",
    li: "Limburgish",
    lu: "Luba-Katanga",
    mh: "Marshallese",
    na: "Nauru",
    nan: "Min Nan Chinese",
    nd: "North Ndebele",
    ng: "Ndonga",
    niu: "Niuean",
    nr: "South Ndebele",
    nv: "Navajo",
    nzs: "New Zealand Sign Language",
    oj: "Ojibwe",
    os: "Ossetian",
    pag: "Pangasinan",
    pam: "Kapampangan",
    pi: "Pali",
    rar: "Cook Islands Māori",
    rn: "Kirundi",
    sc: "Sardinian",
    se: "Northern Sámi",
    sg: "Sango",
    ss: "Swati",
    tkl: "Tokelauan",
    tl: "Tagalog",
    tpi: "Tok Pisin",
    tw: "Twi",
    ty: "Tahitian",
    tvl: "Tuvaluan",
    ve: "Venda",
    vo: "Volapük",
    war: "Waray",
    wuu: "Wu Chinese",
    za: "Zhuang",
    zh: "Chinese (general)"
};

const languageNames = new Intl.DisplayNames(["en"], { type: "language" });
const languageSelect = document.querySelector("#languages");

const languageOptions = languageCodes
    .map(code => {
        const name = languageLabelOverrides[code] ?? languageNames.of(code);

        return {
            value: name,
            label: name
        };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "en"));

languageOptions.push({ value: "Other", label: "Other" });

for (const language of languageOptions) {
    const option = document.createElement("option");
    option.value = language.value;
    option.textContent = language.label;
    languageSelect.append(option);
}

if (typeof Choices !== "undefined") {
    new Choices(languageSelect, {
        removeItemButton: true,
        searchEnabled: true,
        searchPlaceholderValue: "Search languages",
        placeholder: true,
        placeholderValue: "Select languages",
        shouldSort: false
    });
}

const data = await fetch("./subjects.json").then(response => response.json());
const dialog = document.querySelector("#subjects-dialog");
const subjectsForm = document.querySelector("#subjects-form");
const openSubjectsButton = document.querySelector("#open-subjects");
const yearInputs = [...document.querySelectorAll('input[name="year"]')];
const subjectSelect = document.querySelector("#subjects");
const subjectHelp = document.querySelector("#subject-help");
const subjectSummary = document.querySelector("#subject-summary");

let dialogSnapshot;
let subjectChoices;

if (typeof Choices !== "undefined") {
    subjectChoices = new Choices(subjectSelect, {
        removeItemButton: true,
        searchEnabled: true,
        searchFields: ["label"],
        searchResultLimit: -1,
        searchPlaceholderValue: "Search subjects",
        placeholder: true,
        placeholderValue: "Search and select subjects",
        noResultsText: "No matching subjects",
        noChoicesText: "Select a year group first",
        itemSelectText: "",
        fuseOptions: {
            threshold: 0.3
        },
        shouldSort: false
    });

    subjectChoices.disable();
}

function getSelectedYears() {
    return yearInputs
        .filter(input => input.checked)
        .map(input => Number(input.value));
}

function getSelectedSubjectIds() {
    return [...subjectSelect.selectedOptions].map(option => option.value);
}

function updateSubjectSummary() {
    const selectedSubjects = [...subjectSelect.selectedOptions]
        .map(option => option.textContent);

    subjectSummary.textContent = selectedSubjects.length
        ? `${selectedSubjects.length} selected: ${selectedSubjects.join(", ")}`
        : "No subjects selected.";
}

function updateSubjectChoices(selectedSubjectIds = getSelectedSubjectIds()) {
    const selectedYears = getSelectedYears();
    const availableSubjects = data.subjects
        .filter(subject => selectedYears.some(year => subject.years.includes(year)))
        .sort((a, b) => a.name.localeCompare(b.name, "en"));
    const availableSubjectIds = new Set(availableSubjects.map(subject => subject.id));
    const retainedSubjectIds = new Set(
        selectedSubjectIds.filter(id => availableSubjectIds.has(id))
    );
    const choices = availableSubjects.map(subject => ({
        value: subject.id,
        label: subject.name,
        selected: retainedSubjectIds.has(subject.id)
    }));
    const hasSelectedYears = selectedYears.length > 0;

    if (subjectChoices) {
        subjectChoices.setChoices(choices, "value", "label", true, true, true);

        if (hasSelectedYears) {
            subjectChoices.enable();
        } else {
            subjectChoices.disable();
        }
    } else {
        subjectSelect.replaceChildren();

        for (const choice of choices) {
            const option = document.createElement("option");
            option.value = choice.value;
            option.textContent = choice.label;
            option.selected = choice.selected;
            subjectSelect.append(option);
        }

        subjectSelect.disabled = !hasSelectedYears;
    }

    subjectHelp.textContent = hasSelectedYears
        ? `Showing ${availableSubjects.length} subjects available in Year ${selectedYears.join(", ")}.`
        : "Select at least one year group first.";

    updateSubjectSummary();
}

for (const yearInput of yearInputs) {
    yearInput.addEventListener("change", () => updateSubjectChoices());
}

subjectSelect.addEventListener("change", updateSubjectSummary);

openSubjectsButton.addEventListener("click", () => {
    dialogSnapshot = {
        years: getSelectedYears(),
        subjects: getSelectedSubjectIds()
    };
    dialog.returnValue = "";
    dialog.showModal();

    if (dialogSnapshot.years.length === 0) {
        yearInputs[0].focus();
    }
});

subjectsForm.addEventListener("submit", event => {
    if (event.submitter?.value !== "confirm") {
        return;
    }

    if (getSelectedYears().length === 0) {
        event.preventDefault();
        subjectHelp.textContent = "Choose at least one year group.";
        yearInputs[0].focus();
        return;
    }

    if (getSelectedSubjectIds().length === 0) {
        event.preventDefault();
        subjectHelp.textContent = "Choose at least one subject.";

        if (subjectChoices) {
            subjectChoices.showDropdown();
        } else {
            subjectSelect.focus();
        }
    }
});

dialog.addEventListener("close", () => {
    if (dialog.returnValue !== "confirm" && dialogSnapshot) {
        const savedYears = new Set(dialogSnapshot.years);

        for (const yearInput of yearInputs) {
            yearInput.checked = savedYears.has(Number(yearInput.value));
        }

        updateSubjectChoices(dialogSnapshot.subjects);
    } else {
        updateSubjectSummary();
    }

    dialogSnapshot = undefined;
});

const availabilityDialog = document.querySelector("#availability-dialog");
const availabilityForm = document.querySelector("#availability-form");
const openAvailabilityButton = document.querySelector("#open-availability");
const availabilityDayButtons = [...document.querySelectorAll("[data-availability-day]")];
const availabilityEditor = document.querySelector("#availability-editor");
const availabilityDayHeading = document.querySelector("#availability-day-heading");
const availabilityTrack = document.querySelector("#availability-track");
const availabilityHelp = document.querySelector("#availability-help");
const availabilityList = document.querySelector("#availability-list");
const removeTimeframeButton = document.querySelector("#remove-timeframe");
const availabilitySummary = document.querySelector("#availability-summary");
const availabilityData = document.querySelector("#availability-data");

const dayLength = 24 * 60;
const snapInterval = 15;
const defaultDuration = 60;
const minimumDuration = 15;
const days = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" }
];
const availability = Object.fromEntries(days.map(day => [day.value, []]));

let selectedAvailabilityDay;
let selectedTimeframeId;
let nextTimeframeId = 1;
let availabilitySnapshot;
let activeDrag;
let suppressTimelineClick = false;

function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
}

function snapMinutes(minutes) {
    return Math.round(minutes / snapInterval) * snapInterval;
}

function formatMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}

function getDayLabel(dayValue) {
    return days.find(day => day.value === dayValue)?.label ?? dayValue;
}

function rangesOverlap(day, timeframeId, start, end) {
    return availability[day].some(timeframe =>
        timeframe.id !== timeframeId &&
        start < timeframe.end &&
        end > timeframe.start
    );
}

function getMinutesFromPointer(clientX) {
    const trackBounds = availabilityTrack.getBoundingClientRect();
    const position = clamp(clientX - trackBounds.left, 0, trackBounds.width);

    return snapMinutes((position / trackBounds.width) * dayLength);
}

function getFlatAvailability() {
    return days.flatMap(day =>
        [...availability[day.value]]
            .sort((a, b) => a.start - b.start)
            .map(timeframe => ({
                day: day.value,
                start: formatMinutes(timeframe.start),
                end: formatMinutes(timeframe.end)
            }))
    );
}

function syncAvailabilityOutput() {
    const timeframes = getFlatAvailability();

    availabilityData.value = JSON.stringify(timeframes);
    availabilitySummary.textContent = timeframes.length
        ? `${timeframes.length} selected: ${timeframes.map(timeframe =>
            `${getDayLabel(timeframe.day)} ${timeframe.start}–${timeframe.end}`
        ).join(", ")}`
        : "No availability selected.";
}

function updateTimeframeElement(element, timeframe) {
    const startPercentage = (timeframe.start / dayLength) * 100;
    const widthPercentage = ((timeframe.end - timeframe.start) / dayLength) * 100;
    const label = `${formatMinutes(timeframe.start)}–${formatMinutes(timeframe.end)}`;

    element.style.left = `${startPercentage}%`;
    element.style.width = `${widthPercentage}%`;
    element.setAttribute("aria-label", label);
    element.title = label;
    element.querySelector(".availability-timeframe-label").textContent = label;
}

function selectTimeframe(timeframeId) {
    selectedTimeframeId = timeframeId;

    for (const element of availabilityTrack.querySelectorAll(".availability-timeframe")) {
        element.classList.toggle(
            "is-selected",
            Number(element.dataset.timeframeId) === selectedTimeframeId
        );
    }

    removeTimeframeButton.disabled = selectedTimeframeId === undefined;
}

function renderAvailability() {
    for (const button of availabilityDayButtons) {
        const day = button.dataset.availabilityDay;
        const count = availability[day].length;

        button.textContent = count ? `${getDayLabel(day)} (${count})` : getDayLabel(day);
        button.setAttribute("aria-pressed", String(day === selectedAvailabilityDay));
    }

    availabilityTrack.replaceChildren();
    availabilityList.replaceChildren();

    if (!selectedAvailabilityDay) {
        availabilityEditor.hidden = true;
        syncAvailabilityOutput();
        return;
    }

    availabilityEditor.hidden = false;
    availabilityDayHeading.textContent = getDayLabel(selectedAvailabilityDay);
    availabilityTrack.setAttribute(
        "aria-label",
        `${getDayLabel(selectedAvailabilityDay)} availability timeline`
    );

    const sortedTimeframes = [...availability[selectedAvailabilityDay]]
        .sort((a, b) => a.start - b.start);

    for (const timeframe of sortedTimeframes) {
        const element = document.createElement("div");
        const startHandle = document.createElement("span");
        const label = document.createElement("span");
        const endHandle = document.createElement("span");

        element.className = "availability-timeframe";
        element.dataset.timeframeId = timeframe.id;
        element.tabIndex = 0;
        element.classList.toggle("is-selected", timeframe.id === selectedTimeframeId);

        startHandle.className = "availability-resize-handle";
        startHandle.dataset.edge = "start";
        label.className = "availability-timeframe-label";
        endHandle.className = "availability-resize-handle";
        endHandle.dataset.edge = "end";

        element.append(startHandle, label, endHandle);
        updateTimeframeElement(element, timeframe);
        availabilityTrack.append(element);

        const listItem = document.createElement("li");
        listItem.textContent = `${formatMinutes(timeframe.start)}–${formatMinutes(timeframe.end)}`;
        availabilityList.append(listItem);
    }

    removeTimeframeButton.disabled = selectedTimeframeId === undefined;
    syncAvailabilityOutput();
}

function selectAvailabilityDay(day) {
    selectedAvailabilityDay = day;
    selectedTimeframeId = undefined;
    availabilityHelp.textContent = "Click the timeline to add a one-hour timeframe.";
    renderAvailability();
}

for (const button of availabilityDayButtons) {
    button.addEventListener("click", () => {
        selectAvailabilityDay(button.dataset.availabilityDay);
    });
}

availabilityTrack.addEventListener("click", event => {
    if (suppressTimelineClick) {
        suppressTimelineClick = false;
        return;
    }

    if (event.target.closest(".availability-timeframe")) {
        return;
    }

    let start = getMinutesFromPointer(event.clientX);
    start = clamp(start, 0, dayLength - defaultDuration);
    const end = start + defaultDuration;

    if (rangesOverlap(selectedAvailabilityDay, undefined, start, end)) {
        availabilityHelp.textContent = "That timeframe overlaps an existing one.";
        return;
    }

    const timeframe = {
        id: nextTimeframeId++,
        start,
        end
    };

    availability[selectedAvailabilityDay].push(timeframe);
    selectedTimeframeId = timeframe.id;
    availabilityHelp.textContent = `Added ${formatMinutes(start)}–${formatMinutes(end)}.`;
    renderAvailability();
});

availabilityTrack.addEventListener("pointerdown", event => {
    const timeframeElement = event.target.closest(".availability-timeframe");

    if (!timeframeElement || event.button !== 0) {
        return;
    }

    event.preventDefault();

    const timeframeId = Number(timeframeElement.dataset.timeframeId);
    const timeframe = availability[selectedAvailabilityDay]
        .find(item => item.id === timeframeId);
    const resizeHandle = event.target.closest(".availability-resize-handle");

    selectTimeframe(timeframeId);
    suppressTimelineClick = true;
    availabilityTrack.setPointerCapture(event.pointerId);
    activeDrag = {
        pointerId: event.pointerId,
        mode: resizeHandle?.dataset.edge ?? "move",
        originX: event.clientX,
        originStart: timeframe.start,
        originEnd: timeframe.end,
        timeframe,
        timeframeElement
    };
});

availabilityTrack.addEventListener("pointermove", event => {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
        return;
    }

    const trackWidth = availabilityTrack.getBoundingClientRect().width;
    const delta = snapMinutes(((event.clientX - activeDrag.originX) / trackWidth) * dayLength);
    let start = activeDrag.originStart;
    let end = activeDrag.originEnd;

    if (activeDrag.mode === "move") {
        const duration = activeDrag.originEnd - activeDrag.originStart;
        start = clamp(activeDrag.originStart + delta, 0, dayLength - duration);
        end = start + duration;
    } else if (activeDrag.mode === "start") {
        start = clamp(
            activeDrag.originStart + delta,
            0,
            activeDrag.originEnd - minimumDuration
        );
    } else {
        end = clamp(
            activeDrag.originEnd + delta,
            activeDrag.originStart + minimumDuration,
            dayLength
        );
    }

    if (rangesOverlap(selectedAvailabilityDay, activeDrag.timeframe.id, start, end)) {
        return;
    }

    activeDrag.timeframe.start = start;
    activeDrag.timeframe.end = end;
    updateTimeframeElement(activeDrag.timeframeElement, activeDrag.timeframe);
    availabilityHelp.textContent = `${formatMinutes(start)}–${formatMinutes(end)}`;
    syncAvailabilityOutput();
});

function finishAvailabilityDrag(event) {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
        return;
    }

    activeDrag = undefined;
    renderAvailability();
    setTimeout(() => {
        suppressTimelineClick = false;
    }, 0);
}

availabilityTrack.addEventListener("pointerup", finishAvailabilityDrag);
availabilityTrack.addEventListener("pointercancel", finishAvailabilityDrag);

removeTimeframeButton.addEventListener("click", () => {
    if (!selectedAvailabilityDay || selectedTimeframeId === undefined) {
        return;
    }

    availability[selectedAvailabilityDay] = availability[selectedAvailabilityDay]
        .filter(timeframe => timeframe.id !== selectedTimeframeId);
    selectedTimeframeId = undefined;
    availabilityHelp.textContent = "Timeframe removed.";
    renderAvailability();
});

openAvailabilityButton.addEventListener("click", () => {
    availabilitySnapshot = JSON.parse(JSON.stringify(availability));
    selectedAvailabilityDay = undefined;
    selectedTimeframeId = undefined;
    availabilityDialog.returnValue = "";
    renderAvailability();
    availabilityDialog.showModal();
});

availabilityForm.addEventListener("submit", event => {
    if (event.submitter?.value === "confirm") {
        syncAvailabilityOutput();
    }
});

availabilityDialog.addEventListener("close", () => {
    if (availabilityDialog.returnValue !== "confirm" && availabilitySnapshot) {
        for (const day of days) {
            availability[day.value] = availabilitySnapshot[day.value];
        }
    }

    availabilitySnapshot = undefined;
    selectedAvailabilityDay = undefined;
    selectedTimeframeId = undefined;
    renderAvailability();
});

syncAvailabilityOutput();
