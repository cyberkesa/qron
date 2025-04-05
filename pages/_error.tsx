import { NextPage } from "next";

interface ErrorProps {
  statusCode?: number;
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", color: "#e11d48", marginBottom: "1rem" }}>
        {statusCode
          ? `Произошла ошибка на сервере (${statusCode})`
          : "Произошла ошибка на клиенте"}
      </h1>
      <p style={{ marginBottom: "2rem", color: "#4b5563" }}>
        Мы уже работаем над устранением проблемы.
      </p>
      <a
        href="/"
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#2563eb",
          color: "white",
          textDecoration: "none",
          borderRadius: "0.375rem",
          fontWeight: "bold",
        }}
      >
        Вернуться на главную
      </a>
    </div>
  );
};

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
