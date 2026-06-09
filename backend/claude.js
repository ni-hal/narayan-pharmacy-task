const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Given a list of drugs, returns structured interaction data.
 * Returns null if fewer than 2 drugs are provided.
 */
async function checkInteractions(drugs) {
  if (!drugs || drugs.length < 2) {
    return null;
  }

  const drugList = drugs
    .map((d) => `- ${d.drug_name} ${d.dosage}`)
    .join("\n");

  const prompt = `You are a clinical pharmacist reviewing a prescription for potential drug-drug interactions.

Drugs prescribed:
${drugList}

Analyze ALL pairwise drug-drug interactions for this prescription. For each interaction found, assess:
1. The mechanism of interaction
2. Clinical significance
3. Recommended management

Respond ONLY with a valid JSON object (no markdown, no explanation outside JSON) in this exact structure:
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

If there are no interactions, return has_interactions: false, overall_severity: "None", interactions: [], and safe_to_dispense: true.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].text.trim();

  // Strip any accidental markdown fences
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  const result = JSON.parse(clean);
  return result;
}

module.exports = { checkInteractions };
