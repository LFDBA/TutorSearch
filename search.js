import { fetchTutorData } from './supabase-client.js';
import { getProfile } from './main.js';


const searchTutorsButton = document.querySelector("#search-tutors");

const tutors = await fetchTutorData();

console.log(tutors);

searchTutorsButton.addEventListener("click", () => {
    console.log(getProfile());
});
