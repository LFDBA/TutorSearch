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
