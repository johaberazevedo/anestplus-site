type RetentionEmailContent = {
  hospitalName: string;
  competence: string;
  deadline: string;
  stage: 1 | 7 | 30;
  url: string;
};

const stageStyle = {
  1: { background: "#fee2e2", color: "#991b1b" },
  7: { background: "#fef3c7", color: "#854d0e" },
  30: { background: "#e2e8f0", color: "#334155" },
};
const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

export function retentionEmailContent({ hospitalName, competence, deadline, stage, url }: RetentionEmailContent) {
  const window = stage === 1 ? "1 dia" : `${stage} dias`;
  const instructions = "Se a competência estiver fechada, baixe e arquive os demonstrativos definitivos. Se estiver aberta, consulte a conferência no painel.";
  const { background, color } = stageStyle[stage];
  const logoUrl = new URL("/brand/anest-symbol.png", url).href;

  return {
    subject: `Anest+ · Competência de ${competence} expira em até ${window}`,
    text: [
      `A produção financeira de ${competence} do hospital ${hospitalName} estará disponível até ${deadline}, no horário da Bahia.`,
      instructions,
      `Abrir Faturamento: ${url}`,
      "Aviso automático do Anest+.",
    ].join("\n\n"),
    html: `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f8fafc;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" align="center" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 6px 24px rgba(15,23,42,.06);">
        <tr><td align="center" style="padding:30px 24px 24px;">
          <img src="${escapeHtml(logoUrl)}" alt="" width="72" style="width:72px;max-width:100%;height:auto;display:block;margin:0 auto 14px;">
          <p style="margin:0;color:#0f172a;font-size:22px;line-height:28px;font-weight:700;">Anest+ Pro</p>
          <p style="margin:4px 0 0;color:#64748b;font-size:14px;line-height:20px;">Faturamento institucional</p>
        </td></tr>
        <tr><td style="padding:0 24px 28px;">
          <h1 style="margin:0 0 14px;color:#0f172a;font-size:24px;line-height:31px;">Prazo de retenção financeira</h1>
          <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:25px;">A produção financeira dessa competência está próxima da expiração. Confira a data limite para acessar os dados no painel.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
            <tr><td style="padding:16px 18px;overflow-wrap:anywhere;word-wrap:break-word;">
              <span style="display:inline-block;padding:5px 10px;border-radius:20px;background:${background};color:${color};font-size:13px;line-height:18px;font-weight:700;">Expira em até ${window}</span>
              <p style="margin:12px 0 3px;color:#0f172a;font-size:17px;line-height:24px;font-weight:700;">${escapeHtml(hospitalName)}</p>
              <p style="margin:0;color:#334155;font-size:14px;line-height:21px;">Competência de ${escapeHtml(competence)}</p>
              <p style="margin:12px 0 0;color:#0f172a;font-size:15px;line-height:23px;"><strong>Disponível até ${escapeHtml(deadline)}</strong><br>Horário da Bahia</p>
            </td></tr>
          </table>
          <p style="margin:20px 0 24px;color:#334155;font-size:15px;line-height:25px;">${instructions}</p>
          <table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin:0 auto;">
            <tr><td align="center" bgcolor="#0f172a" style="border-radius:10px;">
              <a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 22px;border-radius:10px;background:#0f172a;color:#ffffff;font-size:15px;line-height:21px;font-weight:600;text-decoration:none;">Abrir Faturamento</a>
            </td></tr>
          </table>
          <p style="margin:22px 0 0;color:#64748b;font-size:13px;line-height:20px;">Aviso automático do Anest+.</p>
        </td></tr>
      </table>
      <p style="margin:18px 0 0;color:#64748b;font-size:12px;line-height:19px;">Equipe Anest+ Pro</p>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
