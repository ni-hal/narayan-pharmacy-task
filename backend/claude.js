const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function checkInteractions(drugs) {
  if (!drugs || drugs.length < 2) return null;

  const drugList = drugs.map((d) => `- ${d.drug_name} ${d.dosage}`).join("\n");

  const prompt = `You are a clinical pharmacist reviewing a prescription for potential drug-drug interactions.

Drugs prescribed:
${drugList}

Analyze ALL pairwise drug-drug interactions. For each interaction found, assess the mechanism, clinical significance, and recommended pharmacist management.

Respond ONLY with a valid JSON object (no markdown, no text outside JSON):
{
  "has_interactions": true or false,
  "overall_severity": "None" | "Mild" | "Moderate" | "Severe",
  "summary": "One-sentence clinical summary for the pharmacist",
  "interactions": [
    {
      "drug_a": "Drug name",
      "drug_b": "Drug name",
      "severity": "Mild" | "Moderate" | "Severe",
      "mechanism": "Brief mechanism description",
      "clinical_effect": "What may happen to the patient",
      "management": "Recommended action for the pharmacist or prescriber"
    }
  ],
  "safe_to_dispense": true or false,
  "pharmacist_note": "Any additional clinical note or null"
}

If no interactions exist, return has_interactions: false, overall_severity: "None", interactions: [], safe_to_dispense: true.`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
  });

  const text = response.text.trim();
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    return {
      error: "Interaction analysis returned an unexpected format. Please consult a pharmacist.",
    };
  }
}

module.exports = { checkInteractions };
