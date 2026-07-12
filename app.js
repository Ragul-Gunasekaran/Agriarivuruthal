/* app.js - Agriarivuruthal Core Logic, Database persistance, and Visual widgets */

// Global State
const state = {
  lang: 'en', // 'en' or 'ta'
  theme: 'light',
  geminiKey: localStorage.getItem('gemini_api_key') || '',
  activeTab: 'tab-crop',
  selectedDistrict: 'thanjavur',
  weatherData: {
    temp: 31,
    humidity: 65,
    rain: 10,
    wind: 12
  },
  chatHistory: [],
  dbInitialized: false
};

// Translations Dictionary
const translations = {
  en: {
    'lbl-app-title': 'Agriarivuruthal',
    'lbl-app-subtitle': 'Smart Crop Advisory',
    'lbl-status-online': 'Online Advisory',
    'lbl-select-region': 'Region:',
    'lbl-temp': 'Temperature',
    'lbl-humidity': 'Humidity',
    'lbl-rain': 'Rain Probability',
    'lbl-wind': 'Wind Speed',
    'lbl-tab-crop-title': 'Crop Recommendation',
    'lbl-tab-fert-title': 'Fertilizer Calculator',
    'lbl-tab-pests-title': 'Pest & Disease Guide',
    'lbl-tab-calendar-title': 'Farm Calendar',
    'lbl-pest-crop-filter': 'Filter by Affected Crop',
    'lbl-soil-type': 'Soil Type',
    'lbl-water-availability': 'Water Availability',
    'lbl-season': 'Current Season',
    'btn-submit-crop': 'Get Recommendations',
    'lbl-crop-results-title': 'Recommended Crops',
    'lbl-select-crop': 'Select Target Crop',
    'lbl-soil-n': 'Soil Nitrogen (N) Level',
    'lbl-soil-p': 'Soil Phosphorus (P) Level',
    'lbl-soil-k': 'Soil Potassium (K) Level',
    'btn-submit-fertilizer': 'Calculate Fertilizer Needs',
    'lbl-fertilizer-results-title': 'Fertilizer Dose (per Acre)',
    'lbl-npk-ratio': 'NPK Target Requirement (kg/Acre)',
    'lbl-settings-modal-title': 'AI Chatbot Configurations',
    'lbl-settings-desc': 'By default, Agriarivuruthal uses a high-fidelity local agricultural intelligence database. You can paste your Gemini API Key below to unlock real-time custom Gemini AI consulting.',
    'lbl-gemini-key': 'Gemini API Key',
    'lbl-key-active': 'Gemini API Connection Active',
    'btn-clear-settings': 'Clear Key',
    'btn-save-settings': 'Save Settings',
    'chat-placeholder': 'Ask about crops, fertilizer, pests...',
    'welcome-msg': 'Hello! I am Agriarivuruthal, your personal agricultural AI advisor. Choose a quick action below or type your question. I can help you with crop choices, soil health, fertilizer dosages, pest management, or planning your calendar!',
    'bot-sender': 'Agriarivuruthal AI',
    'user-sender': 'Farmer',
    'txt-soil-clayey': 'Clayey Soil',
    'txt-soil-loamy': 'Loamy Soil',
    'txt-soil-sandy': 'Sandy Soil',
    'txt-soil-alluvial': 'Alluvial Soil',
    'txt-water-high': 'High Water (Canal Irrigation)',
    'txt-water-medium': 'Medium Water (Borewell/Well)',
    'txt-water-low': 'Low Water (Rainfed/Arid)',
    'txt-season-kharif': 'Kuruvai / Kharif (June - Sep)',
    'txt-season-rabi': 'Thaladi / Rabi (Oct - Jan)',
    'txt-season-zaid': 'Navarai / Summer (Feb - May)',
    'txt-fertilizer-urea': 'Urea (46% N)',
    'txt-fertilizer-ssp': 'Single Super Phosphate (16% P2O5)',
    'txt-fertilizer-mop': 'Muriate of Potash (60% K2O)',
    'txt-fertilizer-organic': 'Organic Farmyard Manure',
    'txt-nitrogen': 'Nitrogen (N)',
    'txt-phosphorus': 'Phosphorus (P)',
    'txt-potassium': 'Potassium (K)',
    'txt-bags': 'bags',
    'txt-no-crops-found': 'No crops matched your exact combination. Try broadening your soil or water settings!',
    'txt-crop-details-duration': 'Duration',
    'txt-crop-details-yield': 'Est. Yield',
    'txt-crop-details-ph': 'Optimal pH',
    'txt-crop-details-water': 'Water Need',
    'txt-get-guide': 'Get Fertilizer Guide',
    'txt-soil-level-low': 'Low (Deficient)',
    'txt-soil-level-medium': 'Medium (Optimal)',
    'txt-soil-level-high': 'High (Rich)',
    'txt-ph-indicator-label': 'Soil pH Suitability',
    'txt-symptoms': 'Symptoms',
    'txt-control-organic': 'Organic Solution',
    'txt-control-chemical': 'Chemical Solution',
    'txt-pest-no-results': 'No diseases cataloged for the selected crop filter.',
    'lbl-field-profiles-title': 'Saved Field Soil Profiles',
    'lbl-field-name-input': 'Save current settings as Field Profile:',
    'btn-save-field': 'Save Field',
    'lbl-calendar-desc': 'Plan and track your crop schedule offline. Start a new cycle from the Crop Recommendation cards below, and manage your tasks checklist here.'
  },
  ta: {
    'lbl-app-title': 'அக்ரி அறிவிறுத்தல்',
    'lbl-app-subtitle': 'நுண்ணறிவு பயிர் ஆலோசகர்',
    'lbl-status-online': 'நேரடி ஆலோசகர்',
    'lbl-select-region': 'மண்டலம்:',
    'lbl-temp': 'வெப்பநிலை',
    'lbl-humidity': 'ஈரப்பதம்',
    'lbl-rain': 'மழை வாய்ப்பு',
    'lbl-wind': 'காற்றின் வேகம்',
    'lbl-tab-crop-title': 'பயிர் பரிந்துரை',
    'lbl-tab-fert-title': 'உரம் கணக்கிடுவான்',
    'lbl-tab-pests-title': 'பயிர் நோய் கையேடு',
    'lbl-tab-calendar-title': 'பண்ணை நாட்காட்டி',
    'lbl-pest-crop-filter': 'பயிர் வாரி வடிக்கட்டி',
    'lbl-soil-type': 'மண் வகை',
    'lbl-water-availability': 'நீர் ஆதாரம்',
    'lbl-season': 'தற்போதைய பருவம்',
    'btn-submit-crop': 'பரிந்துரைகளைப் பெறுங்கள்',
    'lbl-crop-results-title': 'பரிந்துரைக்கப்பட்ட பயிர்கள்',
    'lbl-select-crop': 'இலக்கு பயிரைத் தேர்ந்தெடுக்கவும்',
    'lbl-soil-n': 'மண் நைட்ரஜன் (N) அளவு',
    'lbl-soil-p': 'மண் பாஸ்பரஸ் (P) அளவு',
    'lbl-soil-k': 'மண் பொட்டாசியம் (K) அளவு',
    'btn-submit-fertilizer': 'உரம் தேவையை கணக்கிடுக',
    'lbl-fertilizer-results-title': 'உர அளவு (ஏக்கருக்கு)',
    'lbl-npk-ratio': 'NPK இலக்கு தேவை (கிலோ/ஏக்கர்)',
    'lbl-settings-modal-title': 'AI அரட்டை கட்டமைப்பு',
    'lbl-settings-desc': 'முன்னிருப்பாக, அக்ரி அறிவிறுத்தல் உள்ளூர் விவசாய தகவல் தரவுத்தளத்தைப் பயன்படுத்துகிறது. நேரடி ஜெமினி AI ஆலோசனையைப் பெற உங்கள் ஜெமினி API விசையை கீழே உள்ளிடவும்.',
    'lbl-gemini-key': 'ஜெமினி API விசை (Gemini API Key)',
    'lbl-key-active': 'ஜெமினி AI இணைப்பு செயலில் உள்ளது',
    'btn-clear-settings': 'விசையை நீக்கு',
    'btn-save-settings': 'அமைப்பை சேமி',
    'chat-placeholder': 'பயிர்கள், உரம், பூச்சிகள் பற்றி கேளுங்கள்...',
    'welcome-msg': 'வணக்கம்! நான் உங்கள் அக்ரி அறிவிறுத்தல் AI ஆலோசகர். கீழே உள்ள ஏதேனும் ஒரு கேள்வியைக் கிளிக் செய்யவும் அல்லது உங்கள் சொந்த கேள்வியைத் தட்டச்சு செய்யவும். பயிர் தேர்வு, மண் வளம், உர அளவுகள், பூச்சி மேலாண்மை அல்லது சாகுபடி நாட்காட்டியைத் திட்டமிட நான் உங்களுக்கு உதவுகிறேன்!',
    'bot-sender': 'அக்ரி அறிவிறுத்தல் AI',
    'user-sender': 'விவசாயி',
    'txt-soil-clayey': 'களிமண்',
    'txt-soil-loamy': 'வண்டல் மண்',
    'txt-soil-sandy': 'மணல் மண்',
    'txt-soil-alluvial': 'ஆற்று வண்டல் மண்',
    'txt-water-high': 'அதிக நீர் (கால்வாய் பாசனம்)',
    'txt-water-medium': 'மத்தியம நீர் (கிணறு/ஆழ்துளை கிணறு)',
    'txt-water-low': 'குறைந்த நீர் (மானாவாரி/வறண்ட நிலம்)',
    'txt-season-kharif': 'குறுவை / காரிஃப் (ஜூன் - செப்)',
    'txt-season-rabi': 'தாளடி / ரபி (அக்டோபர் - ஜனவரி)',
    'txt-season-zaid': 'நவரைய் / கோடை (பிப்ரவரி - மே)',
    'txt-fertilizer-urea': 'யூரியா (46% N)',
    'txt-fertilizer-ssp': 'சூப்பர் பாஸ்பேட் (16% P2O5)',
    'txt-fertilizer-mop': 'பொட்டாஷ் (60% K2O)',
    'txt-fertilizer-organic': 'மட்கிய தொழு உரம் (தழைச்சத்து)',
    'txt-nitrogen': 'நைட்ரஜன் (N)',
    'txt-phosphorus': 'பாஸ்பரஸ் (P)',
    'txt-potassium': 'பொட்டாசியம் (K)',
    'txt-bags': 'மூட்டைகள்',
    'txt-no-crops-found': 'இந்த மண் மற்றும் நீர் அளவிற்கு ஏற்ற பயிர்கள் ஏதும் கிடைக்கவில்லை. வேறு அமைப்புகளை தேர்வு செய்யவும்!',
    'txt-crop-details-duration': 'காலம்',
    'txt-crop-details-yield': 'எதிர்பார்க்கும் மகசூல்',
    'txt-crop-details-ph': 'சரியான pH அளவு',
    'txt-crop-details-water': 'நீர் தேவை',
    'txt-get-guide': 'உர வழிகாட்டுதலைப் பெறுக',
    'txt-soil-level-low': 'குறைவு (சத்து பற்றாக்குறை)',
    'txt-soil-level-medium': 'மத்தியமம் (மிதமான சத்து)',
    'txt-soil-level-high': 'அதிகம் (நிறைவான சத்து)',
    'txt-ph-indicator-label': 'மண்ணின் pH தகுதி',
    'txt-symptoms': 'அறிகுறிகள்',
    'txt-control-organic': 'இயற்கை தீர்வு',
    'txt-control-chemical': 'இரசாயன தீர்வு',
    'txt-pest-no-results': 'தேர்வு செய்யப்பட்ட பயிருக்கு நோய்கள் ஏதும் பட்டியல் இடப்படவில்லை.',
    'lbl-field-profiles-title': 'சேமிக்கப்பட்ட நிலங்கள்',
    'lbl-field-name-input': 'தற்போதைய அளவுகளை புதிய நிலமாக சேமிக்கவும்:',
    'btn-save-field': 'நிலத்தை சேமி',
    'lbl-calendar-desc': 'உங்கள் பயிர் சாகுபடி காலத்தை திட்டமிட்டு ஆஃப்லைனில் கண்காணியுங்கள். கீழே உள்ள பயிர் பரிந்துரை கார்டுகளில் புதிய சாகுபடியைத் தொடங்கி, இங்கே உங்கள் பணிகளை சரிபார்க்கவும்.'
  }
};

// District Weather Bases
const districtBases = {
  thanjavur: { temp: 31, humidity: 72, rain: 20, wind: 10, nameEn: 'Thanjavur (Delta)', nameTa: 'தஞ்சாவூர் (டெல்டா)' },
  coimbatore: { temp: 28, humidity: 55, rain: 15, wind: 14, nameEn: 'Coimbatore (Semi-Arid)', nameTa: 'கோயம்புத்தூர் (மித வறட்சி)' },
  madurai: { temp: 35, humidity: 45, rain: 5, wind: 8, nameEn: 'Madurai (Dry Zone)', nameTa: 'மதுரை (வறண்ட மண்டலம்)' },
  nilgiris: { temp: 16, humidity: 85, rain: 60, wind: 22, nameEn: 'Nilgiris (Hilly/Wet)', nameTa: 'நீலகிரி (மலைப்பாங்கான பகுதி)' },
  chennai: { temp: 33, humidity: 78, rain: 30, wind: 16, nameEn: 'Chennai (Coastal)', nameTa: 'சென்னை (கடலோர பகுதி)' }
};

// Crop Knowledge Base
const cropDatabase = [
  {
    id: 'paddy',
    name: { en: 'Paddy (Nel)', ta: 'நெல் (Paddy)' },
    soil: ['clayey', 'loamy', 'alluvial'],
    water: 'high',
    season: ['kharif', 'rabi'],
    duration: { en: '110 - 135 days', ta: '110 - 135 நாட்கள்' },
    yield: { en: '2.5 - 3.0 tons / Acre', ta: '2.5 - 3.0 டன் / ஏக்கர்' },
    ph: '6.0 - 7.0',
    notes: {
      en: 'Requires constant standing water during the vegetative phase. Nitrogen splits are highly recommended at transplanting, tillering, and panicle initiation phases.',
      ta: 'வளர்ச்சி கட்டத்தில் தொடர்ந்து தேங்கி நிற்கும் நீர் தேவை. நாற்று நடவு, தூர்கள் பிடிக்கும் தருணம் மற்றும் கதிர் வரும் தருணங்களில் நைட்ரஜன் உரங்களை பிரித்து இடுவது அவசியம்.'
    }
  },
  {
    id: 'sugarcane',
    name: { en: 'Sugarcane', ta: 'கரும்பு (Sugarcane)' },
    soil: ['clayey', 'loamy', 'alluvial'],
    water: 'high',
    season: ['kharif'],
    duration: { en: '10 - 12 months', ta: '10 - 12 மாதங்கள்' },
    yield: { en: '40 - 50 tons / Acre', ta: '40 - 50 டன் / ஏக்கர்' },
    ph: '6.5 - 7.5',
    notes: {
      en: 'Long duration crop. Requires deep soils with good water-holding capacity. Maintain optimal irrigation throughout the tillering phase.',
      ta: 'நீண்ட கால பயிர். நல்ல நீர் தேக்கும் திறன் கொண்ட ஆழமான மண் தேவை. தூர்கள் வெடிக்கும் பருவம் முழுவதும் தடையற்ற நீர் பாசனம் அவசியம்.'
    }
  },
  {
    id: 'groundnut',
    name: { en: 'Groundnut', ta: 'நிலக்கடலை (Groundnut)' },
    soil: ['sandy', 'loamy'],
    water: 'medium',
    season: ['kharif', 'zaid'],
    duration: { en: '105 - 115 days', ta: '105 - 115 நாட்கள்' },
    yield: { en: '1.0 - 1.2 tons / Acre', ta: '1.0 - 1.2 டன் / ஏக்கர்' },
    ph: '6.0 - 6.5',
    notes: {
      en: 'Prefers loose, sandy loam soil for peg penetration. Calcium is essential (apply Gypsum at pegging stage, around 45 days after sowing).',
      ta: 'நிலக்கடலை விழுதுகள் எளிதில் மண்ணிற்குள் செல்ல தளர்வான மணல் கலந்த வண்டல் மண் சிறந்தது. சுண்ணாம்பு சத்து மிகவும் அவசியம் (விதைத்த 45 நாட்களில் ஜிப்சம் இடுக).'
    }
  },
  {
    id: 'cotton',
    name: { en: 'Cotton', ta: 'பருத்தி (Cotton)' },
    soil: ['clayey', 'alluvial', 'loamy'],
    water: 'medium',
    season: ['kharif', 'rabi'],
    duration: { en: '150 - 180 days', ta: '150 - 180 நாட்கள்' },
    yield: { en: '0.8 - 1.2 tons / Acre', ta: '0.8 - 1.2 டன் / ஏக்கர்' },
    ph: '6.0 - 8.0',
    notes: {
      en: 'Thrives in black cotton soils. Avoid irrigation during boll opening stage. Watch out for Bollworm pest attacks.',
      ta: 'கரிசல் மண்ணில் செழித்து வளரும். பருத்தி வெடிக்கும் தருணத்தில் நீர் பாசனத்தைத் தவிர்க்கவும். காய்ப்புழு தாக்குதல்களைக் கண்காணிக்கவும்.'
    }
  },
  {
    id: 'maize',
    name: { en: 'Maize (Corn)', ta: 'சோளம் (Maize)' },
    soil: ['loamy', 'alluvial', 'sandy'],
    water: 'medium',
    season: ['kharif', 'rabi', 'zaid'],
    duration: { en: '90 - 110 days', ta: '90 - 110 நாட்கள்' },
    yield: { en: '2.0 - 2.5 tons / Acre', ta: '2.0 - 2.5 டன் / ஏக்கர்' },
    ph: '5.5 - 7.5',
    notes: {
      en: 'Requires good soil drainage as waterlogging causes crop damage. Highly responsive to nitrogen fertilizers.',
      ta: 'தேங்கி நிற்கும் நீர் பயிரை பாதிக்கும் என்பதால் நல்ல வடிகால் வசதி தேவை. தழைச்சத்து (நைட்ரஜன்) உரங்களுக்கு நல்ல பலன் தரும்.'
    }
  },
  {
    id: 'ragi',
    name: { en: 'Finger Millet (Ragi)', ta: 'கேழ்வரகு (Ragi)' },
    soil: ['loamy', 'sandy'],
    water: 'low',
    season: ['kharif', 'rabi'],
    duration: { en: '100 - 120 days', ta: '100 - 120 நாட்கள்' },
    yield: { en: '1.2 - 1.5 tons / Acre', ta: '1.2 - 1.5 டன் / ஏக்கர்' },
    ph: '5.0 - 8.2',
    notes: {
      en: 'Highly drought-resistant crop. Ideal for low rain conditions. Rich in calcium and iron.',
      ta: 'வறட்சியைத் தாங்கக்கூடிய பயிர். குறைந்த மழைப்பொழிவு உள்ள பகுதிகளுக்கு உகந்தது. கால்சியம் மற்றும் இரும்புச்சத்து அதிகம் நிறைந்தது.'
    }
  },
  {
    id: 'tomato',
    name: { en: 'Tomato', ta: 'தக்காளி (Tomato)' },
    soil: ['loamy', 'sandy', 'alluvial'],
    water: 'medium',
    season: ['zaid', 'rabi'],
    duration: { en: '110 - 120 days', ta: '110 - 120 நாட்கள்' },
    yield: { en: '10 - 12 tons / Acre', ta: '10 - 12 டன் / ஏக்கர்' },
    ph: '6.0 - 7.0',
    notes: {
      en: 'Requires regular watering but no waterlogging. Pruning and staking help prevent diseases and support fruit weight.',
      ta: 'தவறாமல் நீர் பாய்ச்ச வேண்டும், ஆனால் நீர் தேங்கக்கூடாது. இலைகளை கவாத்து செய்வதும், குச்சிகள் நட்டு முட்டுக் கொடுப்பதும் நோய்களை தடுத்து பழங்களை தாங்கும்.'
    }
  },
  {
    id: 'banana',
    name: { en: 'Banana', ta: 'வாழை (Banana)' },
    soil: ['alluvial', 'loamy', 'clayey'],
    water: 'high',
    season: ['kharif', 'zaid'],
    duration: { en: '11 - 12 months', ta: '11 - 12 மாதங்கள்' },
    yield: { en: '15 - 20 tons / Acre', ta: '15 - 20 டன் / ஏக்கர்' },
    ph: '6.0 - 8.0',
    notes: {
      en: 'Requires massive potassium feeding. Highly vulnerable to strong winds; prop crops with bamboo structures if winds exceed 15 km/h.',
      ta: 'அதிக சாம்பல் சத்து (பொட்டாசியம்) தேவைப்படும். பலத்த காற்றினால் எளிதில் சேதமடையும்; காற்றின் வேகம் 15 கிமீ-க்கு மேல் இருந்தால் மூங்கில் கம்புகளால் முட்டுக் கொடுக்கவும்.'
    }
  }
];

// Fertilizer NPK Base Recommendations (kg/Acre)
const fertilizerNPKGuides = {
  paddy: { n: 120, p: 60, k: 60 },
  sugarcane: { n: 275, p: 60, k: 120 },
  groundnut: { n: 25, p: 50, k: 75 },
  maize: { n: 135, p: 62.5, k: 50 },
  cotton: { n: 80, p: 40, k: 40 }
};

// Crop Task Templates for Calendar Scheduling
const cropTaskTemplates = {
  paddy: [
    { dayOffset: 0, title: { en: 'Sow Seeds & Apply Basal', ta: 'விதைப்பு மற்றும் அடி உரமிடல்' }, advice: { en: 'Sow seeds. Apply SSP (100% of ssp bags) and MOP (50% of mop bags) as basal fertilizer.', ta: 'நெல் விதைப்பு செய்யவும். அடி உரமாக சூப்பர் பாஸ்பேட் (SSP) முழு அளவையும், பொட்டாஷ் (MOP) பாதி அளவையும் இடவும்.' } },
    { dayOffset: 20, title: { en: 'Weed Control', ta: 'களை மேலாண்மை (20-ஆம் நாள்)' }, advice: { en: 'Perform manual weeding or apply selective paddy pre-emergence herbicide.', ta: 'முளையடித்த களைக்கொல்லி தெளிக்கவும் அல்லது கைகளால் களைகளை எடுக்கவும்.' } },
    { dayOffset: 25, title: { en: 'First Top Dressing (Urea)', ta: 'முதற்கட்ட மேலுரம் (25-ஆம் நாள்)' }, advice: { en: 'Apply 50% of Urea dose split. Maintain shallow standing water (2cm).', ta: 'பாதி அளவு யூரியாவை இடவும். வயலில் 2 செமீ உயரம் மிதமான நீர் தேக்கி வைக்கவும்.' } },
    { dayOffset: 45, title: { en: 'Second Top Dressing (Urea & MOP)', ta: 'இரண்டாம் கட்ட மேலுரம் (45-ஆம் நாள்)' }, advice: { en: 'Apply remaining 50% Urea and remaining 50% Potash (MOP) at panicle stage.', ta: 'கதிர் உருவாகும் தருணம் என்பதால் மீதமுள்ள யூரியா மற்றும் பொட்டாஷ் உரம் இடவும்.' } },
    { dayOffset: 70, title: { en: 'Insect Scouting & Health Check', ta: 'பூச்சி மற்றும் நோய் கண்காணிப்பு' }, advice: { en: 'Watch out for yellow stem borer moths or brown leaf spots. Spray bio-remedies.', ta: 'குருத்துப்பூச்சி மற்றும் புகையான் பூச்சிகளைக் கண்காணிக்கவும். தேவைப்படின் வேப்பங்கொட்டை கரைசல் தெளிக்கவும்.' } },
    { dayOffset: 110, title: { en: 'Drain Field for Harvesting', ta: 'அறுவடைக்கு முன் நீர் வடிப்பு' }, advice: { en: 'Drain the field completely 10-15 days before harvest to facilitate uniform ripening.', ta: 'நெல் சீராக முதிர்ச்சி அடைய அறுவடைக்கு 10-15 நாட்களுக்கு முன் வயல் நீரை முழுமையாக வடிக்கவும்.' } }
  ],
  sugarcane: [
    { dayOffset: 0, title: { en: 'Sett Planting & Basal SSP', ta: 'கரணைகள் நடுதல் & அடி உரம்' }, advice: { en: 'Plant healthy sugarcane setts. Apply full SSP fertilizer basally.', ta: 'தரமான கரும்பு கரணைகளை நடவு செய்க. சூப்பர் பாஸ்பேட் (SSP) உரத்தை அடியில் இடவும்.' } },
    { dayOffset: 30, title: { en: 'First Top Dressing (Urea & MOP)', ta: 'முதற்கட்ட உரப் பகிர்வு (30-ஆம் நாள்)' }, advice: { en: 'Apply 25% of Urea and 25% of MOP. Hand weed the fields.', ta: '25% யூரியா மற்றும் 25% பொட்டாஷ் உரம் இடவும். லேசான களைகளை எடுக்கவும்.' } },
    { dayOffset: 60, title: { en: 'Second Top Dressing', ta: 'இரண்டாம் கட்ட உரப் பகிர்வு (60-ஆம் நாள்)' }, advice: { en: 'Apply 25% Urea and 25% MOP. Perform second weeding.', ta: '25% யூரியா மற்றும் 25% பொட்டாஷ் இட்டு இரண்டாவது களை மேலாண்மை செய்க.' } },
    { dayOffset: 90, title: { en: 'Third Top Dressing & Earthing Up', ta: 'மூன்றாம் கட்ட உரப் பகிர்வு & மண் அணைப்பு' }, advice: { en: 'Apply 25% Urea and 25% MOP. Wrap soil around sugarcane base (earthing up).', ta: '25% யூரியா, பொட்டாஷ் இட்டு கரும்பின் அடிப்பகுதியில் மண் அணைத்து விடவும்.' } },
    { dayOffset: 120, title: { en: 'Fourth Top Dressing', ta: 'நான்காம் கட்ட உரப் பகிர்வு (120-ஆம் நாள்)' }, advice: { en: 'Apply final 25% Urea and 25% MOP splits. Prevent lodging by tying stalks.', ta: 'இறுதி 25% உரப்பங்கு இட்டு, கரும்புகள் சாய்ந்து விடாமல் ஒன்றுடன் ஒன்று பிணைத்துக் கட்டவும்.' } }
  ],
  groundnut: [
    { dayOffset: 0, title: { en: 'Sowing & Phosphatic Basal', ta: 'விதைப்பு மற்றும் அடி உரமிடல்' }, advice: { en: 'Sow groundnut seeds. Apply full SSP fertilizer to satisfy phosphate and sulphur needs.', ta: 'நிலக்கடலை விதைப்பு. கந்தக மற்றும் பாஸ்பரஸ் சத்துக்காக SSP உரத்தை அடியில் இடவும்.' } },
    { dayOffset: 20, title: { en: 'Hand Weeding', ta: 'களை மேலாண்மை (20-ஆம் நாள்)' }, advice: { en: 'Weed fields. Do not weed after day 45 to protect developing pods.', ta: 'களைகளை எடுக்கவும். விழுதுகள் மண்ணிற்குள் செல்லும் 45 நாட்களுக்குப் பின் களை எடுக்கக் கூடாது.' } },
    { dayOffset: 45, title: { en: 'Gypsum Application (Pegging)', ta: 'ஜிப்சம் இடுதல் (விழுது இறங்கும் பருவம்)' }, advice: { en: 'Apply Gypsum @ 200kg/acre. Earthing up soil helps peg penetration.', ta: 'ஏக்கருக்கு 200 கிலோ ஜிப்சம் இடவும். விழுதுகள் எளிதில் இறங்க லேசாக மண் அணைக்கவும்.' } },
    { dayOffset: 105, title: { en: 'Digging & Harvesting', ta: 'அறுவடை மற்றும் காய்களைத் தூண்டுதல்' }, advice: { en: 'Dig pods. Dry plants in sun for 3 days to lower pod moisture to 10%.', ta: 'கடலைகளைத் தோண்டி எடுக்கவும். ஈரப்பதம் 10%-க்கு குறையும் வரை 3 நாட்கள் காய வைக்கவும்.' } }
  ],
  generic: [
    { dayOffset: 0, title: { en: 'Basal Fertilizer & Sowing', ta: 'விதைப்பு மற்றும் அடி உரமிடல்' }, advice: { en: 'Sow seeds and apply slow-release Phosphatic fertilizer.', ta: 'விதைப்பு செய்து, அடி உரமாக மெதுவாக கரையும் பாஸ்பரஸ் உரத்தை இடவும்.' } },
    { dayOffset: 30, title: { en: 'Weeding & First Top Dressing', ta: 'களை எடுத்தல் & முதல் மேலுரம்' }, advice: { en: 'Perform weeding. Apply Nitrogen Urea split dressing.', ta: 'களைகள் எடுத்து, மேலுரமாக தழைச்சத்து யூரியா இடவும்.' } },
    { dayOffset: 60, title: { en: 'Second Top Dressing', ta: 'இரண்டாம் மேலுரம் (60-ஆம் நாள்)' }, advice: { en: 'Apply final Urea and Potash splits. Watch out for insect pests.', ta: 'இறுதி உரப் பங்குகளை இட்டு, பூச்சிகள் மற்றும் நோய் தாக்குதலைக் கண்காணிக்கவும்.' } }
  ]
};

// Pest & Disease Catalog Dataset
const pestDatabase = [
  {
    id: 'blast',
    crop: 'paddy',
    name: { en: 'Rice Blast (Blast Disease)', ta: 'நெல் குலைநோய் (Blast)' },
    scientific: 'Magnaporthe oryzae',
    symptoms: {
      en: 'Spindle-shaped spots on leaves with ash-grey centers and brown borders. Causes rotting of nodes and neck rot in panicles.',
      ta: 'இலைகளில் கண் வடிவில் சாம்பல் நிற மையமும் பழுப்பு நிற ஓரங்களும் கொண்ட புள்ளிகள் தோன்றும். கணுக்கள் மற்றும் கதிர் கழுத்துப் பகுதி அழுகிவிடும்.'
    },
    organic: {
      en: 'Spray Pseudomonas fluorescens formulation @ 10g/litre of water or apply Neem Oil spray (3%). Avoid excess nitrogen urea application.',
      ta: 'ஒரு லிட்டர் நீருக்கு 10 கிராம் வீதம் சூடோமோனாஸ் கரைசல் தெளிக்கவும் அல்லது 3% வேப்ப எண்ணெய் தெளிக்கவும். தழைச்சத்து (யூரியா) அதிகமிடுவதைத் தவிர்க்கவும்.'
    },
    chemical: {
      en: 'Spray Tricyclazole 75 WP @ 1g/litre or Carbendazim 50 WP @ 1g/litre of water during active tillering.',
      ta: 'ஒரு லிட்டர் நீருக்கு 1 கிராம் வீதம் டிரைசைக்ளசோல் 75 WP அல்லது கார்பென்டாசிம் 50 WP மருந்தை தூர்கட்டும் தருணத்தில் தெளிக்கவும்.'
    }
  },
  {
    id: 'stemborer',
    crop: 'paddy',
    name: { en: 'Yellow Stem Borer', ta: 'நெல் தண்டு துளைப்பான் (Stem Borer)' },
    scientific: 'Scirpophaga incertulas',
    symptoms: {
      en: 'Causes "Dead Heart" (withering and drying of central shoot) in vegetative stage and "White Ear" (chaffy, empty grains) during panicle stage.',
      ta: 'நாற்றுப் பருவத்தில் "குருத்து காய்ந்து" விடுதல் மற்றும் கதிர்விடும் பருவத்தில் நெல் மணிகள் இல்லாத "வெண்கதிர்" தோன்றுதல்.'
    },
    organic: {
      en: 'Release Trichogramma chilonis egg parasites @ 2cc/acre. Install pheromone traps @ 5/acre to capture adult yellow moths.',
      ta: 'ஏக்கருக்கு 2 சிசி வீதம் ட்ரைகோகிரம்மா சிலோனிஸ் முட்டை ஒட்டுண்ணிகளை கட்டவும். ஏக்கருக்கு 5 வீதம் இனக்கவர்ச்சி பொறிகளை வைக்கவும்.'
    },
    chemical: {
      en: 'Apply Cartap Hydrochloride 4G granules @ 10kg/acre or spray Chlorantraniliprole 18.5% SC @ 60ml/acre.',
      ta: 'ஏக்கருக்கு 10 கிலோ வீதம் கார்டாப் ஹைட்ரோகுளோரைடு 4G குறுணை மருந்தை இடவும் அல்லது குளோரான்டிரானிலிப்ரோல் 18.5% SC மருந்தை ஏக்கருக்கு 60 மிலி வீதம் தெளிக்கவும்.'
    }
  },
  {
    id: 'redrot',
    crop: 'sugarcane',
    name: { en: 'Red Rot Disease', ta: 'கரும்பு செவ்வழுகல் நோய் (Red Rot)' },
    scientific: 'Colletotrichum falcatum',
    symptoms: {
      en: 'Yellowing and shriveling of third/fourth leaves. When split open, the sugarcane stalk internal pith shows red lesions interspersed with white spots.',
      ta: 'மூன்று அல்லது நான்காவது இலைகள் மஞ்சளாகி சுருங்கும். கரும்பைப் பிளந்து பார்த்தால் உட்பகுதி சிவப்பு நிறமாக வெண் புள்ளிகளுடன் காணப்படும்.'
    },
    organic: {
      en: 'Use disease-free seed setts. Treat setts with Trichoderma viride. Practice crop rotation with paddy or green manures.',
      ta: 'நோய் தாக்காத கரும்பு கரணைகளை நடவுக்கு பயன்படுத்தவும். ட்ரைக்கோடெர்மா விரிடி கொண்டு விதை நேர்த்தி செய்க. நெல்லுடன் பயிர் சுழற்சி மேற்கொள்ளவும்.'
    },
    chemical: {
      en: 'Drench soil/seed setts with Carbendazim 50 WP @ 1g/litre. Remove and burn affected clumps immediately.',
      ta: 'ஒரு லிட்டர் நீருக்கு 1 கிராம் கார்பென்டாசிம் 50 WP கலந்து தண்டுப் பகுதியில் ஊற்றவும். பாதிக்கப்பட்ட பயிர்களை வேரோடு பிடுங்கி எரித்து விடவும்.'
    }
  },
  {
    id: 'bollworm',
    crop: 'cotton',
    name: { en: 'American Bollworm', ta: 'பருத்தி காய்ப்புழு (Bollworm)' },
    scientific: 'Helicoverpa armigera',
    symptoms: {
      en: 'Larvae bore into squares, flowers, and bolls. Defoliation and fecal pellets near bored holes. Causes massive boll shedding.',
      ta: 'புழுக்கள் மொட்டுகள், பூக்கள் மற்றும் காய்களை துளைத்து உண்ணும். துளைகளின் அருகே மலக் கழிவுகள் காணப்படும். காய்கள் உதிர்வதைத் தூண்டும்.'
    },
    organic: {
      en: 'Install Helicoverpa pheromone traps @ 5/acre. Spray Helicoverpa NPV (Nuclear Polyhedrosis Virus) @ 100 LE/acre mixed with crude sugar.',
      ta: 'ஏக்கருக்கு 5 வீதம் ஹெலிகோவெர்பா இனக்கவர்ச்சி பொறிகளை வைக்கவும். வெல்லக் கரைசலுடன் கலந்து NPV வைரஸ் மருந்தை ஏக்கருக்கு 100 LE தெளிக்கவும்.'
    },
    chemical: {
      en: 'Spray Spinosad 45 SC @ 0.4 ml/litre or Emamectin Benzoate 5 SG @ 0.5g/litre of water.',
      ta: 'ஒரு லிட்டர் நீருக்கு 0.4 மிலி வீதம் ஸ்பைனோசட் 45 SC அல்லது 0.5 கிராம் எமாமெக்டின் பென்சோயேட் 5 SG தெளிக்கவும்.'
    }
  },
  {
    id: 'tikkaspot',
    crop: 'groundnut',
    name: { en: 'Tikka Leaf Spot', ta: 'நிலக்கடலை டிக்கா இலைப்புள்ளி (Tikka)' },
    scientific: 'Cercospora arachidicola',
    symptoms: {
      en: 'Circular dark spot lesions on leaf front (early spot) and dark brown spots on lower leaf surface (late spot). Severe infections lead to leaf drop.',
      ta: 'இலையின் மேல் பரப்பில் வட்ட வடிவ கரும்புள்ளிகளும், கீழ் பரப்பில் அடர் பழுப்பு நிற புள்ளிகளும் தோன்றும். நோய் தீவிரம் அடைந்தால் இலைகள் உதிரும்.'
    },
    organic: {
      en: 'Spray Neem Seed Kernel Extract (NSKE 5%) or 3% Ginger-Garlic extract at the onset of spots. Rotate crops with millets.',
      ta: 'புள்ளிகள் தோன்றும் போது 5% வேப்பங்கொட்டை கரைசல் அல்லது 3% இஞ்சி-பூண்டு கரைசல் தெளிக்கவும். சிறுதானியங்களுடன் பயிர் சுழற்சி செய்க.'
    },
    chemical: {
      en: 'Spray Carbendazim 50 WP @ 1g/litre or Mancozeb 75 WP @ 2g/litre of water. Repeat after 15 days if necessary.',
      ta: 'ஒரு லிட்டர் நீருக்கு 1 கிராம் கார்பென்டாசிம் அல்லது 2 கிராம் மேன்கோசெப் 75 WP கலந்து தெளிக்கவும். தேவைப்படின் 15 நாட்கள் கழித்து மீண்டும் தெளிக்கவும்.'
    }
  },
  {
    id: 'leafcurl',
    crop: 'tomato',
    name: { en: 'Tomato Leaf Curl Virus', ta: 'தக்காளி இலைச்சுருள் நோய் (Leaf Curl)' },
    scientific: 'Tomato Leaf Curl New Delhi Virus (transmitted by Whiteflies)',
    symptoms: {
      en: 'Stunted plant growth with severely curled, puckered, and twisted leaves. Leaf margins turn yellow. Fruit setting is highly reduced.',
      ta: 'செடிகளின் வளர்ச்சி குன்றி, இலைகள் மேல்நோக்கி சுருண்டு, சுருக்கங்களுடன் காணப்படும். இலை ஓரங்கள் மஞ்சளாகும். காய்கள் பிடிப்பது குறையும்.'
    },
    organic: {
      en: 'Install Yellow Sticky Traps @ 12/acre to trap vector Whiteflies. Spray Neem formulation (Azadirachtin 1500 ppm) @ 3ml/litre of water.',
      ta: 'வெள்ளை ஈக்களைக் கவர ஏக்கருக்கு 12 மஞ்சள் ஒட்டுண்ணி அட்டைகளை வைக்கவும். ஒரு லிட்டர் நீருக்கு 3 மிலி அசாடிராக்டின் (வேப்ப உரம்) தெளிக்கவும்.'
    },
    chemical: {
      en: 'Spray systemic insecticides like Imidacloprid 17.8 SL @ 0.3 ml/litre or Dimethoate 30 EC @ 1 ml/litre to control the vector flies.',
      ta: 'ஈக்களைக் கட்டுப்படுத்த ஒரு லிட்டர் நீருக்கு 0.3 மிலி இமிடாகுளோபிரிட் 17.8 SL அல்லது 1 மிலி டைமெத்தோயேட் 30 EC தெளிக்கவும்.'
    }
  },
  {
    id: 'panamawilt',
    crop: 'banana',
    name: { en: 'Panama Wilt (Fusarium Wilt)', ta: 'வாழை பானமா வாடல் நோய் (Panama Wilt)' },
    scientific: 'Fusarium oxysporum f. sp. cubense',
    symptoms: {
      en: 'Yellowing of lower leaves starting from margins. Petioles buckle, hanging down around pseudostem. Longitudinal splitting of pseudostem base.',
      ta: 'கீழ் இலைகளின் ஓரங்கள் மஞ்சள் நிறமாக மாறி மட்டைகள் உடைந்து தண்டைச் சுற்றி தொங்கும். மரத்தின் அடிப்பகுதி நீளவாக்கில் வெடிக்கும்.'
    },
    organic: {
      en: 'Apply Trichoderma viride @ 50g/plant mixed in farmyard manure at planting. Inject Pseudomonas fluorescens capsules into pseudostem.',
      ta: 'கூட்டுத் தொழு உரத்துடன் தலா 50 கிராம் வீதம் ட்ரைக்கோடெர்மா விரிடி கலந்து இடவும். சூடோமோனாஸ் மாத்திரைகளை தண்டினுள் செலுத்தவும்.'
    },
    chemical: {
      en: 'Inject 3 ml of 2% Carbendazim solution into pseudostem at 45 degree angle, or drench basin soil with Carbendazim @ 1g/litre.',
      ta: 'தண்டில் 45 டிகிரி கோணத்தில் 3 மிலி 2% கார்பென்டாசிம் கரைசலை ஊசி மூலம் செலுத்தவும், அல்லது வேர்ப்பகுதியில் கார்பென்டாசிம் கரைசலை ஊற்றவும்.'
    }
  }
];

// Chatbot local answers dictionary
const chatbotLocalKnowledge = {
  en: {
    welcome: "Welcome! Tell me what you would like to consult on today.",
    general_help: "I can help with:<br>- **Crop recommendations:** Input soil & season in the right panel or ask me here.<br>- **Fertilizer guide:** Check NPK doses for Paddy, Sugarcane, Cotton etc.<br>- **Pest & Disease Guide:** Select the tab to browse and filter crop remedies.<br>- **Weather alerts:** Change regions to view dynamic farm warnings.<br>Please type your specific question!",
    paddy_tips: "🌾 **Paddy Management Tips:**<br>1. Optimal sowing: June-July (Kuruvai) or Oct (Thaladi).<br>2. Fertilizer: Split Urea into 3 doses - basal, active tillering, and panicle stage.<br>3. Disease warning: If you spot brown spots, it could be Leaf Blast. Use Neem Oil or Pseudomonas fluorescens spray.",
    fertilizer_tips: "🧪 **General Fertilizer Guidelines:**<br>1. Always test soil first before applying chemical fertilizers.<br>2. Basal dose: Apply Phosphorus (SSP) and Potassium (MOP) fully during sowing.<br>3. Top dressing: Apply Nitrogen (Urea) in splits to prevent leaching.",
    weather_tips: "🌦️ **Weather Alert Actions:**<br>- If rain is expected (>60%), avoid spraying pesticides or applying urea, as they will wash off.<br>- In high heat (>35°C), perform irrigation early morning or evening to minimize evaporation losses.",
    disease_tips: "🍃 **Crop Disease Identification:**<br>- **Tomato Leaf Curl:** Vector is whiteflies. Spray neem formulation or place yellow sticky traps.<br>- **Rice Blast:** Spotty leaves. Keep fields moist; avoid excess Nitrogen urea."
  },
  ta: {
    welcome: "நல்வரவு! இன்று விவசாயம் சார்ந்த எதைப் பற்றி ஆலோசிக்க விரும்புகிறீர்கள்?",
    general_help: "நான் உதவக்கூடியவை:<br>- **பயிர் பரிந்துரை:** வலது பக்கத்தில் மண் மற்றும் பருவத்தை உள்ளிடவும் அல்லது இங்கு கேட்கவும்.<br>- **உர வழிகாட்டி:** நெல், கரும்பு, பருத்தி போன்றவற்றின் உரத் தேவைகளைக் கணக்கிடவும்.<br>- **பூச்சி மேலாண்மை:** நோய் மேலாண்மை கையேடு மூலம் பயிர் மருந்துகளை அறியவும்.<br>- **வானிலை எச்சரிக்கை:** மண்டலங்களை மாற்றி எச்சரிக்கைகளைக் காணவும்.<br>தயவுசெய்து உங்கள் கேள்வியைத் தட்டச்சு செய்க!",
    paddy_tips: "🌾 **நெல் சாகுபடி குறிப்புகள்:**<br>1. நடவு பருவம்: ஜூன்-ஜூலை (குறுவை) அல்லது அக்டோபர் (தாளடி).<br>2. உரமிடல்: யூரியாவை மூன்று பகுதிகளாக பிரித்து இடவும் - அடி உரமாக, தூர் கட்டும் போது, மற்றும் கதிர் வரும் போது.<br>3. நோய் மேலாண்மை: இலைகளில் பழுப்பு புள்ளிகள் கண்டால் குலைநோய் (Blast) இருக்கக்கூடும். வேப்ப எண்ணெய் அல்லது சூடோமோனாஸ் தெளிக்கவும்.",
    fertilizer_tips: "🧪 **பொதுவான உர வழிகாட்டுதல்கள்:**<br>1. ரசாயன உரங்களை இடுவதற்கு முன் எப்போதும் மண் பரிசோதனை செய்யுங்கள்.<br>2. அடி உரம்: பாஸ்பரஸ் (SSP) மற்றும் பொட்டாசியம் (MOP) உரங்களை விதைக்கும் போதே முழுமையாக இட வேண்டும்.<br>3. மேலுரம்: தழைச்சத்தை (யூரியா) பிரித்து இடுவதன் மூலம் சத்து விரயமாவதைத் தடுக்கலாம்.",
    weather_tips: "🌦️ **வானிலை எச்சரிக்கை வழிகாட்டி:**<br>- மழை வாய்ப்பு (>60%) இருந்தால், பூச்சிக்கொல்லி தெளிப்பதையோ அல்லது யூரியா இடுவதையோ தவிர்க்கவும் (மழையில் அடித்துச் செல்லப்படும்).<br>- அதிக வெப்பத்தின் போது (>35°C), நீர் ஆவியாவதைத் தடுக்க காலை அல்லது மாலை வேளையில் நீர் பாய்ச்சவும்.",
    disease_tips: "🍃 **பயிர் நோய் கட்டுப்பாடு:**<br>- **தக்காளி இலைச்சுருள் நோய்:** பரப்பும் காரணி வெள்ளை ஈக்கள். வேப்பங்கொட்டை கரைசல் தெளிக்கவும் அல்லது மஞ்சள் ஒட்டுண்ணி அட்டைகளை வைக்கவும்.<br>- **நெல் குலைநோய்:** இலைகளில் கண் வடிவ புள்ளிகள் தோன்றும். வயலில் மிதமான நீர் தேக்கி வைக்கவும்; அதிக யூரியா இடுவதைத் தவிர்க்கவும்."
  }
};

// Initialize Application UI
document.addEventListener('DOMContentLoaded', async () => {
  initDOM();
  updateLocalization();
  generateWeather();
  initSettings();
  setupEventListeners();

  // Initialize Native IndexedDB Database persistent layer
  try {
    await AgriDB.init();
    state.dbInitialized = true;
    await loadPersistedChatLogs();
    await loadSavedFields();
    await loadCropCalendar();
  } catch (err) {
    console.error('Failed to initialize local IndexedDB:', err);
    renderWelcomeMessage();
    runDefaultCropAnalysis();
  }
});

// Cache DOM Elements
let dom = {};
function initDOM() {
  dom = {
    langSelect: document.getElementById('lang-select'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    btnSettingsToggle: document.getElementById('btn-settings-toggle'),
    chatMessages: document.getElementById('chat-messages-container'),
    chatQuickActions: document.getElementById('chat-quick-actions'),
    chatForm: document.getElementById('chat-input-form'),
    chatInput: document.getElementById('chat-text-input'),
    btnClearChat: document.getElementById('btn-clear-chat'),
    districtSelect: document.getElementById('district-select'),
    btnGpsWeather: document.getElementById('btn-gps-weather'),
    settingsModal: document.getElementById('settings-modal'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    btnSaveSettings: document.getElementById('btn-save-settings'),
    btnClearSettings: document.getElementById('btn-clear-settings'),
    txtGeminiKey: document.getElementById('txt-gemini-key'),
    keySuccessBadge: document.getElementById('key-success-badge'),
    
    // Database Saved Fields
    saveFieldForm: document.getElementById('save-field-form'),
    txtFieldName: document.getElementById('txt-field-name'),
    savedFieldsList: document.getElementById('saved-fields-list'),
    
    // Climate values
    valTemp: document.getElementById('val-temp'),
    valHumidity: document.getElementById('val-humidity'),
    valRain: document.getElementById('val-rain'),
    valWind: document.getElementById('val-wind'),
    climateAlertBox: document.getElementById('climate-alert-box'),
    climateAlertTitle: document.getElementById('climate-alert-title'),
    climateAlertDesc: document.getElementById('climate-alert-desc'),
    climateAlertIcon: document.getElementById('climate-alert-icon'),
    
    // Tabs
    tabBtnCrop: document.getElementById('tab-btn-crop'),
    tabBtnFertilizer: document.getElementById('tab-btn-fertilizer'),
    tabBtnPests: document.getElementById('tab-btn-pests'),
    tabBtnCalendar: document.getElementById('tab-btn-calendar'),
    tabCrop: document.getElementById('tab-crop'),
    tabFertilizer: document.getElementById('tab-fertilizer'),
    tabPests: document.getElementById('tab-pests'),
    tabCalendar: document.getElementById('tab-calendar'),
    
    // Forms
    cropForm: document.getElementById('crop-recommendation-form'),
    fertilizerForm: document.getElementById('fertilizer-calculator-form'),
    
    // Form selections
    soilSelect: document.getElementById('soil-select'),
    waterSelect: document.getElementById('water-select'),
    seasonSelect: document.getElementById('season-select'),
    cropSelect: document.getElementById('crop-select'),
    soilN: document.getElementById('soil-n'),
    soilP: document.getElementById('soil-p'),
    soilK: document.getElementById('soil-k'),
    pestCropFilter: document.getElementById('pest-crop-filter'),
    
    // Output UI
    cropOutputCard: document.getElementById('crop-output-card'),
    cropResultsContainer: document.getElementById('crop-results-container'),
    fertilizerOutputCard: document.getElementById('fertilizer-output-card'),
    fertilizerGuidanceText: document.getElementById('fertilizer-guidance-text'),
    npkBarVisual: document.getElementById('npk-bar-visual'),
    valNpkRatio: document.getElementById('val-npk-ratio'),
    fertilizerBagsContainer: document.getElementById('fertilizer-bags-container'),
    pestCatalogContainer: document.getElementById('pest-catalog-container'),
    calendarCyclesContainer: document.getElementById('calendar-cycles-container')
  };
  
  // Inject Header and Static Icons
  injectIcon('header-logo-icon', 'leaf', 24);
  injectIcon('chat-header-icon', 'leaf', 20);
  injectIcon('icon-clear-chat', 'refresh', 16);
  injectIcon('icon-field-profiles-header', 'globe', 18);
  injectIcon('icon-lang-globe', 'globe', 18);
  injectIcon('icon-theme', 'moon', 20);
  injectIcon('icon-settings', 'settings', 20);
  injectIcon('icon-send', 'send', 20);
  injectIcon('icon-climate-header', 'rain', 24);
  injectIcon('icon-gps', 'mapPin', 18);
  injectIcon('icon-tab-crop', 'sprout', 20);
  injectIcon('icon-tab-fert', 'package', 20);
  injectIcon('icon-tab-pests', 'bug', 20);
  injectIcon('icon-tab-calendar', 'calendar', 20);
  injectIcon('icon-crop-results', 'check', 20);
  injectIcon('icon-fert-results', 'check', 20);
  injectIcon('btn-close-settings', 'close', 18);
  injectIcon('icon-badge-check', 'check', 14);
}

// Load logs from IndexedDB
async function loadPersistedChatLogs() {
  dom.chatMessages.innerHTML = '';
  const logs = await AgriDB.getChatLogs();
  if (logs.length === 0) {
    renderWelcomeMessage();
  } else {
    logs.forEach(log => {
      appendMessage(log.text, log.sender);
    });
  }
}

// Load and render Saved Field Soil Profiles
async function loadSavedFields() {
  if (!dom.savedFieldsList) return;
  dom.savedFieldsList.innerHTML = '';
  
  const fields = await AgriDB.getFieldProfiles();
  
  if (fields.length === 0) {
    const hint = document.createElement('span');
    hint.style.fontSize = '0.8rem';
    hint.style.color = 'var(--text-secondary)';
    hint.style.opacity = '0.7';
    hint.textContent = state.lang === 'en' ? 'No saved field profiles.' : 'சேமிக்கப்பட்ட நிலங்கள் ஏதும் இல்லை.';
    dom.savedFieldsList.appendChild(hint);
    
    // If first load and no saved profiles, load default analysis
    runDefaultCropAnalysis();
    return;
  }

  fields.forEach(field => {
    const chip = document.createElement('div');
    chip.className = 'field-chip';
    chip.innerHTML = `
      <span>${field.name}</span>
      <button class="delete-btn" data-id="${field.id}" aria-label="Delete profile">&times;</button>
    `;

    // Click chip to load variables
    chip.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-btn')) return;
      
      // Update variables in form
      dom.soilSelect.value = field.soil;
      dom.waterSelect.value = field.water;
      dom.seasonSelect.value = field.season;
      dom.cropSelect.value = field.crop;
      dom.soilN.value = field.soilN;
      dom.soilP.value = field.soilP;
      dom.soilK.value = field.soilK;

      // Trigger recalculations
      runCropAnalysis();
      runFertilizerAnalysis();
      
      // Flash animation on chips
      chip.style.transform = 'scale(0.95)';
      setTimeout(() => chip.style.transform = 'scale(1)', 100);
    });

    // Delete saved field profile
    chip.querySelector('.delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = e.target.getAttribute('data-id');
      await AgriDB.deleteFieldProfile(id);
      loadSavedFields();
    });

    dom.savedFieldsList.appendChild(chip);
  });
}

// Load and Render Active Crop Cycles & Tasks
async function loadCropCalendar() {
  if (!dom.calendarCyclesContainer) return;
  dom.calendarCyclesContainer.innerHTML = '';

  const cycles = await AgriDB.getCropCycles();

  if (cycles.length === 0) {
    const hint = document.createElement('div');
    hint.style.textAlign = 'center';
    hint.style.color = 'var(--text-secondary)';
    hint.style.padding = '3rem 0';
    hint.innerHTML = `
      <p style="font-size:0.95rem; font-weight:600; margin-bottom:0.25rem;">
        ${state.lang === 'en' ? 'No Active Crop Calendars' : 'செயலில் உள்ள சாகுபடி நாட்காட்டிகள் ஏதும் இல்லை'}
      </p>
      <p style="font-size:0.8rem; opacity:0.8;">
        ${state.lang === 'en' ? 'Start a cycle from the Crop Recommendation cards below.' : 'கீழே உள்ள பயிர் பரிந்துரை கார்டுகளிலிருந்து சாகுபடியைத் தொடங்கவும்.'}
      </p>
    `;
    dom.calendarCyclesContainer.appendChild(hint);
    return;
  }

  for (const cycle of cycles) {
    const card = document.createElement('div');
    card.className = 'calendar-cycle-card';
    
    // Fetch tasks for this cycle
    const tasks = await AgriDB.getCropTasks(cycle.id);
    
    // Sort tasks by dayOffset
    tasks.sort((a, b) => a.dayOffset - b.dayOffset);

    // Calculate progress
    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    let tasksHtml = '';
    tasks.forEach(task => {
      const taskTitle = state.lang === 'en' ? task.taskTitleEn : task.taskTitleTa;
      const taskAdvice = state.lang === 'en' ? task.fertilizerAdviceEn : task.fertilizerAdviceTa;
      const isCompleted = task.completed ? 'completed' : '';
      const isChecked = task.completed ? 'checked' : '';

      tasksHtml += `
        <div class="calendar-task-item ${isCompleted}">
          <input type="checkbox" class="calendar-task-checkbox" data-task-id="${task.id}" ${isChecked} aria-label="Mark task completed">
          <div class="task-details">
            <span class="task-text">${taskTitle}</span>
            <span class="task-date">
              ${state.lang === 'en' ? 'Due Date:' : 'செய்ய வேண்டிய நாள்:'} <strong>${task.dueDate}</strong> 
              (Day ${task.dayOffset})
            </span>
            <p class="task-advice">${taskAdvice}</p>
          </div>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="calendar-cycle-header">
        <div>
          <span class="calendar-cycle-title">${cycle.cropName} (${cycle.fieldName})</span>
          <div class="calendar-cycle-meta" style="margin-top:0.2rem;">
            ${state.lang === 'en' ? 'Sowing Date:' : 'விதைப்பு நாள்:'} <strong>${cycle.sowingDate}</strong> | 
            Progress: <strong>${progressPct}%</strong> (${completedCount}/${totalCount})
          </div>
        </div>
        <button class="btn-secondary btn-delete-cycle" data-cycle-id="${cycle.id}" style="padding:0.4rem 0.8rem; font-size:0.75rem; border-color:rgba(239,68,68,0.3); color:var(--danger);" aria-label="Archive Cycle">
          ${state.lang === 'en' ? 'Archive' : 'அழிக்கவும்'}
        </button>
      </div>

      <div class="calendar-tasks-list">
        ${tasksHtml}
      </div>
    `;

    // Bind checkbox event listeners inside card
    card.querySelectorAll('.calendar-task-checkbox').forEach(chk => {
      chk.addEventListener('change', async (e) => {
        const taskId = chk.getAttribute('data-task-id');
        const completed = chk.checked;
        await AgriDB.toggleTaskCompleted(taskId, completed);
        loadCropCalendar(); // Reload to refresh headers & progress values
      });
    });

    // Bind delete/archive cycle listener
    card.querySelector('.btn-delete-cycle').addEventListener('click', async () => {
      const confirmText = state.lang === 'en'
        ? 'Delete/Archive this crop cycle calendar?'
        : 'இந்த பயிர் சாகுபடி நாட்காட்டியை நீக்க வேண்டுமா?';
      if (confirm(confirmText)) {
        await AgriDB.deleteCropCycle(cycle.id);
        loadCropCalendar();
      }
    });

    dom.calendarCyclesContainer.appendChild(card);
  }
}

// Update UI Text Content based on active language
function updateLocalization() {
  const dictionary = translations[state.lang];
  document.body.className = `lang-${state.lang}`;
  
  // Apply translation key matching id
  Object.keys(dictionary).forEach(key => {
    const el = document.getElementById(key);
    if (el) {
      if (el.tagName === 'INPUT') {
        el.placeholder = dictionary[key];
      } else {
        el.textContent = dictionary[key];
      }
    }
  });

  // Re-generate chat chips with correct translations
  renderQuickActionChips();
  
  // Update static dropdown content if needed
  localizeFormDropdowns();
  
  // Refresh recommendations if outputs are active
  if (dom.cropOutputCard.classList.contains('active')) {
    runCropAnalysis();
  }
  if (dom.fertilizerOutputCard.classList.contains('active')) {
    runFertilizerAnalysis();
  }

  // Refresh disease guide
  runPestAnalysis();

  // Refresh calendar view
  loadCropCalendar();
  
  // Refresh Weather alert text
  updateWeatherAlertUI();
}

function localizeFormDropdowns() {
  const soils = [
    { value: 'clayey', textKey: 'txt-soil-clayey' },
    { value: 'loamy', textKey: 'txt-soil-loamy' },
    { value: 'sandy', textKey: 'txt-soil-sandy' },
    { value: 'alluvial', textKey: 'txt-soil-alluvial' }
  ];
  const waters = [
    { value: 'high', textKey: 'txt-water-high' },
    { value: 'medium', textKey: 'txt-water-medium' },
    { value: 'low', textKey: 'txt-water-low' }
  ];
  const seasons = [
    { value: 'kharif', textKey: 'txt-season-kharif' },
    { value: 'rabi', textKey: 'txt-season-rabi' },
    { value: 'zaid', textKey: 'txt-season-zaid' }
  ];
  const levels = [
    { value: 'low', textKey: 'txt-soil-level-low' },
    { value: 'medium', textKey: 'txt-soil-level-medium' },
    { value: 'high', textKey: 'txt-soil-level-high' }
  ];

  const updateOptions = (selectEl, list) => {
    if (!selectEl) return;
    Array.from(selectEl.options).forEach(opt => {
      const match = list.find(item => item.value === opt.value);
      if (match) {
        opt.textContent = translations[state.lang][match.textKey];
      }
    });
  };

  updateOptions(dom.soilSelect, soils);
  updateOptions(dom.waterSelect, waters);
  updateOptions(dom.seasonSelect, seasons);
  updateOptions(dom.soilN, levels);
  updateOptions(dom.soilP, levels);
  updateOptions(dom.soilK, levels);
  
  // Select Target Crop
  if (dom.cropSelect) {
    const cropsTranslate = {
      paddy: { en: 'Paddy / Nel (நெல்)', ta: 'நெல் / Paddy' },
      sugarcane: { en: 'Sugarcane (கரும்பு)', ta: 'கரும்பு / Sugarcane' },
      groundnut: { en: 'Groundnut (நிலக்கடலை)', ta: 'நிலக்கடலை / Groundnut' },
      maize: { en: 'Maize (சோளம்)', ta: 'மக்காச்சோளம் / Maize' },
      cotton: { en: 'Cotton (பருத்தி)', ta: 'பருத்தி / Cotton' }
    };
    Array.from(dom.cropSelect.options).forEach(opt => {
      if (cropsTranslate[opt.value]) {
        opt.textContent = cropsTranslate[opt.value][state.lang];
      }
    });
  }

  // Select Crop in Pest Filter
  if (dom.pestCropFilter) {
    const pestCropsTranslate = {
      all: { en: 'All Crops (அனைத்து பயிர்களும்)', ta: 'அனைத்து பயிர்களும்' },
      paddy: { en: 'Paddy / Nel (நெல்)', ta: 'நெல் (Paddy)' },
      sugarcane: { en: 'Sugarcane (கரும்பு)', ta: 'கரும்பு (Sugarcane)' },
      groundnut: { en: 'Groundnut (நிலக்கடலை)', ta: 'நிலக்கடலை (Groundnut)' },
      maize: { en: 'Maize (சோளம்)', ta: 'மக்காச்சோளம் (Maize)' },
      cotton: { en: 'Cotton (பருத்தி)', ta: 'பருத்தி (Cotton)' },
      tomato: { en: 'Tomato (தக்காளி)', ta: 'தக்காளி (Tomato)' },
      banana: { en: 'Banana (வாழை)', ta: 'வாழை (Banana)' }
    };
    Array.from(dom.pestCropFilter.options).forEach(opt => {
      if (pestCropsTranslate[opt.value]) {
        opt.textContent = pestCropsTranslate[opt.value][state.lang];
      }
    });
  }
}

// Generate weather profile
function generateWeather() {
  const base = districtBases[state.selectedDistrict];
  if (!base) return;

  // Add small random noise for simulation realism
  state.weatherData.temp = base.temp + Math.floor(Math.random() * 3) - 1;
  state.weatherData.humidity = base.humidity + Math.floor(Math.random() * 7) - 3;
  state.weatherData.rain = base.rain + Math.floor(Math.random() * 11) - 5;
  state.weatherData.wind = base.wind + Math.floor(Math.random() * 5) - 2;

  // Clamp probabilities/percentages
  if (state.weatherData.rain < 0) state.weatherData.rain = 0;
  if (state.weatherData.rain > 100) state.weatherData.rain = 100;
  if (state.weatherData.humidity > 100) state.weatherData.humidity = 100;
  
  // Render values
  dom.valTemp.textContent = `${state.weatherData.temp}°C`;
  dom.valHumidity.textContent = `${state.weatherData.humidity}%`;
  dom.valRain.textContent = `${state.weatherData.rain}%`;
  dom.valWind.textContent = `${state.weatherData.wind} km/h`;

  // Render weather icons
  injectIcon('climate-icon-temp', 'sun', 20);
  injectIcon('climate-icon-humidity', 'droplet', 20);
  injectIcon('climate-icon-rain', 'rain', 20);
  injectIcon('climate-icon-wind', 'wind', 20);

  updateWeatherAlertUI();
}

// Fetch live GPS weather from Open-Meteo
async function fetchGpsWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('API fetch failed');
    const data = await response.json();
    
    if (data && data.current) {
      state.weatherData.temp = Math.round(data.current.temperature_2m);
      state.weatherData.humidity = Math.round(data.current.relative_humidity_2m);
      
      // Open-Meteo current precipitation is in mm. Let's estimate a simple rain prob percentage
      const prec = data.current.precipitation || 0;
      state.weatherData.rain = prec > 0 ? Math.min(95, Math.round(prec * 20 + 20)) : 10;
      state.weatherData.wind = Math.round(data.current.wind_speed_10m);

      // Render values
      dom.valTemp.textContent = `${state.weatherData.temp}°C`;
      dom.valHumidity.textContent = `${state.weatherData.humidity}%`;
      dom.valRain.textContent = `${state.weatherData.rain}%`;
      dom.valWind.textContent = `${state.weatherData.wind} km/h`;

      updateWeatherAlertUI();

      const successAlert = state.lang === 'en'
        ? `Loaded live local weather for GPS: Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`
        : `இருப்பிட வானிலை வெற்றிகரமாக ஏற்றப்பட்டது: அட்சரேகை ${lat.toFixed(2)}, தீர்க்கரேகை ${lon.toFixed(2)}`;
      alert(successAlert);
    }
  } catch (err) {
    console.error('Error fetching live weather:', err);
    const failAlert = state.lang === 'en'
      ? 'Failed to fetch live weather. Please check internet connection.'
      : 'வானிலை தகவல்களைப் பெறுவதில் தோல்வி. இணைய இணைப்பைச் சரிபார்க்கவும்.';
    alert(failAlert);
  }
}

// Generate agricultural warnings based on weather parameters
function updateWeatherAlertUI() {
  const temp = state.weatherData.temp;
  const wind = state.weatherData.wind;
  const rain = state.weatherData.rain;
  
  let alertType = 'good';
  let titleEn = 'Perfect Sowing Weather';
  let titleTa = 'விதைப்புக்கு உகந்த வானிலை';
  let descEn = 'Moderate humidity and stable temperatures are optimal for sowing seeds and applying organic compost.';
  let descTa = 'மிதமான ஈரப்பதமும் சீரான வெப்பநிலையும் விதைகள் விதைப்பதற்கும், இயற்கை எரு உரமிடுவதற்கும் மிக உகந்தது.';
  let iconName = 'check';

  if (wind >= 18 && rain >= 50) {
    alertType = 'warning';
    titleEn = 'Cyclone / Storm Precaution';
    titleTa = 'புயல் / பலத்த காற்று எச்சரிக்கை';
    descEn = 'Strong winds and rain detected. Postpone harvesting. Provide strong supports (staking) for banana and sugarcane crops immediately.';
    descTa = 'பலத்த காற்றும் மழையும் எதிர்பார்க்கப்படுகிறது. அறுவடையைத் தள்ளிப்போடுங்கள். வாழை மற்றும் கரும்புப் பயிர்களுக்கு உடனடியாக முட்டுக் கொடுங்கள்.';
    iconName = 'alert';
  } else if (rain >= 60) {
    alertType = 'warning';
    titleEn = 'Heavy Rain Alert';
    titleTa = 'கனமழை எச்சரிக்கை';
    descEn = 'High rain probability. Avoid spraying pesticides or spreading nitrogen fertilizers (Urea) today to prevent runoff. Ensure drainage channels are clear.';
    descTa = 'அதிக மழை வாய்ப்பு உள்ளது. உரங்கள் மழையில் அடித்துச் செல்லப்படுவதைத் தடுக்க இன்று பூச்சிக்கொல்லி தெளிப்பதையோ, யூரியா இடுவதையோ தவிர்க்கவும். வடிகால் வாய்க்கால்களை சுத்தம் செய்யவும்.';
    iconName = 'alert';
  } else if (temp >= 34) {
    alertType = 'warning';
    titleEn = 'Heat Stress Advisory';
    titleTa = 'அதிக வெப்ப எச்சரிக்கை';
    descEn = 'High temperatures detected. Increase irrigation frequency. Implement crop mulching using organic residues to conserve soil moisture.';
    descTa = 'அதிக வெப்பநிலை காணப்படுகிறது. நீர் பாசன இடைவெளியை குறைத்து அடிக்கடி நீர் பாய்ச்சவும். மண்ணின் ஈரப்பதத்தை காக்க தழை மூடாக்கு இடவும்.';
    iconName = 'alert';
  }

  // Update DOM classes and text
  dom.climateAlertBox.className = `climate-alerts ${alertType}`;
  dom.climateAlertTitle.textContent = state.lang === 'en' ? titleEn : titleTa;
  dom.climateAlertDesc.textContent = state.lang === 'en' ? descEn : descTa;
  injectIcon('climate-alert-icon', iconName, 22);
}

// Initial crop analysis for demo load
function runDefaultCropAnalysis() {
  runCropAnalysis();
  runFertilizerAnalysis();
}

// Render dynamic soil pH bar indicator
function getPhScaleHtml(phRange) {
  const parts = phRange.split('-').map(x => parseFloat(x.trim()));
  const minPh = parts[0] || 6.0;
  const maxPh = parts[1] || 7.0;

  // Map pH 4.0 - 10.0 to 0% - 100%
  const minPct = Math.max(0, Math.min(100, ((minPh - 4) / 6) * 100));
  const maxPct = Math.max(0, Math.min(100, ((maxPh - 4) / 6) * 100));
  const needlePct = (minPct + maxPct) / 2;

  return `
    <div class="ph-visualizer-container">
      <div class="ph-label-row">
        <span>${translations[state.lang]['txt-ph-indicator-label']}: <strong>pH ${phRange}</strong></span>
        <span class="ph-value-badge">${state.lang === 'en' ? 'Optimal Range' : 'உகந்த அளவு'}</span>
      </div>
      <div class="ph-bar-wrapper">
        <div class="ph-optimal-box" style="left: ${minPct}%; width: ${maxPct - minPct}%;"></div>
        <div class="ph-indicator-needle" style="left: ${needlePct}%;"></div>
      </div>
      <div class="ph-label-row" style="font-weight: 500; opacity: 0.7;">
        <span>pH 4.0</span>
        <span>7.0 (${state.lang === 'en' ? 'Neutral' : 'நடுநிலை'})</span>
        <span>10.0</span>
      </div>
    </div>
  `;
}

// Match crops based on user inputs
function runCropAnalysis() {
  const soil = dom.soilSelect.value;
  const water = dom.waterSelect.value;
  const season = dom.seasonSelect.value;
  
  // Filtration Logic
  const matches = cropDatabase.filter(crop => {
    const soilMatch = crop.soil.includes(soil);
    
    // Water mapping evaluation
    let waterMatch = false;
    if (water === 'high') {
      waterMatch = true; // High water availability can grow anything
    } else if (water === 'medium') {
      waterMatch = (crop.water === 'medium' || crop.water === 'low');
    } else {
      waterMatch = (crop.water === 'low');
    }
    
    const seasonMatch = crop.season.includes(season);
    
    return soilMatch && waterMatch && seasonMatch;
  });

  dom.cropResultsContainer.innerHTML = '';
  
  if (matches.length === 0) {
    const noResults = document.createElement('p');
    noResults.style.gridColumn = '1 / -1';
    noResults.style.textAlign = 'center';
    noResults.style.color = 'var(--text-secondary)';
    noResults.style.padding = '2rem 0';
    noResults.textContent = translations[state.lang]['txt-no-crops-found'];
    dom.cropResultsContainer.appendChild(noResults);
  } else {
    matches.forEach(crop => {
      const card = document.createElement('div');
      card.className = 'crop-card';
      
      const transName = crop.name[state.lang];
      const transNotes = crop.notes[state.lang];
      const transDuration = crop.duration[state.lang];
      const transYield = crop.yield[state.lang];
      const phVisualHtml = getPhScaleHtml(crop.ph);
      
      let waterLabel = state.lang === 'en' ? 'High' : 'அதிகம்';
      if (crop.water === 'medium') waterLabel = state.lang === 'en' ? 'Medium' : 'மத்தியமம்';
      if (crop.water === 'low') waterLabel = state.lang === 'en' ? 'Low' : 'குறைவு';
      
      card.innerHTML = `
        <div class="crop-card-header">
          <span class="crop-name">${transName}</span>
          <span class="crop-match">100% Match</span>
        </div>
        <div class="crop-details">
          <div class="crop-detail-item">
            <span class="crop-detail-label">${translations[state.lang]['txt-crop-details-duration']}</span>
            <span class="crop-detail-value">${transDuration}</span>
          </div>
          <div class="crop-detail-item">
            <span class="crop-detail-label">${translations[state.lang]['txt-crop-details-yield']}</span>
            <span class="crop-detail-value">${transYield}</span>
          </div>
          <div class="crop-detail-item" style="grid-column: span 2;">
            <span class="crop-detail-label">${translations[state.lang]['txt-crop-details-water']}</span>
            <span class="crop-detail-value">${waterLabel}</span>
          </div>
        </div>
        
        ${phVisualHtml}
        
        <p class="crop-notes">${transNotes}</p>
        
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="crop-action-btn" data-crop="${crop.id}">
            ${translations[state.lang]['txt-get-guide']} <span id="icon-chevron-${crop.id}"></span>
          </button>
          
          <button class="crop-start-btn" data-crop-id="${crop.id}" data-crop-name="${transName}">
            <span id="icon-start-cycle-${crop.id}" style="display:flex;"></span>
            ${state.lang === 'en' ? 'Start Crop Cycle' : 'சாகுபடியைத் தொடங்கு'}
          </button>
        </div>
      `;
      dom.cropResultsContainer.appendChild(card);
      
      // Inject icons inside crop card buttons
      injectIcon(`icon-chevron-${crop.id}`, 'chevronRight', 14);
      injectIcon(`icon-start-cycle-${crop.id}`, 'calendar', 14);
    });

    // Add click listeners to "Get Fertilizer Guide" inside crop cards
    dom.cropResultsContainer.querySelectorAll('.crop-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cropId = btn.getAttribute('data-crop');
        // Switch to fertilizer tab if the crop supports calculator
        if (fertilizerNPKGuides[cropId]) {
          dom.cropSelect.value = cropId;
          // Switch tabs
          dom.tabBtnFertilizer.click();
          runFertilizerAnalysis();
          // Scroll target into view
          dom.fertilizerOutputCard.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Send query to chatbot directly
          const prompt = state.lang === 'en' 
            ? `Give me a fertilizer application guide for ${cropId}`
            : `${cropId} பயிருக்கான உர மேலாண்மை கையேட்டை வழங்குக`;
          handleUserSubmit(prompt);
        }
      });
    });

    // Add click listeners to "Start Crop Cycle"
    dom.cropResultsContainer.querySelectorAll('.crop-start-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const cropId = btn.getAttribute('data-crop-id');
        const cropName = btn.getAttribute('data-crop-name');
        
        if (!state.dbInitialized) {
          alert(state.lang === 'en' ? 'Database not initialized.' : 'தரவுத்தளம் இன்னும் தயாராகவில்லை.');
          return;
        }

        const promptText = state.lang === 'en'
          ? `Enter farm field name or location for this ${cropName} cycle:`
          : `இந்த ${cropName} சாகுபடிக்கான நிலத்தின் பெயர் அல்லது இடத்தை குறிப்பிடவும்:`;
          
        const fieldName = prompt(promptText, 'Field A');
        if (!fieldName || fieldName.trim() === '') return;

        const sowingDate = new Date().toISOString().split('T')[0]; // defaults to today
        
        // Load tasks template
        const template = cropTaskTemplates[cropId] || cropTaskTemplates.generic;
        const tasksList = template.map(task => ({
          dayOffset: task.dayOffset,
          taskTitleEn: task.title.en,
          taskTitleTa: task.title.ta,
          fertilizerAdviceEn: task.advice.en,
          fertilizerAdviceTa: task.advice.ta
        }));

        try {
          await AgriDB.saveCropCycle(cropId, cropName, fieldName, sowingDate, tasksList);
          await loadCropCalendar(); // refresh calendar tab
          
          // Switch tabs
          dom.tabBtnCalendar.click();
          
          alert(state.lang === 'en'
            ? `Crop cycle scheduled! Open the "Farm Calendar" tab.`
            : 'பயிர்ச் சாகுபடி நாட்காட்டியில் வெற்றிகரமாகத் தொடங்கப்பட்டது!');
        } catch (err) {
          console.error(err);
        }
      });
    });
  }

  dom.cropOutputCard.classList.add('active');
}

// Generate inline SVG timelines for split applications
function renderSvgTimeline(milestones) {
  const count = milestones.length;
  const padding = 50;
  const width = 500;
  const segment = (width - padding * 2) / (count - 1);
  
  let nodesHtml = '';
  milestones.forEach((m, idx) => {
    const x = padding + idx * segment;
    nodesHtml += `
      <g class="timeline-node completed" transform="translate(${x}, 40)">
        <circle cx="0" cy="0" r="10"></circle>
        <text class="timeline-label" y="-18">${m.day}</text>
        <text class="timeline-sublabel" y="24">${m.label}</text>
        <text class="timeline-sublabel" y="36" style="font-weight:700; fill:var(--primary);">${m.desc}</text>
      </g>
    `;
  });

  return `
    <div class="timeline-container">
      <div class="timeline-title">${state.lang === 'en' ? 'Fertilizer Application Timeline (Days after planting)' : 'உரமிடுதல் காலவரிசை அட்டவணை (நாட்களின் அடிப்படையில்)'}</div>
      <svg class="timeline-svg" viewBox="0 0 500 90">
        <line class="timeline-line-filled" x1="${padding}" y1="40" x2="${width - padding}" y2="40"></line>
        ${nodesHtml}
      </svg>
    </div>
  `;
}

// Calculate Fertilizer Bags based on TNAU NPK ratios and soil deficiency
function runFertilizerAnalysis() {
  const cropId = dom.cropSelect.value;
  const levelN = dom.soilN.value;
  const levelP = dom.soilP.value;
  const levelK = dom.soilK.value;

  const baseNPK = fertilizerNPKGuides[cropId];
  if (!baseNPK) return;

  // Adjust NPK requirements based on soil test
  let reqN = baseNPK.n;
  let reqP = baseNPK.p;
  let reqK = baseNPK.k;

  const adjustNPK = (baseVal, level) => {
    if (level === 'low') return baseVal * 1.25; // Increase by 25% if deficient
    if (level === 'high') return baseVal * 0.75; // Decrease by 25% if rich
    return baseVal;
  };

  reqN = adjustNPK(reqN, levelN);
  reqP = adjustNPK(reqP, levelP);
  reqK = adjustNPK(reqK, levelK);

  // Convert pure nutrient weights to commercial fertilizer weights
  // Urea (46% N), SSP (16% P2O5), MOP (60% K2O)
  const ureaWeight = reqN / 0.46;
  const sspWeight = reqP / 0.16;
  const mopWeight = reqK / 0.60;

  // Convert to 50kg bags
  const ureaBags = (ureaWeight / 50).toFixed(1);
  const sspBags = (sspWeight / 50).toFixed(1);
  const mopBags = (mopWeight / 50).toFixed(1);

  // Display NPK requirement ratio label
  dom.valNpkRatio.textContent = `${reqN.toFixed(0)} - ${reqP.toFixed(0)} - ${reqK.toFixed(0)}`;

  // Update dynamic advice explanation
  let adviceEn = '';
  let adviceTa = '';

  if (cropId === 'paddy') {
    adviceEn = `🌾 **Paddy (Rice) Application Schedule:**<br>1. **Basal Dose (During planting):** Apply 100% of SSP (${sspBags} bags) + 50% of MOP (${(mopBags/2).toFixed(1)} bags). Apply Organic Farmyard Manure (5 tons/acre).<br>2. **First Top Dressing (Tillering - 25 days):** Apply 50% of Urea (${(ureaBags/2).toFixed(1)} bags).<br>3. **Second Top Dressing (Panicle Initiation - 45 days):** Apply remaining Urea (${(ureaBags/2).toFixed(1)} bags) + remaining MOP (${(mopBags/2).toFixed(1)} bags).`;
    adviceTa = `🌾 **நெல் உரமிடல் அட்டவணை:**<br>1. **அடி உரம் (நாற்று நடும் போது):** சூப்பர் பாஸ்பேட் (SSP) முழு அளவு (${sspBags} மூட்டைகள்) + பொட்டாஷ் (MOP) பாதி அளவு (${(mopBags/2).toFixed(1)} மூட்டைகள்). மட்கிய தொழு உரம் (ஏக்கருக்கு 5 டன்) இடவும்.<br>2. **முதல் மேலுரம் (25-ஆம் நாள் - தூர்கட்டும் தருணம்):** யூரியா பாதி அளவு (${(ureaBags/2).toFixed(1)} மூட்டைகள்).<br>3. **இரண்டாம் மேலுரம் (45-ஆம் நாள் - கதிர் உருவாகும் தருணம்):** மீதமுள்ள யூரியா (${(ureaBags/2).toFixed(1)} மூட்டைகள்) + மீதமுள்ள பொட்டாஷ் (${(mopBags/2).toFixed(1)} மூட்டைகள்).`;
  } else if (cropId === 'sugarcane') {
    adviceEn = `🌱 **Sugarcane Fertilizer Schedule:**<br>1. **Basal:** 100% of SSP (${sspBags} bags).<br>2. Nitrogen/Potash splits are key. Apply Urea and MOP in 4 equal splits at 30, 60, 90, and 120 days after planting. Earth up the soil after each application to keep nutrients bound.`;
    adviceTa = `🌱 **கரும்பு உரமிடல் அட்டவணை:**<br>1. **அடி உரம்:** சூப்பர் பாஸ்பேட் (SSP) முழு அளவு (${sspBags} மூட்டைகள்).<br>2. தழைச்சத்து மற்றும் சாம்பல் சத்தை சமமாக பிரித்து விதைத்த 30, 60, 90 மற்றும் 120 நாட்களில் மேலுரமாக இட வேண்டும். ஒவ்வொரு முறை உரமிட்ட பின் மண்ணை அணைத்து விட வேண்டும்.`;
  } else {
    adviceEn = `💡 **General Schedule for ${cropId}:**<br>- Apply all Phosphorus (${sspBags} bags) at sowing as it is slowly released.<br>- Split Urea (${ureaBags} bags) into 2-3 applications to prevent fertilizer leaching. Ensure soil has damp moisture when applying.`;
    adviceTa = `💡 **${cropId} பயிருக்கான பொதுவான வழிகாட்டுதல்:**<br>- பாஸ்பரஸ் உரத்தை (${sspBags} மூட்டைகள்) விதைக்கும் போதே முழுமையாக இட வேண்டும்.<br>- யூரியாவை (${ureaBags} மூட்டைகள்) 2 முதல் 3 முறைகளாகப் பிரித்து இடுவதன் மூலம் சத்துக்கள் வீணாவதைத் தவிர்க்கலாம். ஈரப்பதம் இருக்கும்போது மட்டுமே உரமிடவும்.`;
  }

  // Generate SVG Timeline HTML
  let timelineHtml = '';
  if (cropId === 'paddy') {
    timelineHtml = renderSvgTimeline([
      { day: 'Day 0', label: state.lang === 'en' ? 'Basal' : 'அடி உரம்', desc: `SSP (${sspBags}) + MOP (${(mopBags/2).toFixed(1)})` },
      { day: 'Day 25', label: state.lang === 'en' ? 'Tillering' : 'மேலுரம் 1', desc: `Urea (${(ureaBags/2).toFixed(1)})` },
      { day: 'Day 45', label: state.lang === 'en' ? 'Panicle' : 'மேலுரம் 2', desc: `Urea (${(ureaBags/2).toFixed(1)}) + MOP (${(mopBags/2).toFixed(1)})` }
    ]);
  } else if (cropId === 'sugarcane') {
    timelineHtml = renderSvgTimeline([
      { day: 'Day 0', label: state.lang === 'en' ? 'Basal' : 'அடி உரம்', desc: `SSP (${sspBags})` },
      { day: 'Day 30', label: 'Split 1', desc: `Urea (${(ureaBags/4).toFixed(1)}) + MOP (${(mopBags/4).toFixed(1)})` },
      { day: 'Day 60', label: 'Split 2', desc: `Urea (${(ureaBags/4).toFixed(1)}) + MOP (${(mopBags/4).toFixed(1)})` },
      { day: 'Day 90', label: 'Split 3', desc: `Urea (${(ureaBags/4).toFixed(1)}) + MOP (${(mopBags/4).toFixed(1)})` },
      { day: 'Day 120', label: 'Split 4', desc: `Urea (${(ureaBags/4).toFixed(1)}) + MOP (${(mopBags/4).toFixed(1)})` }
    ]);
  } else {
    timelineHtml = renderSvgTimeline([
      { day: 'Day 0', label: state.lang === 'en' ? 'Basal' : 'அடி உரம்', desc: `SSP (${sspBags})` },
      { day: 'Day 30', label: 'Split 1', desc: `Urea (${(ureaBags/2).toFixed(1)})` },
      { day: 'Day 60', label: 'Split 2', desc: `Urea (${(ureaBags/2).toFixed(1)}) + MOP (${mopBags})` }
    ]);
  }

  dom.fertilizerGuidanceText.innerHTML = (state.lang === 'en' ? adviceEn : adviceTa) + timelineHtml;

  // Add bag result cards to UI
  dom.fertilizerBagsContainer.innerHTML = `
    <div class="bag-card">
      <div class="bag-icon" id="bag-icon-urea"></div>
      <div class="bag-amount">${ureaBags}</div>
      <div class="bag-name">${translations[state.lang]['txt-fertilizer-urea']}</div>
      <span class="bag-sub">~${(ureaWeight).toFixed(0)} kg</span>
    </div>
    <div class="bag-card">
      <div class="bag-icon" id="bag-icon-ssp"></div>
      <div class="bag-amount">${sspBags}</div>
      <div class="bag-name">${translations[state.lang]['txt-fertilizer-ssp']}</div>
      <span class="bag-sub">~${(sspWeight).toFixed(0)} kg</span>
    </div>
    <div class="bag-card">
      <div class="bag-icon" id="bag-icon-mop"></div>
      <div class="bag-amount">${mopBags}</div>
      <div class="bag-name">${translations[state.lang]['txt-fertilizer-mop']}</div>
      <span class="bag-sub">~${(mopWeight).toFixed(0)} kg</span>
    </div>
  `;

  // Inject bag icons
  injectIcon('bag-icon-urea', 'package', 22);
  injectIcon('bag-icon-ssp', 'package', 22);
  injectIcon('bag-icon-mop', 'package', 22);

  dom.fertilizerOutputCard.classList.add('active');
}

// Render Pest & Disease Catalog Guide
function runPestAnalysis() {
  const cropFilter = dom.pestCropFilter.value;
  
  const filtered = cropFilter === 'all' 
    ? pestDatabase 
    : pestDatabase.filter(p => p.crop === cropFilter);
    
  dom.pestCatalogContainer.innerHTML = '';
  
  if (filtered.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.style.gridColumn = '1 / -1';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = 'var(--text-secondary)';
    emptyMsg.style.padding = '2rem 0';
    emptyMsg.textContent = translations[state.lang]['txt-pest-no-results'];
    dom.pestCatalogContainer.appendChild(emptyMsg);
    return;
  }
  
  filtered.forEach(pest => {
    const card = document.createElement('div');
    card.className = 'pest-card';
    
    const cropName = pest.crop.toUpperCase();
    const title = pest.name[state.lang];
    const symptoms = pest.symptoms[state.lang];
    const organic = pest.organic[state.lang];
    const chemical = pest.chemical[state.lang];
    
    card.innerHTML = `
      <div class="pest-header-bar">
        <span class="pest-crop-badge">${cropName}</span>
      </div>
      <span class="pest-title">${title}</span>
      <span class="pest-scientific">${pest.scientific}</span>
      <div class="pest-details-body">
        <div class="pest-section-title">
          <span id="icon-pest-sym-${pest.id}"></span> ${translations[state.lang]['txt-symptoms']}
        </div>
        <p class="pest-desc">${symptoms}</p>
        
        <div class="remedy-badge-container">
          <div class="remedy-pill organic">
            <span class="remedy-pill-title">${translations[state.lang]['txt-control-organic']}</span>
            <span>${organic}</span>
          </div>
          <div class="remedy-pill chemical">
            <span class="remedy-pill-title">${translations[state.lang]['txt-control-chemical']}</span>
            <span>${chemical}</span>
          </div>
        </div>
      </div>
    `;
    
    dom.pestCatalogContainer.appendChild(card);
    
    // Inject alert/check icons into title sections
    injectIcon(`icon-pest-sym-${pest.id}`, 'alert', 14);
  });
}

// Render initial welcome messages
function renderWelcomeMessage() {
  dom.chatMessages.innerHTML = '';
  appendMessage(translations[state.lang]['welcome-msg'], 'bot');
}

// Render dynamic chatbot chips
function renderQuickActionChips() {
  const chipsEn = [
    { text: 'Best Paddy Fertilizer', val: 'What is the fertilizer schedule for paddy?' },
    { text: 'Clay Soil Crops', val: 'Which crops grow well in clayey soil?' },
    { text: 'Tomato Diseases', val: 'Tell me about tomato diseases' },
    { text: 'Rain Advisory', val: 'How to manage crops in heavy rain?' }
  ];
  
  const chipsTa = [
    { text: 'நெல் உர அளவு', val: 'நெற்பயிருக்கு தேவையான உர அளவு என்ன?' },
    { text: 'களிமண் பயிர்கள்', val: 'களிமண்ணுக்கு ஏற்ற சிறந்த பயிர்கள் யாவை?' },
    { text: 'தக்காளி நோய்கள்', val: 'தக்காளியைத் தாக்கும் நோய்களைக் கூறு' },
    { text: 'மழைக்கால எச்சரிக்கை', val: 'கனமழையின் போது பயிரை எவ்வாறு காப்பது?' }
  ];

  const chips = state.lang === 'en' ? chipsEn : chipsTa;
  dom.chatQuickActions.innerHTML = '';
  
  chips.forEach(chip => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = chip.text;
    btn.addEventListener('click', () => {
      handleUserSubmit(chip.val);
    });
    dom.chatQuickActions.appendChild(btn);
  });
}

// Append a chat bubble
function appendMessage(text, sender) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  
  const senderLabel = sender === 'bot' 
    ? translations[state.lang]['bot-sender'] 
    : translations[state.lang]['user-sender'];
    
  msg.innerHTML = `
    <span class="message-sender">${senderLabel}</span>
    <div class="message-content">
      ${text}
    </div>
  `;
  dom.chatMessages.appendChild(msg);
  dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

// Show/Hide typing loader
function toggleTypingIndicator(show) {
  const existing = document.getElementById('typing-loader');
  if (show && !existing) {
    const loader = document.createElement('div');
    loader.className = 'message bot';
    loader.id = 'typing-loader';
    loader.innerHTML = `
      <span class="message-sender">${translations[state.lang]['bot-sender']}</span>
      <div class="message-content" style="padding: 0.5rem 1rem;">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    dom.chatMessages.appendChild(loader);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
  } else if (!show && existing) {
    existing.remove();
  }
}

// Chatbot response handling core
async function handleUserSubmit(text) {
  if (!text || text.trim() === '') return;
  
  appendMessage(text, 'user');
  dom.chatInput.value = '';

  // Persist user query to IndexedDB
  if (state.dbInitialized) {
    await AgriDB.saveChatMessage('user', text);
  }
  
  toggleTypingIndicator(true);
  
  let botReply = '';
  // 1. Check if Gemini API is available
  if (state.geminiKey && state.geminiKey.trim() !== '') {
    try {
      botReply = await fetchGeminiAI(text);
      toggleTypingIndicator(false);
      appendMessage(botReply, 'bot');
    } catch (err) {
      console.error(err);
      toggleTypingIndicator(false);
      // Fallback to local advisor database on API error
      botReply = queryLocalDatabase(text);
      appendMessage(botReply + `<br><br><span style="font-size:0.75rem;opacity:0.6;">(Local advisor fallback - Gemini API Error)</span>`, 'bot');
    }
  } else {
    // 2. Use local offline simulated AI
    await new Promise(resolve => setTimeout(resolve, 800));
    toggleTypingIndicator(false);
    botReply = queryLocalDatabase(text);
    appendMessage(botReply, 'bot');
  }

  // Persist bot reply to IndexedDB
  if (state.dbInitialized) {
    await AgriDB.saveChatMessage('bot', botReply);
  }
}

// Offline Agricultural NLP fallback
function queryLocalDatabase(query) {
  const q = query.toLowerCase();
  const lang = state.lang;
  const db = chatbotLocalKnowledge[lang];

  // Paddy matching
  if (q.includes('paddy') || q.includes('nel') || q.includes('நெல்') || q.includes('நாற்று')) {
    return db.paddy_tips;
  }
  
  // Fertilizer matching
  if (q.includes('fertilizer') || q.includes('urea') || q.includes('ssp') || q.includes('mop') || q.includes('உரம்') || q.includes('யூரியா') || q.includes('சாம்பல் சத்து')) {
    return db.fertilizer_tips;
  }

  // Weather matching
  if (q.includes('weather') || q.includes('rain') || q.includes('wind') || q.includes('climate') || q.includes('வானிலை') || q.includes('மழை') || q.includes('காற்று') || q.includes('வெப்ப')) {
    return db.weather_tips;
  }

  // Disease matching
  if (q.includes('disease') || q.includes('pest') || q.includes('spot') || q.includes('insect') || q.includes('நோய்') || q.includes('பூச்சி') || q.includes('இலை')) {
    return db.disease_tips;
  }

  // Welcome / Greeting
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('vanakkam') || q.includes('வணக்கம்') || q.includes('நலம்')) {
    return db.welcome;
  }

  // Default general help
  return db.general_help;
}

// Fetch live response from Gemini API
async function fetchGeminiAI(userPrompt) {
  const systemPrompt = `You are Agriarivuruthal, a professional agricultural AI chatbot advisor designed to help farmers.
Your objective is to provide highly precise, practical farming answers regarding crops, soil management, fertilizers, weather protection, and pest control.
Always answer in ${state.lang === 'ta' ? 'Tamil (தமிழ்)' : 'English'}. Keep your responses structured with bullet points and bold text where helpful, and keep it under 150 words. Do not refer to yourself as a large language model. Feel like an expert local consultant.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${state.geminiKey}`;
  
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nFarmer Question: ${userPrompt}` }]
      }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Gemini API request failed');
  }

  const data = await response.json();
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error('Invalid response structure');
  }

  // Basic Markdown-to-HTML formatter (specifically for bold and line breaks)
  return candidateText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

// Setup Event Listeners
function setupEventListeners() {
  // Language Switch
  dom.langSelect.addEventListener('change', (e) => {
    state.lang = e.target.value;
    updateLocalization();
    loadPersistedChatLogs();
  });

  // Dark/Light Theme Switch
  dom.btnThemeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', state.theme);
    
    // Toggle Icon
    const themeIcon = state.theme === 'light' ? 'moon' : 'sun';
    injectIcon('icon-theme', themeIcon, 20);
  });

  // Settings Modal toggles
  dom.btnSettingsToggle.addEventListener('click', () => {
    dom.settingsModal.classList.add('active');
    dom.txtGeminiKey.value = state.geminiKey;
    updateModalKeyBadge();
  });

  dom.btnCloseSettings.addEventListener('click', () => {
    dom.settingsModal.classList.remove('active');
  });

  dom.btnSaveSettings.addEventListener('click', () => {
    const key = dom.txtGeminiKey.value.trim();
    state.geminiKey = key;
    localStorage.setItem('gemini_api_key', key);
    dom.settingsModal.classList.remove('active');
  });

  dom.btnClearSettings.addEventListener('click', () => {
    state.geminiKey = '';
    localStorage.removeItem('gemini_api_key');
    dom.txtGeminiKey.value = '';
    updateModalKeyBadge();
  });

  // Clear Chat History Button
  dom.btnClearChat.addEventListener('click', async () => {
    const confirmText = state.lang === 'en' 
      ? 'Are you sure you want to clear all conversational history?' 
      : 'அரட்டை வரலாற்றை முழுமையாக அழிக்க வேண்டுமா?';
    if (confirm(confirmText)) {
      await AgriDB.clearChatHistory();
      renderWelcomeMessage();
    }
  });

  // GPS Weather Lookup Event Listener
  dom.btnGpsWeather.addEventListener('click', () => {
    if (navigator.geolocation) {
      dom.btnGpsWeather.disabled = true;
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          await fetchGpsWeather(lat, lon);
          dom.btnGpsWeather.disabled = false;
        },
        (error) => {
          console.error('Geolocation error:', error);
          const permissionErr = state.lang === 'en'
            ? 'GPS lookup failed or permission denied. Using selected region weather.'
            : 'இருப்பிடச் சேவை மறுக்கப்பட்டது அல்லது தோல்வியுற்றது. தேர்ந்தெடுக்கப்பட்ட மண்டல வானிலை பயன்படுத்தப்படுகிறது.';
          alert(permissionErr);
          dom.btnGpsWeather.disabled = false;
        }
      );
    } else {
      const unsupportedErr = state.lang === 'en'
        ? 'Geolocation is not supported by your browser.'
        : 'உங்கள் உலாவி இருப்பிட சேவையை ஆதரிக்கவில்லை.';
      alert(unsupportedErr);
    }
  });

  // Close settings modal clicking outside
  dom.settingsModal.addEventListener('click', (e) => {
    if (e.target === dom.settingsModal) {
      dom.settingsModal.classList.remove('active');
    }
  });

  // Save Field profile submission
  dom.saveFieldForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = dom.txtFieldName.value.trim();
    if (!name) return;

    await AgriDB.saveFieldProfile(
      name,
      dom.soilSelect.value,
      dom.waterSelect.value,
      dom.seasonSelect.value,
      dom.cropSelect.value,
      dom.soilN.value,
      dom.soilP.value,
      dom.soilK.value
    );

    dom.txtFieldName.value = '';
    await loadSavedFields();
  });

  // Chat message submit
  dom.chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = dom.chatInput.value;
    handleUserSubmit(text);
  });

  // District selector change
  dom.districtSelect.addEventListener('change', (e) => {
    state.selectedDistrict = e.target.value;
    generateWeather();
  });

  // Tabs Switching
  const tabs = [
    { btn: dom.tabBtnCrop, panel: dom.tabCrop, id: 'tab-crop' },
    { btn: dom.tabBtnFertilizer, panel: dom.tabFertilizer, id: 'tab-fertilizer' },
    { btn: dom.tabBtnPests, panel: dom.tabPests, id: 'tab-pests' },
    { btn: dom.tabBtnCalendar, panel: dom.tabCalendar, id: 'tab-calendar' }
  ];

  tabs.forEach(tab => {
    tab.btn.addEventListener('click', () => {
      tabs.forEach(t => {
        t.btn.classList.remove('active');
        t.panel.classList.remove('active');
      });
      tab.btn.classList.add('active');
      tab.panel.classList.add('active');
      state.activeTab = tab.id;
    });
  });

  // Pest crop filter change
  dom.pestCropFilter.addEventListener('change', () => {
    runPestAnalysis();
  });

  // Recommendations forms submissions
  dom.cropForm.addEventListener('submit', (e) => {
    e.preventDefault();
    runCropAnalysis();
  });

  dom.fertilizerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    runFertilizerAnalysis();
  });
}

// Modal helper
function updateModalKeyBadge() {
  if (state.geminiKey && state.geminiKey.trim() !== '') {
    dom.keySuccessBadge.style.display = 'flex';
  } else {
    dom.keySuccessBadge.style.display = 'none';
  }
}

function initSettings() {
  updateModalKeyBadge();
}
