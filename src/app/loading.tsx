"use client";

export default function RootLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "40px 20px",
        textAlign: "center"
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "3px solid rgba(16, 185, 129, 0.2)",
          borderTopColor: "#10B981",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          marginBottom: "16px"
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "1.2rem" }}>⚡</span>
        <strong style={{ fontSize: "1rem", color: "var(--ink, #F9FAFB)" }}>
          Loading LearnNaija OS...
        </strong>
      </div>
      <p style={{ fontSize: "0.82rem", color: "var(--muted, #9CA3AF)", marginTop: "6px" }}>
        Preparing curriculum and sovereign learning services
      </p>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
