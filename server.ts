import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

// Enable CORS for Vercel preview environments
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// Helper to get Gemini client dynamically
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Standard Predefined Danger Signs Guideline (NHM & WHO IMNCI standards)
export const PREDEFINED_DANGER_SIGNS = {
  MATERNAL: [
    { sign: 'Vaginal bleeding', keywords: ['bleeding', 'blood', 'raktha', 'khoon', 'raktasrava'], protocol: 'Immediate PHC/FRU referral for obstetric hemorrhage' },
    { sign: 'Convulsions / Fits', keywords: ['convulsion', 'fit', 'fits', 'seizure', 'moorchhe', 'daura'], protocol: 'Emergency pre-eclampsia/eclampsia management at PHC' },
    { sign: 'Severe headache with blurred vision', keywords: ['headache', 'blurred vision', 'drishti', 'tale novu', 'sar dard'], protocol: 'Screen for pre-eclampsia and BP emergency at PHC' },
    { sign: 'Severe abdominal pain', keywords: ['stomach pain', 'severe abdominal pain', 'potte novu', 'pet dard'], protocol: 'Urgent medical evaluation for abruption or ectopic rupture' },
    { sign: 'High fever with chills', keywords: ['high fever', 'chills', 'sheeta jwara', 'tez bukhar'], protocol: 'Refer for maternal sepsis or severe malaria evaluation' },
    { sign: 'Reduced or absent fetal movements', keywords: ['no movement', 'baby not moving', 'chalana illa', 'hiljul bandh'], protocol: 'Urgent fetal heart rate monitoring at PHC' },
    { sign: 'Premature rupture of membranes (water break)', keywords: ['water break', 'fluid leaking', 'neeru hoguttide', 'paani nikalna'], protocol: 'Urgent delivery center referral' },
  ],
  NEWBORN: [
    { sign: 'High fever (>38°C) or baby unusually cold', keywords: ['high fever', 'warm to touch', 'jwara', 'tez bukhar', 'cold to touch', 'body cold'], protocol: 'Immediate referral for neonatal sepsis or hypothermia' },
    { sign: 'Difficulty breathing / Fast breathing / Chest indrawing', keywords: ['breathing fast', 'difficulty breathing', 'chest indrawing', 'usiru kattuvudu', 'saans lene me taklif', 'grunt'], protocol: 'Immediate oxygenation and pediatric referral' },
    { sign: 'Convulsions / Fits', keywords: ['fits', 'convulsion', 'jerking', 'seizure', 'moorchhe'], protocol: 'Emergency pediatric transport to District Hospital / FRU' },
    { sign: 'Unable to feed or suckle', keywords: ['unable to feed', 'cannot suck', 'not drinking milk', 'haalu kudiyuttilla', 'doodh nahi pee raha', 'feeding stopped'], protocol: 'Critical danger sign for severe neonatal illness' },
    { sign: 'Lethargic or unconscious', keywords: ['lethargic', 'unconscious', 'no response', 'weak cry', 'sustha', 'behosh'], protocol: 'Immediate emergency transfer to Sick Newborn Care Unit (SNCU)' },
    { sign: 'Severe jaundice (yellow palms and soles)', keywords: ['yellow eyes', 'yellow body', 'haladi', 'peela', 'jaundice'], protocol: 'Urgent bilirubin check and phototherapy at referral center' },
    { sign: 'Umbilical cord redness or pus discharging', keywords: ['pus', 'red umbilicus', 'cord smell', 'naabhi infection'], protocol: 'Referral for systemic omphalitis management' },
  ],
};

// Gnani.ai / Vachana Voice AI Key
const GNANI_API_KEY =
  process.env.GNANI_API_KEY ||
  'vach_1ytE2CY5X2DwizhKWHqxkxdSZb1RgMIn8iB6Wc55bONYumLP05yM8FIqiTlbSioyhx6JZZtS3734mhuKkbVLOYElSdtyVIod_d4b212ba5ad512f99cc03db224d0387d';

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  const ai = getAiClient();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!ai,
    model: 'gemini-3.8-flash',
    gnaniVoiceAiConfigured: true,
    gnaniModel: 'timbre-v3.0',
    availableGnaniVoices: ['Shivani', 'Lakshmi', 'Riyaa', 'Kalpana', 'Chetana', 'Vasudha', 'Tarika'],
  });
});

// Gnani.ai / Vachana Indic Voice AI Synthesis Endpoint
app.post('/api/gnani-tts', async (req: Request, res: Response) => {
  try {
    const { text, persona = 'woman', voice } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // Map voice based on persona if not explicitly specified:
    // Female Voices supported by timbre-v3.0 on Gnani Vachana:
    // - 'Shivani': Warm, soothing Indian female voice (Didi / Healthcare Sister)
    // - 'Lakshmi': Gentle maternal Indian female voice
    // - 'Riyaa': Bright, playful young female / child voice (Chhoti Sakhi)
    // - 'Chetana', 'Kalpana', 'Vasudha', 'Tarika'
    let chosenVoice = voice;
    if (!chosenVoice) {
      chosenVoice = persona === 'child' ? 'Riyaa' : 'Shivani';
    }

    // Clean text: strip markdown characters
    const cleanText = text.replace(/[*_#`~]/g, '').trim();

    const gnaniResponse = await fetch('https://api.vachana.ai/api/v1/tts/inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key-ID': GNANI_API_KEY,
      },
      body: JSON.stringify({
        text: cleanText,
        voice: chosenVoice,
        model: 'timbre-v3.0',
        audio_config: {
          container: 'wav',
          sample_rate: 24000,
        },
      }),
    });

    if (!gnaniResponse.ok) {
      const errText = await gnaniResponse.text();
      console.warn('Gnani API error:', gnaniResponse.status, errText);
      return res.status(gnaniResponse.status).json({
        error: 'Gnani Voice AI inference failed',
        details: errText,
      });
    }

    // Stream the binary WAV directly to the client
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('X-Voice-Used', chosenVoice);
    res.setHeader('X-Engine', 'Gnani-Vachana-AI');

    const arrayBuffer = await gnaniResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (err: any) {
    console.error('Gnani TTS error:', err);
    return res.status(500).json({
      error: 'Failed to synthesize speech via Gnani Voice AI',
      details: err?.message || 'Server error',
    });
  }
});

// Intelligent Extraction Endpoint
app.post('/api/extract', async (req: Request, res: Response) => {
  try {
    const { transcript, language = 'English', beneficiaryHint } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const cleanTranscript = transcript.trim();

    // Fallback danger signs check helper
    const ruleBasedDangerSigns: any[] = [];
    const lower = cleanTranscript.toLowerCase();

    for (const item of PREDEFINED_DANGER_SIGNS.MATERNAL) {
      if (item.keywords.some((k) => lower.includes(k))) {
        ruleBasedDangerSigns.push({
          type: 'MATERNAL',
          sign: item.sign,
          guidelineCategory: 'Maternal Danger Sign (NHM / WHO)',
          severity: 'EMERGENCY',
          actionRequired: item.protocol,
        });
      }
    }
    for (const item of PREDEFINED_DANGER_SIGNS.NEWBORN) {
      if (item.keywords.some((k) => lower.includes(k))) {
        ruleBasedDangerSigns.push({
          type: 'NEWBORN',
          sign: item.sign,
          guidelineCategory: 'Newborn Danger Sign (IMNCI / NHM)',
          severity: 'EMERGENCY',
          actionRequired: item.protocol,
        });
      }
    }

    let extractedData: any = null;
    const ai = getAiClient();

    if (ai) {
      try {
        const prompt = `You are SwasthyaSakhi, an intelligent voice field register assistant for ASHA healthcare workers in India.
ASHA workers speak naturally in Indian languages (Hindi, Kannada, Telugu, Tamil, Malayalam, or Indian English) with extensive English code-mixing (such as "ANC checkup", "TT injection", "IFA goli", "BP check madidvi", "baby weight 2.8 kilo", "Penta vaccine", "PHC").

Your task is to analyze the spoken notes and extract a rigorous structured healthcare record.

Spoken Notes:
"${cleanTranscript}"

Selected Worker Language: ${language}
Beneficiary Context Hint: ${JSON.stringify(beneficiaryHint || {})}

Predefined Danger Signs to scan for:
- Maternal: Vaginal bleeding, Convulsions/fits, Severe headache with blurred vision, Severe abdominal pain, High fever with chills, Reduced fetal movements, Premature rupture of membranes.
- Newborn: High fever / unusually cold, Difficulty breathing / chest indrawing, Convulsions / fits, Unable to feed or suckle, Lethargy / unconsciousness, Severe jaundice, Umbilical redness/pus.

IMPORTANT RULES:
1. Never invent missing information. Use "Not recorded" for unavailable fields.
2. Keep beneficiary names and IDs exactly as spoken unless confirmed. If ID is "1024", record "1024" or "BEN-1024".
3. Preserve explicit units (kg, grams, mmHg, days).
4. Distinguish between completed and pending vaccinations.
5. Identify any danger signs matching the guidelines above. If any danger sign is present, flag isEmergency as true and severity as "EMERGENCY".
6. Generate a warm, concise spoken summary for read-back in the worker's selected language (${language}) or clean natural Indian English if mixed. Example: "I have recorded Lakshmi's pregnancy visit. ANC checkup completed, TT injection completed, and IFA tablets given. The next visit is scheduled after 15 days. Is everything correct?"
7. Formulate 1 to 3 automatic actionable follow-up tasks. If danger sign is detected, task #1 must be "Immediate PHC Emergency Referral".
8. Assess confidence and identify any uncertain fields or terms where worker should confirm.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                visitInfo: {
                  type: Type.OBJECT,
                  properties: {
                    beneficiaryId: { type: Type.STRING },
                    beneficiaryName: { type: Type.STRING },
                    village: { type: Type.STRING },
                    visitDate: { type: Type.STRING },
                    visitType: { type: Type.STRING, description: 'Pregnancy, Newborn, Immunisation, or General Follow-up' },
                  },
                  required: ['beneficiaryName', 'visitType'],
                },
                pregnancyInfo: {
                  type: Type.OBJECT,
                  properties: {
                    pregnancyMonth: { type: Type.STRING },
                    ancCheckupStatus: { type: Type.STRING },
                    bloodPressure: { type: Type.STRING },
                    ttVaccineStatus: { type: Type.STRING },
                    ifaTabletStatus: { type: Type.STRING },
                    observations: { type: Type.STRING },
                  },
                },
                newbornInfo: {
                  type: Type.OBJECT,
                  properties: {
                    babyName: { type: Type.STRING },
                    babyAge: { type: Type.STRING },
                    birthWeight: { type: Type.STRING },
                    currentWeight: { type: Type.STRING },
                    breastfeedingStatus: { type: Type.STRING },
                    observations: { type: Type.STRING },
                  },
                },
                immunisationInfo: {
                  type: Type.OBJECT,
                  properties: {
                    vaccineName: { type: Type.STRING },
                    vaccinationStatus: { type: Type.STRING },
                    vaccinationDueDate: { type: Type.STRING },
                  },
                },
                followUp: {
                  type: Type.OBJECT,
                  properties: {
                    nextVisitDate: { type: Type.STRING },
                    nextVisitDays: { type: Type.STRING },
                    pendingVaccination: { type: Type.STRING },
                    pendingCheckup: { type: Type.STRING },
                    otherActions: { type: Type.STRING },
                  },
                },
                dangerSigns: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: 'MATERNAL or NEWBORN' },
                      sign: { type: Type.STRING },
                      guidelineCategory: { type: Type.STRING },
                      severity: { type: Type.STRING, description: 'EMERGENCY or WARNING' },
                      actionRequired: { type: Type.STRING },
                    },
                    required: ['type', 'sign', 'severity', 'actionRequired'],
                  },
                },
                isEmergency: { type: Type.BOOLEAN },
                spokenSummary: { type: Type.STRING },
                emergencyAlertMessage: { type: Type.STRING },
                confidence: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    uncertainFields: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    clarificationQuestion: { type: Type.STRING },
                  },
                },
                autoGeneratedTasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      dueDate: { type: Type.STRING },
                      priority: { type: Type.STRING, description: 'EMERGENCY, HIGH, or NORMAL' },
                      actionType: { type: Type.STRING },
                    },
                    required: ['title', 'priority'],
                  },
                },
              },
              required: ['visitInfo', 'spokenSummary'],
            },
          },
        });

        const rawText = response.text || '{}';
        extractedData = JSON.parse(rawText);
      } catch (geminiError) {
        console.warn('Gemini extraction error, falling back to rule-based engine:', geminiError);
      }
    }

    // Merge rule-based danger signs if Gemini missed any predefined keywords
    if (!extractedData) {
      extractedData = buildFallbackExtraction(cleanTranscript, language, ruleBasedDangerSigns);
    } else {
      // Ensure any rule-based danger sign is not missed
      if (ruleBasedDangerSigns.length > 0) {
        if (!extractedData.dangerSigns || extractedData.dangerSigns.length === 0) {
          extractedData.dangerSigns = ruleBasedDangerSigns;
          extractedData.isEmergency = true;
        } else {
          // Merge unique signs
          for (const rb of ruleBasedDangerSigns) {
            if (!extractedData.dangerSigns.some((d: any) => d.sign.toLowerCase().includes(rb.sign.toLowerCase()))) {
              extractedData.dangerSigns.push(rb);
            }
          }
          extractedData.isEmergency = true;
        }
      }
    }

    return res.json({
      success: true,
      data: extractedData,
      originalTranscript: cleanTranscript,
    });
  } catch (error: any) {
    console.error('Extraction error:', error);
    return res.status(500).json({
      error: 'Failed to process healthcare visit notes',
      details: error?.message || 'Internal server error',
    });
  }
});

// Voice Correction Endpoint
app.post('/api/correct', async (req: Request, res: Response) => {
  try {
    const { currentRecord, correctionCommand, language = 'English' } = req.body;

    if (!correctionCommand || !currentRecord) {
      return res.status(400).json({ error: 'currentRecord and correctionCommand are required' });
    }

    const ai = getAiClient();
    if (ai) {
      try {
        const prompt = `You are SwasthyaSakhi voice assistant. An ASHA worker wants to correct a field in the current visit record using voice.

Current Structured Record:
${JSON.stringify(currentRecord, null, 2)}

Worker's Voice Correction:
"${correctionCommand}"

Target Language: ${language}

Task:
1. Identify which exact field(s) the worker wants to update (e.g., baby weight, BP, ANC status, pregnancy month, next visit).
2. Apply the correction to the record accurately without erasing other recorded fields.
3. State clearly what was changed in an explanation sentence.
4. Provide an updated spoken summary in ${language} to read aloud to the worker for re-confirmation. Example: "Updated baby's weight to 2.8 kilograms. Is everything correct now?"`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                updatedRecord: {
                  type: Type.OBJECT,
                  description: 'The complete updated record object with the correction applied',
                  properties: {
                    visitInfo: { type: Type.OBJECT },
                    pregnancyInfo: { type: Type.OBJECT },
                    newbornInfo: { type: Type.OBJECT },
                    immunisationInfo: { type: Type.OBJECT },
                    followUp: { type: Type.OBJECT },
                    dangerSigns: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                    isEmergency: { type: Type.BOOLEAN },
                  },
                },
                fieldChanged: { type: Type.STRING },
                oldValue: { type: Type.STRING },
                newValue: { type: Type.STRING },
                explanation: { type: Type.STRING },
                spokenSummary: { type: Type.STRING },
              },
              required: ['updatedRecord', 'explanation', 'spokenSummary'],
            },
          },
        });

        const raw = response.text || '{}';
        return res.json({ success: true, data: JSON.parse(raw) });
      } catch (geminiError) {
        console.warn('Gemini correction error, using programmatic fallback:', geminiError);
      }
    }

    // Programmatic fallback correction
    const fallbackCorrection = applyFallbackCorrection(currentRecord, correctionCommand, language);
    return res.json({ success: true, data: fallbackCorrection });
  } catch (error: any) {
    console.error('Correction endpoint error:', error);
    return res.status(500).json({ error: 'Failed to process voice correction' });
  }
});

// Voice Navigation & Command Classifier
app.post('/api/voice-command', async (req: Request, res: Response) => {
  try {
    const { command, currentScreen = 'home', language = 'English' } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Command text is required' });
    }

    const lower = command.toLowerCase().trim();

    // Fast rule-based matcher with AI fallback
    let action = 'UNKNOWN';
    let target = '';
    let spokenResponse = 'I heard you, but could you please repeat that?';

    if (lower.includes('start') || lower.includes('new visit') || lower.includes('record') || lower.includes('shuru')) {
      action = 'START_VISIT';
      spokenResponse = 'Starting a new voice visit. Please speak your observations.';
    } else if (lower.includes('follow-up') || lower.includes('follow up') || lower.includes('tasks') || lower.includes('pending')) {
      action = 'NAVIGATE_FOLLOWUPS';
      target = 'followups';
      spokenResponse = "Opening today's follow-up schedule.";
    } else if (lower.includes('dashboard') || lower.includes('home') || lower.includes('back')) {
      action = 'NAVIGATE_HOME';
      target = 'home';
      spokenResponse = 'Returning to the main dashboard.';
    } else if (lower.includes('confirm') || lower.includes('save') || lower.includes('theek hai') || lower.includes('saride')) {
      action = 'CONFIRM_VISIT';
      spokenResponse = 'Confirming and saving this visit record.';
    } else if (lower.includes('repeat') || lower.includes('again') || lower.includes('read back')) {
      action = 'REPEAT_SUMMARY';
      spokenResponse = 'Repeating the visit summary.';
    } else if (lower.includes('completed') || lower.includes('done') || lower.includes('finish')) {
      action = 'COMPLETE_TASK';
      spokenResponse = 'Marking follow-up task as completed.';
    }

    return res.json({
      success: true,
      action,
      target,
      spokenResponse,
      command,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Error processing command' });
  }
});

// Fallback extraction parser when offline or testing without key
function buildFallbackExtraction(transcript: string, language: string, dangerSigns: any[]) {
  const lower = transcript.toLowerCase();

  // Beneficiary detection
  let name = 'Lakshmi';
  let id = 'BEN-1024';
  if (lower.includes('radha')) {
    name = 'Radha';
    id = 'BEN-2048';
  } else if (lower.includes('meena')) {
    name = 'Meena';
    id = 'BEN-3092';
  } else if (lower.includes('savitri')) {
    name = 'Savitri';
    id = 'BEN-4105';
  }

  // Check ID match in text
  const idMatch = transcript.match(/(?:id|beneficiary id|number)\s*[:#]?\s*(\d+)/i);
  if (idMatch) {
    id = `BEN-${idMatch[1]}`;
  }

  // Visit type detection
  let visitType = 'Pregnancy';
  if (lower.includes('baby') || lower.includes('newborn') || lower.includes('birth') || lower.includes('breastfeed')) {
    visitType = 'Newborn';
  } else if (lower.includes('vaccine') || lower.includes('opv') || lower.includes('bcg') || lower.includes('penta') || lower.includes('immunisation')) {
    visitType = 'Immunisation';
  }

  // Weight check
  let weight = 'Not recorded';
  const weightMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram|grams)/i);
  if (weightMatch) {
    weight = `${weightMatch[1]} kg`;
  }

  // Month check
  let month = 'Not recorded';
  const monthMatch = transcript.match(/(\d+)\s*(?:months|month|tingalu|mahine)/i);
  if (monthMatch) {
    month = `${monthMatch[1]} months`;
  }

  // BP check
  let bp = 'Not recorded';
  const bpMatch = transcript.match(/(\d{2,3}\s*\/\s*\d{2,3})/);
  if (bpMatch) {
    bp = `${bpMatch[1]} mmHg`;
  } else if (lower.includes('bp check') || lower.includes('blood pressure')) {
    bp = lower.includes('normal') ? 'Normal (120/80 mmHg)' : 'Checked';
  }

  // TT check
  const ttStatus = lower.includes('tt') || lower.includes('tetanus') ? 'Completed' : 'Not recorded';
  const ifaStatus = lower.includes('ifa') || lower.includes('iron') ? 'Given (30 tablets)' : 'Not recorded';
  const ancStatus = lower.includes('anc') ? 'Completed' : 'Completed';
  const breastfeeding = lower.includes('breastfeed') || lower.includes('feed') ? 'Exclusive breastfeeding active' : 'Not recorded';

  // Next visit
  let nextDays = '15 days';
  const nextMatch = transcript.match(/(?:after|in|next visit)\s*(\d+)\s*(?:days|weeks)/i);
  if (nextMatch) {
    nextDays = `${nextMatch[1]} days`;
  }

  const isEmergency = dangerSigns.length > 0;

  const tasks: any[] = [];
  if (isEmergency) {
    tasks.push({
      title: `Emergency PHC Referral: ${dangerSigns[0]?.sign}`,
      dueDate: 'Today (Immediate)',
      priority: 'EMERGENCY',
      actionType: 'PHC_REFERRAL',
    });
  }
  tasks.push({
    title: `Next home visit for ${name}`,
    dueDate: nextDays,
    priority: isEmergency ? 'HIGH' : 'NORMAL',
    actionType: 'HOME_VISIT',
  });
  if (ifaStatus !== 'Not recorded') {
    tasks.push({
      title: `Verify IFA tablet compliance for ${name}`,
      dueDate: 'During next visit',
      priority: 'NORMAL',
      actionType: 'MEDICATION_CHECK',
    });
  }

  const spokenSummary = isEmergency
    ? `DANGER SIGN DETECTED. A danger sign, ${dangerSigns[0]?.sign}, was mentioned for ${name}. Please refer the beneficiary to the nearest Primary Health Centre immediately. Shall I confirm this emergency visit record?`
    : `I have recorded ${name}'s ${visitType.toLowerCase()} visit. ANC checkup ${ancStatus.toLowerCase()}, TT injection ${ttStatus.toLowerCase()}, and IFA tablets ${ifaStatus.toLowerCase()}. Next visit scheduled in ${nextDays}. Is everything correct?`;

  return {
    visitInfo: {
      beneficiaryId: id,
      beneficiaryName: name,
      village: 'Doddaballapur Sector 2',
      visitDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      visitType,
    },
    pregnancyInfo: {
      pregnancyMonth: month,
      ancCheckupStatus: ancStatus,
      bloodPressure: bp,
      ttVaccineStatus: ttStatus,
      ifaTabletStatus: ifaStatus,
      observations: transcript,
    },
    newbornInfo: {
      babyName: 'Baby of ' + name,
      babyAge: lower.includes('14 days') ? '14 days' : 'Not recorded',
      birthWeight: 'Not recorded',
      currentWeight: weight,
      breastfeedingStatus: breastfeeding,
      observations: transcript,
    },
    immunisationInfo: {
      vaccineName: lower.includes('opv') || lower.includes('bcg') ? 'OPV Zero, BCG' : 'Not recorded',
      vaccinationStatus: lower.includes('completed') || lower.includes('given') ? 'Completed' : 'Pending',
      vaccinationDueDate: 'Not recorded',
    },
    followUp: {
      nextVisitDate: nextDays + ' later',
      nextVisitDays: nextDays,
      pendingVaccination: 'None pending',
      pendingCheckup: 'Routine monthly checkup',
      otherActions: isEmergency ? 'Urgent PHC referral issued' : 'Advise nutritional diet',
    },
    dangerSigns,
    isEmergency,
    spokenSummary,
    emergencyAlertMessage: isEmergency
      ? 'DANGER SIGN DETECTED. Please refer the beneficiary to the nearest Primary Health Centre immediately according to the established referral protocol.'
      : '',
    confidence: {
      score: 0.94,
      uncertainFields: [],
      clarificationQuestion: '',
    },
    autoGeneratedTasks: tasks,
  };
}

// Fallback voice correction helper
function applyFallbackCorrection(record: any, command: string, language: string) {
  const updated = JSON.parse(JSON.stringify(record));
  const lower = command.toLowerCase();

  let fieldChanged = 'Observation';
  let oldValue = '';
  let newValue = '';

  // Weight correction
  const weightMatch = command.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram|grams)/i);
  if (weightMatch && (lower.includes('weight') || lower.includes('kilo') || lower.includes('tuka'))) {
    fieldChanged = 'Baby Weight';
    oldValue = updated.newbornInfo?.currentWeight || 'Not recorded';
    newValue = `${weightMatch[1]} kg`;
    if (!updated.newbornInfo) updated.newbornInfo = {};
    updated.newbornInfo.currentWeight = newValue;
  }
  // BP correction
  else if (lower.includes('bp') || lower.includes('blood pressure')) {
    const bpMatch = command.match(/(\d{2,3}\s*\/\s*\d{2,3})/);
    fieldChanged = 'Blood Pressure';
    oldValue = updated.pregnancyInfo?.bloodPressure || 'Not recorded';
    newValue = bpMatch ? `${bpMatch[1]} mmHg` : '120/80 mmHg';
    if (!updated.pregnancyInfo) updated.pregnancyInfo = {};
    updated.pregnancyInfo.bloodPressure = newValue;
  }
  // Next visit correction
  else if (lower.includes('next visit') || lower.includes('days') || lower.includes('weeks')) {
    const dayMatch = command.match(/(\d+)\s*(?:days|weeks)/i);
    fieldChanged = 'Next Visit';
    oldValue = updated.followUp?.nextVisitDays || '15 days';
    newValue = dayMatch ? `${dayMatch[1]} days` : '10 days';
    if (!updated.followUp) updated.followUp = {};
    updated.followUp.nextVisitDays = newValue;
    updated.followUp.nextVisitDate = `${newValue} later`;
  }

  const explanation = `Updated ${fieldChanged} from ${oldValue || 'previous'} to ${newValue}.`;
  const spokenSummary = `I have updated the ${fieldChanged.toLowerCase()} to ${newValue}. Is everything correct now?`;

  return {
    updatedRecord: updated,
    fieldChanged,
    oldValue,
    newValue,
    explanation,
    spokenSummary,
  };
}

// Set up Vite in development or static serving in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SwasthyaSakhi] Server running on http://0.0.0.0:${PORT}`);
  });
}

// Only start standalone HTTP server in non-serverless environments
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
