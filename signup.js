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
    asf: "Australian Sign Language (Auslan)",
    bfi: "British Sign Language",
    cmn: "Mandarin Chinese",
    fil: "Filipino",
    hif: "Fiji Hindi",
    nzs: "New Zealand Sign Language",
    tl: "Tagalog",
    tvl: "Tuvaluan",
    zh: "Chinese (general)"
};

const languageNames = new Intl.DisplayNames(["en"], { type: "language" });
const languageSelect = document.querySelector("#languages");

const languageOptions = languageCodes
    .map(code => ({
        value: code,
        label: languageLabelOverrides[code] ?? languageNames.of(code)
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "en"));

languageOptions.push({ value: "other", label: "Other" });

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

const year12Subjects = data.subjects.filter(subject =>
    subject.years.includes(12)
);

console.log(data);
