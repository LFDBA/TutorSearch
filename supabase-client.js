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
            email: tutor.email
        });

    if (insertError) {
        console.error("INSERT FAILED:", insertError);
        return;
    }

    console.log("Inserted!");
}


//Fetch Data func
export async function fetchTutorData() {
    //Fetch data and check for error
    const { data, error: selectError } = await db
        .from("Tutors")
        .select("*");

    if (selectError) {
        console.error("SELECT FAILED:", selectError);
        return;
    }

    return data;
}