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

const year12Subjects = data.subjects.filter(subject =>
    subject.years.includes(12)
);

console.log(data);
