export default function Loading() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "40vh",
      color: "var(--text-muted)",
      fontSize: "0.88rem",
    }}>
      <div style={{
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        border: "2px solid var(--navy-muted)",
        borderTopColor: "var(--navy)",
        animation: "spin 0.6s linear infinite",
        marginRight: "12px",
        flexShrink: 0,
      }} />
      Seite wird geladen…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
