import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SeverityBadge } from "../components/InteractionResult";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function PrescriptionsList() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/prescriptions`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setPrescriptions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Could not load prescriptions");
        setLoading(false);
      });
  }, []);

  function formatDate(str) {
    if (!str) return "—";
    const d = new Date(str);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1 className="page-title">Prescriptions</h1>
        <p className="page-sub">All saved prescriptions with drug interaction status</p>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-banner-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
            <span>Loading prescriptions…</span>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <div className="empty-title">No prescriptions yet</div>
            <div className="empty-sub">
              Create your first prescription to get started
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
              onClick={() => router.push("/new")}
            >
              + New Prescription
            </button>
          </div>
        ) : (
          <table className="rx-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Drugs</th>
                <th>Interaction Status</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((rx) => (
                <tr
                  key={rx.id}
                  className="clickable"
                  onClick={() => router.push(`/prescription/${rx.id}`)}
                >
                  <td style={{ fontWeight: 600 }}>{rx.patient_name}</td>
                  <td>{rx.doctor_name}</td>
                  <td>{formatDate(rx.prescription_date)}</td>
                  <td>
                    <span className="pill-count">{rx.drug_count}</span>
                  </td>
                  <td>
                    {rx.drug_count < 2 ? (
                      <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        Single drug
                      </span>
                    ) : rx.overall_severity ? (
                      <SeverityBadge severity={rx.overall_severity} />
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
