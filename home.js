//Find the AI-image switch and every image identified as AI-generated
const aiImageToggle = document.querySelector(".ai-image-toggle");
const aiImages = document.querySelectorAll("[data-ai-image]");

//Keep the visitor's AI-image preference between page visits
const savedAiImagePreference = localStorage.getItem("showAiImages");
let showAiImages = savedAiImagePreference !== "false";

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
