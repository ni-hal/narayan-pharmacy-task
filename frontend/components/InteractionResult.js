export default function InteractionResult({ interaction }) {
  if (!interaction) return null;

  // API error fallback
  if (interaction.error) {
    return (
      <div className="error-banner" style={{ marginTop: "1.5rem" }}>
        <span className="error-banner-icon">⚠️</span>
        <span>{interaction.error}</span>
      </div>
    );
  }

  const severity = interaction.overall_severity || "None";
  const severityClass = severity.toLowerCase();

  const iconMap = {
    none: "✅",
    mild: "🟡",
    moderate: "🟠",
    severe: "🔴",
  };

  return (
    <div className={`interaction-card ${severityClass}`}>
      <div className="interaction-header">
        <span className="interaction-icon">{iconMap[severityClass] || "ℹ️"}</span>
        <div>
          <div className="interaction-title">
            Drug Interaction Analysis
            <span style={{ marginLeft: "0.65rem" }}>
              <SeverityBadge severity={severity} />
            </span>
          </div>
          <div className="interaction-summary">{interaction.summary}</div>
        </div>
      </div>

      <div className="interaction-body">
        {interaction.has_interactions && interaction.interactions.length > 0 ? (
          interaction.interactions.map((item, i) => (
            <div key={i} className="interaction-item">
              <div className="interaction-pair">
                <span className="drug-pill">{item.drug_a}</span>
                <span className="interaction-vs">interacts with</span>
                <span className="drug-pill">{item.drug_b}</span>
                <SeverityBadge severity={item.severity} />
              </div>
              <div className="interaction-detail">
                <div className="detail-block">
                  <div className="detail-label">Mechanism</div>
                  <div className="detail-text">{item.mechanism}</div>
                </div>
                <div className="detail-block">
                  <div className="detail-label">Clinical Effect</div>
                  <div className="detail-text">{item.clinical_effect}</div>
                </div>
                <div className="detail-block management-block">
                  <div className="detail-label">Pharmacist Action</div>
                  <div className="management-text">{item.management}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            No drug-drug interactions identified for this combination.
          </p>
        )}

        {interaction.pharmacist_note && (
          <div className="pharmacist-note">
            <strong>Clinical Note:</strong> {interaction.pharmacist_note}
          </div>
        )}
      </div>

      <div
        className={`dispense-banner ${
          interaction.safe_to_dispense ? "dispense-ok" : "dispense-warn"
        }`}
      >
        {interaction.safe_to_dispense ? "✓" : "⚠"}
        {interaction.safe_to_dispense
          ? "Safe to dispense with standard counselling"
          : "Review required before dispensing — consult prescriber"}
      </div>
    </div>
  );
}

export function SeverityBadge({ severity }) {
  if (!severity) return null;
  const s = severity.toLowerCase();
  const map = {
    none: "badge-none",
    mild: "badge-mild",
    moderate: "badge-moderate",
    severe: "badge-severe",
  };
  return <span className={`badge ${map[s] || "badge-none"}`}>{severity}</span>;
}
