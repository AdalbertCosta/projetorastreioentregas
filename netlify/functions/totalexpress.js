import fetch from "node-fetch";

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    const res = await fetch("https://edi.totalexpress.com.br/previsao_entrega_atualizada.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 27ca355e896b05ce82se901cbea632702432b15e" // substitua pelo token fornecido pela Total Express
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return {
      statusCode: res.status,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro interno", error: error.message })
    };
  }
}
