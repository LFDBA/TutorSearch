//Supabase Info
const SUPABASE_URL = "https://kaqixbkbuydypmcsxdcx.supabase.co";
const SUPABASE_KEY = "sb_publishable_kiDnk-ZurC_g0KrN7Imc2g_kffMSuJu";

//Create Client
const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


//Add Data func
export async function addTutorData(tutor) {

    //Add to database and check for error
    const { error: insertError } = await db
        .from("Tutors")
        .insert({

            name: tutor.name,
            language: tutor.languages,
            subject: tutor.subjects,
            availability: tutor.availability,
            email: tutor.email,
            profile_picture: tutor.profilePicture,
            profile_initial: tutor.profileInitial
        });

    if (insertError) {
        console.error("INSERT FAILED:", insertError);
        return false;
    }

    return true;
}


//Fetch Data func, with an optional row limit for smaller page previews
export async function fetchTutorData(limit) {
    let query = db
        .from("Tutors")
        .select("*");

    if (Number.isInteger(limit) && limit > 0) {
        query = query.limit(limit);
    }

    //Fetch data and check for error
    const { data, error: selectError } = await query;

    if (selectError) {
        console.error("SELECT FAILED:", selectError);
        return;
    }

    return data;
}
