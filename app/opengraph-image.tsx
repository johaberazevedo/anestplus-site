import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#ffffff",
          color: "#09090b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: "#09090b",
            }}
          />
          <div style={{ fontSize: 44, fontWeight: 800 }}>Anest+</div>
        </div>

        <div style={{ marginTop: 36, fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>
          Registro anestésico, sem fricção.
        </div>

        <div style={{ marginTop: 22, fontSize: 30, color: "#52525b", lineHeight: 1.3, maxWidth: 900 }}>
          Fluxo rápido, claro e padronizado para documentar casos com menos retrabalho
          e mais tranquilidade no centro cirúrgico.
        </div>

        <div style={{ marginTop: 44, fontSize: 24, color: "#52525b" }}>
          anestplus.com • iOS • PDF pronto ao final
        </div>
      </div>
    ),
    size
  );
}