// netlify/functions/totalexpress.js

export async function handler(event) {
  try {
    const token = process.env.TOTAL_BEARER_TOKEN;
    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "TOTAL_BEARER_TOKEN ausente no ambiente Netlify." }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    if (!body.remetenteId || !body.nfiscal) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Informe 'remetenteId' e 'nfiscal' no corpo da requisição." }),
      };
    }

    // 🔗 Faz a requisição direta à API da Total Express (usando fetch nativo)
    const response = await fetch("https://edi.totalexpress.com.br/previsao_entrega_atualizada.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro interno ao consultar Total Express", error: error.message }),
    };
  }
}
