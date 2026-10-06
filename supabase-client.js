//Supabase Info
const SUPABASE_URL = "https://kaqixbkbuydypmcsxdcx.supabase.co";
const SUPABASE_KEY = "sb_publishable_kiDnk-ZurC_g0KrN7Imc2g_kffMSuJu";

//Create Client
const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


//Add Data func
async function addTutorData() {

    //Add to database and check for error
    const { error: insertError } = await db
        .from("Tutors")
        .insert({
            name: "h",
            language: ["japanese", "english"],
            subject: ["eng", "mat"],
            year: [13],
            availability: [
                { day: "monday", start: "02:00", end: "04:00" },
                { day: "monday", start: "13:00", end: "14:00" }
            ]
        });

    if (insertError) {
        console.error("INSERT FAILED:", insertError);
        return;
    }

    console.log("Inserted!");

    //Fetch data and check for error
    const { data, error: selectError } = await db
        .from("Tutors")
        .select("*");

    if (selectError) {
        console.error("SELECT FAILED:", selectError);
        return;
    }

    console.log(data);
}

// addTutorData();