import { useState } from "react";
import { useRouter } from "next/router";
import InteractionResult from "../components/InteractionResult";
import ErrorBanner from "../components/ErrorBanner";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const emptyDrug = () => ({ id: Date.now() + Math.random(), drug_name: "", dosage: "" });

export default function NewPrescription() {
  const router = useRouter();
  const [form, setForm] = useState({
    patient_name: "",
    doctor_name: "",
    prescription_date: new Date().toISOString().split("T")[0],
  });
  const [drugs, setDrugs] = useState([emptyDrug(), emptyDrug()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  function updateDrug(id, field, value) {
    setDrugs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  }

  function addDrug() {
    setDrugs((prev) => [...prev, emptyDrug()]);
  }

  function removeDrug(id) {
    setDrugs((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSaved(false);

    const validDrugs = drugs.filter(
      (d) => d.drug_name.trim() && d.dosage.trim()
    );

    if (!form.patient_name.trim() || !form.doctor_name.trim()) {
      setError("Patient name and doctor name are required.");
      return;
    }
    if (validDrugs.length === 0) {
      setError("Please add at least one drug with a name and dosage.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API}/api/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          drugs: validDrugs.map(({ drug_name, dosage }) => ({ drug_name, dosage })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save prescription");
      }

      setResult(data.interaction);
      setSaved(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm({
      patient_name: "",
      doctor_name: "",
      prescription_date: new Date().toISOString().split("T")[0],
    });
    setDrugs([emptyDrug(), emptyDrug()]);
    setResult(null);
    setSaved(false);
    setError(null);
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1 className="page-title">New Prescription</h1>
        <p className="page-sub">
          Enter prescription details — drug interactions will be checked automatically
        </p>
      </div>

      <ErrorBanner message={error} />

      {saved && !error && (
        <div className="success-flash">
          ✓ Prescription saved successfully
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="patient_name">Patient Name</label>
              <input
                id="patient_name"
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={form.patient_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, patient_name: e.target.value }))
                }
                disabled={submitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="doctor_name">Prescribing Doctor</label>
              <input
                id="doctor_name"
                type="text"
                placeholder="e.g. Dr. Priya Menon"
                value={form.doctor_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, doctor_name: e.target.value }))
                }
                disabled={submitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="prescription_date">Prescription Date</label>
              <input
                id="prescription_date"
                type="date"
                value={form.prescription_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, prescription_date: e.target.value }))
                }
                disabled={submitting}
              />
            </div>
          </div>

          {/* Drug list */}
          <div className="drugs-section">
            <div className="section-label">Prescribed Drugs</div>
            <div className="drug-row-header">
              <label style={{ textTransform: "none", fontSize: "0.78rem", color: "var(--muted)" }}>
                Drug Name
              </label>
              <label style={{ textTransform: "none", fontSize: "0.78rem", color: "var(--muted)" }}>
                Dosage (e.g. 500mg twice daily)
              </label>
              <span />
            </div>

            {drugs.map((drug, idx) => (
              <div key={drug.id} className="drug-row">
                <input
                  type="text"
                  placeholder={`Drug ${idx + 1}, e.g. Metformin`}
                  value={drug.drug_name}
                  onChange={(e) =>
                    updateDrug(drug.id, "drug_name", e.target.value)
                  }
                  disabled={submitting}
                />
                <input
                  type="text"
                  placeholder="e.g. 500mg twice daily"
                  value={drug.dosage}
                  onChange={(e) =>
                    updateDrug(drug.id, "dosage", e.target.value)
                  }
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeDrug(drug.id)}
                  disabled={drugs.length <= 1 || submitting}
                  title="Remove drug"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn-add"
              onClick={addDrug}
              disabled={submitting}
            >
              + Add another drug
            </button>
          </div>

          {drugs.filter((d) => d.drug_name.trim()).length < 2 && (
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>
              ℹ️ Drug interaction check requires at least 2 drugs
            </p>
          )}

          <div className="form-actions">
            {saved && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push("/")}
              >
                View all prescriptions
              </button>
            )}
            {saved && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
              >
                New prescription
              </button>
            )}
            {!saved && (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span
                      className="spinner"
                      style={{ width: 18, height: 18, borderWidth: 2 }}
                    />
                    Checking interactions…
                  </>
                ) : (
                  "Save & Check Interactions"
                )}
              </button>
            )}
          </div>
        </form>

        {submitting && (
          <div className="ai-checking">
            <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, flexShrink: 0 }} />
            Analysing drug interactions with AI — this takes a few seconds…
          </div>
        )}

        {result !== undefined && result !== null && !submitting && (
          <>
            <hr className="section-divider" />
            <div className="section-label">Interaction Analysis</div>
            <InteractionResult interaction={result} />
          </>
        )}

        {saved && !result && !submitting && (
          <>
            <hr className="section-divider" />
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              Single drug prescribed — no interaction check needed.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
