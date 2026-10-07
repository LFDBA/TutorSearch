//Show the currently stored tutors while search development is in progress
console.log(JSON.parse(localStorage.getItem("tutors")));

//Subject popup elements
const dialog = document.querySelector("#subjects-dialog");
const subjectsForm = document.querySelector("#subjects-form");
const openSubjectsButton = document.querySelector("#open-subjects");
const yearInputs = [...document.querySelectorAll('input[name="year"]')];
const subjectSelect = document.querySelector("#subjects");
const subjectHelp = document.querySelector("#subject-help");
const subjectSummary = document.querySelector("#subject-summary");

//Subject popup state
let dialogSnapshot;
let subjectChoices;

//Make the subject select searchable and multi-choice
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

//Fetch subject data
const subjectDataPromise = fetch("./subjects.json").then(response => response.json());

//Get the selected year groups as numbers
function getSelectedYears() {
    return yearInputs
        .filter(input => input.checked)
        .map(input => Number(input.value));
}

//Get the selected subject and year values
function getSelectedSubjectValues() {
    return [...subjectSelect.selectedOptions].map(option => option.value);
}

//Show the current subject selection below the button
function updateSubjectSummary() {
    const selectedSubjects = [...subjectSelect.selectedOptions]
        .map(option => option.textContent);

    subjectSummary.textContent = selectedSubjects.length
        ? `${selectedSubjects.length} selected: ${selectedSubjects.join(", ")}`
        : "No subjects selected.";
}

//Build year-specific subject options using the selected year groups
async function updateSubjectChoices(selectedSubjectValues = getSelectedSubjectValues()) {
    const data = await subjectDataPromise;
    const selectedYears = getSelectedYears();
    const courseOptions = selectedYears
        .flatMap(year => data.subjects
            .filter(subject => subject.years.includes(year))
            .map(subject => ({
                subjectId: subject.id,
                subjectName: subject.name,
                year,
                value: `${subject.id}--year-${year}`,
                label: `${subject.name} (yr ${year})`
            })))
        .sort((a, b) =>
            a.subjectName.localeCompare(b.subjectName, "en") || a.year - b.year
        );
    const availableCourseValues = new Set(courseOptions.map(course => course.value));
    const retainedSubjectValues = new Set(
        selectedSubjectValues.filter(value => availableCourseValues.has(value))
    );
    const choices = courseOptions.map(course => ({
        value: course.value,
        label: course.label,
        selected: retainedSubjectValues.has(course.value),
        customProperties: {
            subjectId: course.subjectId,
            year: course.year
        }
    }));
    const hasSelectedYears = selectedYears.length > 0;

    //Update the Choices.js dropdown when it is available
    if (subjectChoices) {
        await subjectChoices.setChoices(choices, "value", "label", true, true, true);

        if (hasSelectedYears) {
            subjectChoices.enable();
        } else {
            subjectChoices.disable();
        }
    } else {
        //Fall back to a normal multiple select
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
        ? `Showing ${courseOptions.length} course options for ${selectedYears.length === 1 ? "Year" : "Years"} ${selectedYears.join(", ")}.`
        : "Select at least one year group first.";

    updateSubjectSummary();
}

//Refresh subjects whenever a year changes
for (const yearInput of yearInputs) {
    yearInput.addEventListener("change", () => updateSubjectChoices());
}

//Refresh the subject summary whenever a subject changes
subjectSelect.addEventListener("change", updateSubjectSummary);

//Save the current selection and open the subject popup
openSubjectsButton.addEventListener("click", () => {
    dialogSnapshot = {
        years: getSelectedYears(),
        subjects: getSelectedSubjectValues()
    };
    dialog.returnValue = "";
    dialog.showModal();

    if (dialogSnapshot.years.length === 0) {
        yearInputs[0].focus();
    }
});

//Require at least one year and one subject before confirming
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

    if (getSelectedSubjectValues().length === 0) {
        event.preventDefault();
        subjectHelp.textContent = "Choose at least one subject.";

        if (subjectChoices) {
            subjectChoices.showDropdown();
        } else {
            subjectSelect.focus();
        }
    }
});

//Restore the previous selection when the popup is cancelled
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

//Set the initial subject state
updateSubjectChoices();
