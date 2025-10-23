// netlify/functions/totalexpress.js
// ===============================================
// 🔐 Thérāpi | Integração Total Express
// Autenticação ICS + Consulta Previsão de Entrega
// ===============================================

export async function handler(event) {
  try {
    // ====== Parse da requisição ======
    const body = JSON.parse(event.body || "{}");
    const nfiscal = Array.isArray(body.nfiscal) ? body.nfiscal[0] : body.nfiscal;

    if (!nfiscal) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Informe o número da Nota Fiscal." }),
      };
    }

    // ====== Etapa 1: Autenticação ======
    const loginResponse = await fetch("https://edi.totalexpress.com.br/auth.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario: process.env.TOTAL_USER,
        senha: process.env.TOTAL_PASS,
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginData.token) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Falha na autenticação ICS (verifique TOTAL_USER e TOTAL_PASS).",
          detalhes: loginData,
        }),
      };
    }

    // ====== Etapa 2: Consulta Previsão ======
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

    const rawText = await consultaResponse.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    // ====== Retorno ======
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
      }),
    };
  }
}
