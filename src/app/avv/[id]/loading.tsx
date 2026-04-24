export default function AvvLoading() {
  return (
    <>
      {/* Header skeleton */}
      <header style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "32px 0",
      }}>
        <div className="px" style={{ maxWidth: "1100px" }}>
          <div style={{
            height: "0.75rem",
            width: "180px",
            background: "var(--border)",
            borderRadius: "4px",
            marginBottom: "24px",
          }} />
          <div style={{
            height: "clamp(1.6rem, 4vw, 2.2rem)",
            width: "140px",
            background: "var(--border)",
            borderRadius: "4px",
            marginBottom: "10px",
          }} />
          <div style={{
            height: "clamp(1.4rem, 3vw, 2rem)",
            width: "300px",
            background: "var(--border)",
            borderRadius: "4px",
          }} />
        </div>
      </header>

      {/* Content skeleton */}
      <div className="px" style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "40px",
        padding: "40px max(24px, calc((100vw - 1100px) / 2))",
        alignItems: "start",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ height: "1.2rem", width: "120px", background: "var(--border)", borderRadius: "4px" }} />
          <div style={{ height: "4rem", width: "100%", background: "var(--border)", borderRadius: "4px" }} />
          <div style={{ height: "4rem", width: "80%", background: "var(--border)", borderRadius: "4px" }} />
        </div>
        <div style={{
          height: "300px",
          background: "var(--border)",
          borderRadius: "var(--radius)",
        }} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 300px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
