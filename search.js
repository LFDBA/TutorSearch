import { fetchTutorData } from './supabase-client.js';
import { getProfile } from './main.js';


const searchTutorsButton = document.querySelector("#search-tutors");

const tutors = await fetchTutorData();

searchTutorsButton.addEventListener("click", () => {
    const profile = getProfile()
});

function searchForMatch(){

}
