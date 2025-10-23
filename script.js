document.getElementById("consultaForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const valor = document.getElementById("valorBusca").value.trim();
  const detalhes = document.getElementById("detalhes");
  const resultado = document.getElementById("resultado");

  resultado.classList.remove("hidden");
  detalhes.innerHTML = `<div class="alerta carregando"><span class="spinner"></span> Consultando...</div>`;

  const payload = {
    remetenteId: "7371",
    nfiscal: [valor],
  };

  if (/^\d{11}$/.test(valor)) payload.cpf = valor;

  try {
    const response = await fetch("/.netlify/functions/totalexpress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data) {
      if (data.message) {
        detalhes.innerHTML = `<div class="alerta erro">⚠️ ${data.message}</div>`;
      } else {
        detalhes.innerHTML = `
          <div class="alerta sucesso">✅ Consulta realizada com sucesso</div>
          <p><strong>Pedido:</strong> ${data.pedido ?? "-"}</p>
          <p><strong>AWB:</strong> ${data.awb ?? "-"}</p>
          <p><strong>Nota Fiscal:</strong> ${data.nfiscal ?? "-"}</p>
          <p><strong>Previsão:</strong> ${data.detalhes?.dataPrev?.PrevEntrega ?? "—"}</p>
          <h3>Status:</h3>
          <ul>
            ${
              data.detalhes?.statusDeEncomenda?.map(
                s => `<li>${s.status} — ${new Date(s.data).toLocaleString("pt-BR")}</li>`
              ).join("") || "<li>Sem atualizações</li>"
            }
          </ul>`;
      }
    } else {
      detalhes.innerHTML = `<div class="alerta erro">⚠️ Erro na consulta</div>`;
    }
  } catch (err) {
    detalhes.innerHTML = `<div class="alerta erro">❌ Erro: ${err.message}</div>`;
  }
});
