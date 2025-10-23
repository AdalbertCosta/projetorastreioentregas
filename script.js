document.getElementById("consultaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const valor = document.getElementById("valorBusca").value.trim();
  const detalhes = document.getElementById("detalhes");
  const resultado = document.getElementById("resultado");

  detalhes.innerHTML = "⏳ Consultando...";
  resultado.classList.remove("hidden");

  // Monta o corpo da requisição
  const payload = {
    remetenteId: "7371",
    nfiscal: [valor], // padrão: busca por NF
  };

  // Se o valor for CPF (11 dígitos numéricos)
  if (/^\d{11}$/.test(valor)) {
    payload.cpf = valor;
  }

  try {
    const response = await fetch("/.netlify/functions/totalexpress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      detalhes.innerHTML = `
        <p><strong>Pedido:</strong> ${data.pedido ?? "-"}</p>
        <p><strong>AWB:</strong> ${data.awb ?? "-"}</p>
        <p><strong>Nota Fiscal:</strong> ${data.nfiscal ?? "-"}</p>
        <p><strong>Previsão de Entrega:</strong> ${data.detalhes?.dataPrev?.PrevEntrega ?? "Não disponível"}</p>
        <h3>Status:</h3>
        <ul>
          ${data.detalhes?.statusDeEncomenda
            ?.map(
              s =>
                `<li>${s.status} — ${new Date(s.data).toLocaleString("pt-BR")}</li>`
            )
            .join("") ?? "<li>Sem atualizações</li>"}
        </ul>`;
    } else {
      detalhes.innerHTML = `<p>⚠️ ${data.message || "Erro na consulta"}</p>`;
    }
  } catch (err) {
    detalhes.innerHTML = `<p>❌ Erro: ${err.message}</p>`;
  }
});
