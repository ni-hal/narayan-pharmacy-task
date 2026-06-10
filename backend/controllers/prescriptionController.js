const { v4: uuidv4 } = require("uuid");
const { query, run } = require("../db");
const { checkInteractions } = require("../claude");

const listPrescriptions = async (req, res) => {
  try {
    const prescriptions = query(`
      SELECT p.id, p.patient_name, p.doctor_name, p.prescription_date, p.created_at,
             COUNT(pd.id) as drug_count,
             ic.result_json
      FROM prescriptions p
      LEFT JOIN prescription_drugs pd ON pd.prescription_id = p.id
      LEFT JOIN interaction_cache ic ON ic.drug_key = (
        SELECT GROUP_CONCAT(pd2.drug_name || '|' || pd2.dosage, ',')
        FROM prescription_drugs pd2
        WHERE pd2.prescription_id = p.id
        ORDER BY pd2.drug_name
      )
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    res.json(
      prescriptions.map((p) => ({
        id: p.id,
        patient_name: p.patient_name,
        doctor_name: p.doctor_name,
        prescription_date: p.prescription_date,
        created_at: p.created_at,
        drug_count: p.drug_count,
        overall_severity: p.result_json ? JSON.parse(p.result_json).overall_severity : null,
      }))
    );
  } catch (err) {
    console.error("GET /prescriptions error:", err);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};

const getPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = query("SELECT * FROM prescriptions WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ error: "Prescription not found" });

    const drugs = query(
      "SELECT * FROM prescription_drugs WHERE prescription_id = ? ORDER BY drug_name",
      [id]
    );

    const drugKey = drugs.map((d) => `${d.drug_name}|${d.dosage}`).join(",");
    let interaction = null;
    if (drugKey) {
      const cached = query("SELECT result_json FROM interaction_cache WHERE drug_key = ?", [drugKey]);
      if (cached.length) interaction = JSON.parse(cached[0].result_json);
    }

    res.json({ ...rows[0], drugs, interaction });
  } catch (err) {
    console.error("GET /prescriptions/:id error:", err);
    res.status(500).json({ error: "Failed to fetch prescription details" });
  }
};

const createPrescription = async (req, res) => {
  try {
    const { patient_name, doctor_name, prescription_date, drugs } = req.body;

    if (!patient_name || !doctor_name || !prescription_date)
      return res.status(400).json({ error: "Patient name, doctor name, and date are required" });
    if (!drugs || !Array.isArray(drugs) || drugs.length === 0)
      return res.status(400).json({ error: "At least one drug is required" });
    for (const d of drugs) {
      if (!d.drug_name || !d.dosage)
        return res.status(400).json({ error: "Each drug must have a name and dosage" });
    }

    const sortedDrugs = [...drugs].sort((a, b) => a.drug_name.localeCompare(b.drug_name));
    const drugKey = sortedDrugs.map((d) => `${d.drug_name}|${d.dosage}`).join(",");

    let interaction = null;
    const cached = query("SELECT result_json FROM interaction_cache WHERE drug_key = ?", [drugKey]);

    if (cached.length) {
      interaction = JSON.parse(cached[0].result_json);
    } else if (drugs.length >= 2) {
      try {
        interaction = await checkInteractions(sortedDrugs);
        if (interaction)
          run("INSERT INTO interaction_cache (drug_key, result_json, created_at) VALUES (?, ?, ?)", [
            drugKey,
            JSON.stringify(interaction),
            new Date().toISOString(),
          ]);
      } catch (aiErr) {
        console.error("Claude API error:", aiErr);
        interaction = { error: "Interaction check unavailable at this time. Please consult a pharmacist." };
      }
    }

    const prescriptionId = uuidv4();
    const now = new Date().toISOString();

    run(
      "INSERT INTO prescriptions (id, patient_name, doctor_name, prescription_date, created_at) VALUES (?, ?, ?, ?, ?)",
      [prescriptionId, patient_name, doctor_name, prescription_date, now]
    );
    for (const drug of drugs)
      run("INSERT INTO prescription_drugs (id, prescription_id, drug_name, dosage) VALUES (?, ?, ?, ?)", [
        uuidv4(),
        prescriptionId,
        drug.drug_name,
        drug.dosage,
      ]);

    res.status(201).json({ id: prescriptionId, patient_name, doctor_name, prescription_date, created_at: now, drugs, interaction });
  } catch (err) {
    console.error("POST /prescriptions error:", err);
    res.status(500).json({ error: "Failed to save prescription" });
  }
};

module.exports = { listPrescriptions, getPrescription, createPrescription };
