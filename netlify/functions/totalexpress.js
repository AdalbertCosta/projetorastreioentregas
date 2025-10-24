// netlify/functions/totalexpress.js
// ===============================================
// 🔐 Thérāpi | Integração Total Express (Diagnóstico completo)
// ===============================================

export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const nfiscal = Array.isArray(body.nfiscal) ? body.nfiscal[0] : body.nfiscal;

    if (!nfiscal) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Informe o número da Nota Fiscal." }),
      };
    }

    // === 1. Login ICS ===
    const loginResponse = await fetch("https://edi.totalexpress.com.br/auth.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario: process.env.TOTAL_USER,
        senha: process.env.TOTAL_PASS,
      }),
    });

    const loginText = await loginResponse.text();
    let loginData;
    try {
      loginData = JSON.parse(loginText);
    } catch {
      loginData = { raw: loginText };
    }

    // Se o login falhou, retorna o que veio
    if (!loginData.token) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Falha na autenticação ICS (verifique TOTAL_USER e TOTAL_PASS).",
          detalhes: loginData,
        }),
      };
    }

    // === 2. Consulta Previsão ===
    const consultaResponse = await fetch(
      "https://edi.totalexpress.com.br/previsao_entrega_atualizada.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginData.token}`,
        },
        body: JSON.stringify({
          remetenteId: "7371",
          nfiscal: [nfiscal],
        }),
      }
    );

    const consultaText = await consultaResponse.text();
    let data;
    try {
      data = JSON.parse(consultaText);
    } catch {
      data = { raw: consultaText };
    }

    return {
      statusCode: consultaResponse.status,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Erro interno ao consultar Total Express",
        error: error.message,
        stack: error.stack,
      }),
    };
  }
}
