export async function handler(event) {
  try {
    const { nfiscal } = JSON.parse(event.body || "{}");

    if (!nfiscal || nfiscal.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Informe o número da Nota Fiscal." })
      };
    }

    // 🔐 Token definido como variável de ambiente
    const token = process.env.TOTAL_BEARER_TOKEN;
    const remetenteId = "7371";

    const body = {
      remetenteId,
      nfiscal
    };

    const response = await fetch("https://edi.totalexpress.com.br/previsao_entrega_atualizada.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.text(); // A Total Express às vezes retorna texto puro
    return {
      statusCode: response.status,
      body: data
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Erro interno ao consultar Total Express",
        error: error.message
      })
    };
  }
}
