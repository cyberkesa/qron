import React from "react";
import { NextPage } from "next";

const Custom404: NextPage = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{ fontSize: "4rem", marginBottom: "0.5rem", color: "#2563eb" }}
      >
        404
      </h1>
      <h2
        style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#1f2937" }}
      >
        Страница не найдена
      </h2>
      <p
        style={{
          marginBottom: "1.5rem",
          maxWidth: "400px",
          textAlign: "center",
          color: "#4b5563",
        }}
      >
        К сожалению, запрашиваемая страница не существует или была перемещена.
      </p>
      <a
        href="/"
        style={{
          background: "#2563eb",
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.375rem",
          textDecoration: "none",
          fontWeight: "500",
        }}
      >
        Вернуться на главную
      </a>
    </div>
  );
};

export default Custom404;
