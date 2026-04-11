const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { execSync } = require('child_process');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyCqi8UJZhzIKkzaDmoW0EJnk_ev_qFsUhE");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const chatSessions = {};
const DATA_FILE = './vaccine_registrations.json';
// const axios = require('axios');

// --- AUTO-CLEANUP LOGIC ---
try {
    console.log("Cleaning up old sessions and zombie processes...");
    try { execSync('pkill -9 chrome || true'); } catch (e) {}
    try { execSync('pkill -9 chromium || true'); } catch (e) {}
    
    // 2. Delete the corrupted session folder
    // execSync('rm -rf .wwebjs_auth');
    
    console.log("Cleanup complete. Starting browser...");
} catch (error) {
    console.error("Cleanup warning:", error.message);

}

const userState = {}; 
const userLanguage = {};  



LANGUAGES = {
    "1": {"code": "en", "name": "English"},
    "2": {"code": "hi", "name": "हिन्दी"},
    "3": {"code": "ta", "name": "தமிழ்"},
    "4": {"code": "or", "name": "ଓଡ଼ିଆ"},
    "5": {"code": "pa", "name": "ਪੰਜਾਬੀ"},
    "6": {"code": "bn", "name": "বাংলা"},
    "7": {"code": "mr", "name": "मराठी"},
    "8": {"code": "gu", "name": "ગુજરાતી"},
    "9": {"code": "kn", "name": "ಕನ್ನಡ"},
    "10": {"code": "as", "name": "অসমীয়া"}
}

LANGUAGE_PROMPTS = {
    "en": "1 Send 1 to converse in English",
    "hi": "2 भेजें हिन्दी में बात करने के लिए",
    "ta": "3 ஐ அனுப்பவும் தமிழில் பேச",
    "or": "4 ପଠାନ୍ତୁ ଓଡ଼ିଆରେ କଥା ହେବାକୁ",
    "pa": "5 ਭੇਜੋ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਨ ਲਈ",
    "bn": "6 পাঠান বাংলায় কথা বলার জন্য",
    "mr": "7 पाठवा मराठीत बोलण्यासाठी",
    "gu": "8 મોકલો ગુજરાતીમાં વાત કરવા માટે",
    "kn": "9 ಕಳುಹಿಸಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು",
    "as": "10 পঠিয়াওক অসমীয়াত কথা বলিবলৈ"
}

const INTRO_MESSAGES = {
    "en": "🌸 *Hello!* I'm your health assistant 🤗.\nI can give wellness tips, home remedies, and guide you to nearby hospitals.\n\n📌 *add-vaccine* - Register child\n",
    
    "hi": "🌸 *नमस्ते!* मैं आपका स्वास्थ्य सहायक हूँ 🤗।\nमैं आपको स्वास्थ्य सुझाव, घरेलू उपाय और पास के अस्पताल की जानकारी दे सकता हूँ।\n\n📌 *add-vaccine* - बच्चे का पंजीकरण करें\n",
    
    "ta": "🌸 *வணக்கம்!* நான் உங்கள் ஆரோக்கிய உதவியாளர் 🤗.\nநலக்குறிப்புகள் மற்றும் அருகிலுள்ள மருத்துவமனை தகவல்களை நான் வழங்க முடியும்.\n\n📌 *add-vaccine* - குழந்தையை பதிவு செய்ய\n ",
    
    "or": "🌸 *ନମସ୍କାର!* ମୁଁ ଆପଣଙ୍କର ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ 🤗।\nମୁଁ ଆପଣଙ୍କୁ ସ୍ୱାସ୍ଥ୍ୟ ପରାମର୍ଶ ଏବଂ ନିକଟସ୍ଥ ହସ୍ପିଟାଲ୍ ସମ୍ପର୍କରେ ସୂଚନା ଦେଇପାରିବି।\n\n📌 *add-vaccine* - ପିଲାଙ୍କୁ ପଞ୍ଜିକୃତ କରନ୍ତୁ\n ",
    
    "pa": "🌸 *ਸਤ ਸ੍ਰੀ ਅਕਾਲ!* ਮੈਂ ਤੁਹਾਡਾ ਸਿਹਤ ਸਹਾਇਕ ਹਾਂ 🤗।\nਮੈਂ ਤੁਹਾਨੂੰ ਤੰਦਰੁਸਤੀ ਦੇ ਸੁਝਾਅ ਅਤੇ ਨੇੜਲੇ ਹਸਪਤਾਲਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਦੇ ਸਕਦਾ ਹਾਂ।\n\n📌 *add-vaccine* - ਬੱਚੇ ਨੂੰ ਰਜਿਸਟਰ ਕਰੋ\n ",
    
    "bn": "🌸 *হ্যালো!* আমি আপনার স্বাস্থ্য সহকারী 🤗।\nআমি আপনাকে সুস্থতার পরামর্শ এবং নিকটস্থ হাসপাতাল সম্পর্কে তথ্য দিতে পারি।\n\n📌 *add-vaccine* - শিশুর নাম নথিভুক্ত করুন\n ",
    
    "mr": "🌸 *नमस्कार!* मी तुमचा आरोग्य सहाय्यक आहे 🤗।\nमी तुम्हाला आरोग्य सल्ला आणि जवळच्या हॉस्पिटल्सची माहिती देऊ शकतो।\n\n📌 *add-vaccine* - मुलाची नोंदणी करा\n",
    
    "gu": "🌸 *નમસ્તે!* હું તમારો આરોગ્ય સહાયક છું 🤗।\nહું તમને વેલનેસ ટિપ્સ અને નજીકની હસ્પિટલની માહિતી આપી શકું છું।\n\n📌 *add-vaccine* - બાળકની નોંધણી કરો\n📅 *show-vaccine* - રસીકરણની તારીખ જુઓ",
    
    "kn": "🌸 *ನಮಸ್ಕಾರ!* ನಾನು ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕ 🤗.\nನಾನು ನಿಮಗೆ ಆರೋಗ್ಯ ಸಲಹೆಗಳು ಮತ್ತು ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ.\n\n📌 *add-vaccine* - ಮಗುವನ್ನು ನೋಂದಾಯಿಸಿ\n",
    
    "as": "🌸 *নমস্কাৰ!* মই আপোনাৰ স্বাস্থ্য সহায়ক 🤗।\nমই আপোনাক স্বাস্থ্য পৰামৰ্শ আৰু ওচৰৰ হাস্পতালৰ তথ্য দিব পাৰো।\n\n📌 *add-vaccine* - শিশুটোক পঞ্জীয়ন কৰক\n"
};

async function getVaccineSuggestion(child,location,language) {
    const locationContext = location;
    const prompt = `
        <context>
        User Location: ${locationContext}
        Child Details: DOB: ${child.dob}, Age: ${child.age}
        Current Date: ${new Date().toISOString().split('T')[0]}
        </context>

        <user_input>
        Based on the National Immunization Schedule of India, what vaccines are due for this child? 
        If a location is provided, list 3 nearby government PHCs or hospitals.
        </user_input>
        Always respond in ${language}`
        ;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        return response.trim();
    } catch (error) {
        console.error("Vaccine Suggestion Error:", error);
        return "⚠️ Sorry, I couldn't calculate the schedule right now. Please check your local health center.";
    }
}


function saveRegistration(phone, data) {
    let allData = {};
    if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        allData = JSON.parse(fileContent || '{}');
    }
    if (!Array.isArray(allData[phone])) {
        allData[phone] = [];
    }
    allData[phone].push(data);
    fs.writeFileSync(DATA_FILE, JSON.stringify(allData, null, 4));
    console.log(`Added new child for ${phone}. Total children: ${allData[phone].length}`);
}


const axios = require('axios');

async function notifyAsha(payload) {
    console.log(payload)
    const ASHA_DASHBOARD_URL = "http://asha_dashboard:5000/alert"; 
    try {
        const response = await axios.post(ASHA_DASHBOARD_URL, payload, { timeout: 8000 });
        console.log(`ASHA dashboard notify status: ${response.status}`);
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        console.error(`ASHA dashboard notify error: ${error.message}`);
        return false;
    }
}



const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // Set to false so you can verify the bubble is gone
        handleSIGINT: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            // --- THE FIXES ---
            '--disable-session-crashed-bubble',
            '--disable-infobars',
            '--restore-last-session=false',
            '--disable-blink-features=AutomationControlled' // Helps prevent WA detection
        ],
    }
});
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => { console.log('Health Bot is Online!'); });

client.on('message', async (msg) => {

    // ✅ IGNORE GROUP MESSAGES (ADD HERE)
    if (msg.from.endsWith('@g.us')) {
        return;
    }

    const phone = msg.from;
    const isCommand = msg.body.toLowerCase().includes("healthbot");
    const text = msg.body.trim().replace(/healthbot/gi, '').trim();


//client.on('message', async (msg) => {
  //  const phone = msg.from;
    //const isCommand = msg.body.toLowerCase().includes("healthbot");
    //const text = msg.body.trim().replace(/healthbot/gi, '').trim();

    // Initialize state as an object if it doesn't exist
    if (!userState[phone]) {
        userState[phone] = { status: null, emergencyMessage: null, location : null };
    }

    // --- 1. HANDLE LOCATION (Emergency Step 2) ---
    if (msg.type === 'location') {
        if (userState[phone].status === 'awaiting_vaccine_location') {

            const lat = msg.location.latitude;
            const lng = msg.location.longitude;
            const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        
            const child = userState[phone].childData;
        
            // Save full data
            saveRegistration(phone, {
                name: child.name,
                dob: child.dob,
                age: child.age,
                location: mapsUrl
            });
        
            userState[phone].status = 'default';
        
            // Vaccine Suggestion
            try {
                // FIX: Add 'await' here so vaccineMessage becomes the actual text from Gemini
                let vaccineMessage = await getVaccineSuggestion(child, mapsUrl, userLanguage[phone]);
            
                return msg.reply(vaccineMessage); 
            } catch (error) {
                console.error("Vaccine Flow Error:", error);
                return msg.reply("⚠️ I could not retrieve the vaccine schedule. Please try again or visit your PHC.");
            }
        }
        
        const lat = msg.location.latitude;
        const lng = msg.location.longitude;
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`; // Corrected URL format
        userState[phone].location = mapsUrl;
    
        // CASE A: It was a real emergency alert
        if (userState[phone].status === 'awaiting_location') {
            const payload = {
                phone: phone,
                message: userState[phone].emergencyMessage || "Emergency Alert",
                location: mapsUrl,
                timestamp: new Date().toISOString()
            };
            await notifyAsha(payload); // ONLY calls ASHA here
            userState[phone].status = 'default';
            return msg.reply("🚨 *Emergency alert sent to ASHA.* Help is being notified.");
        }
    
        // CASE B: It was just a hospital search request
        if (userState[phone].status === 'requesting_location_general') {
            userState[phone].status = 'default';
            // We don't call ASHA here. We just prompt them to ask again with the now-saved location.
            return msg.reply("📍 Location saved! Now, ask me again about nearby hospitals and I will list them for you.");
        }
        
        return msg.reply("📍 Location saved for your health recommendations.");
    }

    // --- 2. LANGUAGE SELECTION ---
    if (isCommand || userState[phone].status === 'selecting_lang') {
        if (!userLanguage[phone] && userState[phone].status !== 'selecting_lang') {
            userState[phone].status = 'selecting_lang';
            const flattenedPrompts = Object.values(LANGUAGE_PROMPTS).join('\n');
            return msg.reply(`🌸 *Welcome*\nPlease choose your language (1-10):\n\n${flattenedPrompts}`);
        }

        if (userState[phone].status === 'selecting_lang') {
            if (LANGUAGES[text]) {
                userLanguage[phone] = LANGUAGES[text].code;
                userState[phone].status = 'default';
                return msg.reply(INTRO_MESSAGES[userLanguage[phone]] || INTRO_MESSAGES['en']);
            }
            return msg.reply("❌ Invalid choice. Send a number 1-10.");
        }
    }

    // --- 3. MAIN COMMANDS & AI ---
    if (userLanguage[phone]) {
        
        // Add Vaccine Command
        // Add Vaccine Command
if (text.toLowerCase().includes('add-vaccine')) {
    userState[phone].status = 'awaiting_vaccine_details';
    return msg.reply(
        "👶 Please send child details in this format:\n\nName, YYYY-MM-DD, Age\n\n📍 Then share your live location using WhatsApp location feature."
    );
}

// Step 1: Capture Name, DOB, Age
if (userState[phone].status === 'awaiting_vaccine_details') {
    const details = text.split(',');

    if (details.length >= 3) {
        userState[phone].childData = {
            name: details[0].trim(),
            dob: details[1].trim(),
            age: parseInt(details[2].trim())
        };

        userState[phone].status = 'awaiting_vaccine_location';

        return msg.reply("📍 Please share your live location to find nearby vaccination centers.");
    }

    return msg.reply("❌ Format: Name, YYYY-MM-DD, Age");
}
        // Gemini AI & Emergency Detection
        // --- 3. GEMINI AI LOGIC ---
        if (userLanguage[phone] && userState[phone].status === 'default') {
            try {
                // 1. Ensure the session exists
                if (!chatSessions[phone]) {
                    chatSessions[phone] = model.startChat({
                        history: [{
                            role: "user",
                            parts: [{ text: `System: You are a strict Medical Assistant in India. 

                    ### MEDICAL GUIDELINES:
                    1. **NO PRESCRIPTIONS**: Never suggest specific dosages of medicine (like "Take 500mg of X").
                    2. **HOME REMEDIES**: You ARE allowed to suggest basic, safe, non-medicinal home remedies (e.g., hydration, ginger tea, rest, cold compresses). 
                    3. **DISCLAIMER**: Always include a brief note that you are an AI and they should see a doctor if pain persists.
                            
                    ### PRIORITY RULES:
                    1. **LOCATION SEARCH (HIGHEST PRIORITY)**: If the user asks for "hospitals", "clinics", or "doctors", your ONLY goal is to find them.
                       - IF [User Location Context] is "NULL": You MUST start your response with ONLY the word "LOCATION_REQUIRED" followed by a brief medical warning if the symptoms look bad.
                       - IF [User Location Context] is a URL: Provide 3 real hospital names near that area. Do NOT trigger EMERGENCY_DETECTED if you are giving a hospital list.
                    
                    2. **EMERGENCY ALERTS**: Only trigger "EMERGENCY_DETECTED" if the user describes a crisis (e.g., "I'm dying", "He's not breathing") AND they ARE NOT asking for a hospital list. 
                    
                    3. **CHEST PAIN LOGIC**: 
                       - If they ask: "Hospitals for chest pain" -> Follow Rule 1 (Hospital Search).
                       - If they say: "I have chest pain" (no request for hospital) -> Follow Rule 2 (Emergency Alert).
                    
                    4. **PREGNANCY CARE & ESCALATION**:
                    - **SERIOUS SYMPTOMS**: If a pregnant user mentions "heavy bleeding", "severe abdominal pain", "sudden blurring of vision", or "no baby movement", you MUST start with: EMERGENCY_DETECTED.
                    - **ROUTINE TIPS**: If they ask about diet, morning sickness, or pregnancy phases, give supportive, safe advice (e.g., folic acid, small meals, staying hydrated).

                    Always respond in ${userLanguage[phone]}.` }]
                        }]
                    });
                }

                // --- FIX: Define variables BEFORE using them in finalPrompt ---
                const hasLocation = !!userState[phone].location;
                const locationContext = hasLocation ? userState[phone].location : "NULL";

                // 2. DYNAMIC CONTEXT
                const finalPrompt = `
                    <context>
                    User Location: ${locationContext}
                    </context>

                    <user_input>
                    ${text}
                    </user_input>`;

                let result = await chatSessions[phone].sendMessage(finalPrompt);
                let botResponse = result.response.text();

                // 3. Handle the flags
                
                // CASE A: EMERGENCY (Trigger ASHA Workflow)
                if (botResponse.includes("EMERGENCY_DETECTED")) {
                    userState[phone].status = 'awaiting_location';
                    userState[phone].emergencyMessage = text;
                    return msg.reply(botResponse.replace("EMERGENCY_DETECTED", "").trim() + "\n\n🚨 *Please share your Location now.*");
                }

                // CASE B: HOSPITAL SEARCH (Missing Location)
                if (botResponse.includes("LOCATION_REQUIRED")) {
                    if (!hasLocation) {
                        userState[phone].status = 'requesting_location_general';
                        return msg.reply(botResponse.replace("LOCATION_REQUIRED", "").trim() + "\n\n📍 *Please share your Location* so I can find the nearest facilities.");
                    } else {
                        // We HAVE the location, so just clean the response and show the hospitals
                        botResponse = botResponse.replace("LOCATION_REQUIRED", "").trim();
                    }
                }

                // CASE C: NORMAL RESPONSE
                return msg.reply(botResponse.replace("LOCATION_REQUIRED", "").trim());

            } catch (err) {
                console.error("Gemini Error:", err);
                delete chatSessions[phone];
            }
        }
    }
});
client.initialize();