import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import InteractionResult, { SeverityBadge } from "../../components/InteractionResult";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function PrescriptionDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/prescriptions/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "Prescription not found" : `Error ${r.status}`);
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id]);

  function formatDate(str) {
    if (!str) return "—";
    const d = new Date(str);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  }

  if (loading) {
    return (
      <main className="page">
        <div className="loading-spinner">
          <div className="spinner" />
          <span>Loading prescription…</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="error-banner">
          <span className="error-banner-icon">⚠️</span>
          <span>{error}</span>
        </div>
        <button className="back-btn" onClick={() => router.push("/")}>
          ← Back to list
        </button>
      </main>
    );
  }

  return (
    <main className="page">
      <button className="back-btn" onClick={() => router.push("/")}>
        ← All prescriptions
      </button>

      <div className="page-header">
        <h1 className="page-title">{data.patient_name}</h1>
        <p className="page-sub">Prescription details and drug interaction report</p>
      </div>

      <div className="card">
        {/* Meta info */}
        <div className="detail-meta">
          <div className="meta-item">
            <div className="meta-label">Patient</div>
            <div className="meta-value">{data.patient_name}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Prescribing Doctor</div>
            <div className="meta-value">{data.doctor_name}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Date</div>
            <div className="meta-value">{formatDate(data.prescription_date)}</div>
          </div>
        </div>

        <hr className="section-divider" />

        {/* Drugs */}
        <div className="section-label" style={{ marginBottom: "0.75rem" }}>
          Prescribed Drugs ({data.drugs.length})
        </div>
        <div className="drugs-list">
          {data.drugs.map((drug, i) => (
            <div key={drug.id} className="drug-chip">
              <span className="drug-num">{i + 1}</span>
              <span className="drug-chip-name">{drug.drug_name}</span>
              <span className="drug-chip-dosage">{drug.dosage}</span>
            </div>
          ))}
        </div>

        <hr className="section-divider" />

        {/* Interaction result */}
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}
        >
          <div className="section-label" style={{ margin: 0 }}>Drug Interaction Report</div>
          {data.interaction?.overall_severity && (
            <SeverityBadge severity={data.interaction.overall_severity} />
          )}
        </div>

        {data.drugs.length < 2 ? (
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            Only one drug prescribed — no interaction check applicable.
          </p>
        ) : data.interaction ? (
          <InteractionResult interaction={data.interaction} />
        ) : (
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            Interaction data unavailable for this prescription.
          </p>
        )}
      </div>
    </main>
  );
}
