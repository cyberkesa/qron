"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: "center",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <h1
            style={{ fontSize: "2rem", color: "#e11d48", marginBottom: "1rem" }}
          >
            Что-то пошло не так!
          </h1>
          <p style={{ marginBottom: "2rem", color: "#4b5563" }}>
            Произошла неожиданная ошибка. Мы уже работаем над её устранением.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}
