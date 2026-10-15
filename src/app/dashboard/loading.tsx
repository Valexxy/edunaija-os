"use client";

export default function DashboardLoading() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "30px 16px" }}>
      {/* Loading banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid #047857",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "24px"
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            border: "3px solid rgba(16, 185, 129, 0.2)",
            borderTopColor: "#10B981",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }}
        />
        <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#10B981" }}>
          Loading Scholar Dashboard • Calibrating curriculum targets &amp; academic track...
        </span>
      </div>

      {/* Shimmering card skeleton 1 */}
      <div
        className="card"
        style={{
          height: "140px",
          marginBottom: "20px",
          background: "linear-gradient(90deg, rgba(19, 36, 28, 0.6) 0%, rgba(25, 48, 38, 0.8) 50%, rgba(19, 36, 28, 0.6) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          borderRadius: "20px"
        }}
      />

      {/* Shimmering card skeleton 2 */}
      <div
        className="card"
        style={{
          height: "180px",
          marginBottom: "20px",
          background: "linear-gradient(90deg, rgba(19, 36, 28, 0.6) 0%, rgba(25, 48, 38, 0.8) 50%, rgba(19, 36, 28, 0.6) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          borderRadius: "20px"
        }}
      />

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </main>
  );
}
