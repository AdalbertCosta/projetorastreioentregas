// netlify/functions/totalexpress.js
import fetch from "node-fetch";

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    // 🔐 Token via variável de ambiente (definida no painel Netlify)
    const token = process.env.TOTAL_BEARER_TOKEN;

    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Token da Total Express não configurado no ambiente." }),
      };
    }

    const response = await fetch("https://edi.totalexpress.com.br/previsao_entrega_atualizada.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // ✅ Retorna resposta da API
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("Erro Total Express:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Erro interno ao consultar Total Express.",
        error: error.message,
      }),
    };
  }
}
