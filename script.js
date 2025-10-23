document.getElementById("consultaForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const valor = document.getElementById("valorBusca").value.trim();
  const detalhes = document.getElementById("detalhes");
  const resultado = document.getElementById("resultado");

  resultado.classList.remove("hidden");
  detalhes.innerHTML = `<div class="alerta"><span class="spinner"></span> Consultando...</div>`;

  // 🚫 Validação simples para bloquear CPF
  if (/^\d{11}$/.test(valor)) {
    detalhes.innerHTML = `<div class="alerta erro">⚠️ A consulta deve ser feita apenas pela Nota Fiscal, não pelo CPF.</div>`;
    return;
  }

  const payload = {
    remetenteId: "7371",
    nfiscal: [valor]
  };

  try {
    const response = await fetch("/.netlify/functions/totalexpress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data && !data.message) {
      detalhes.innerHTML = `
        <div class="alerta sucesso">✅ Consulta realizada com sucesso</div>
        <p><strong>Pedido:</strong> ${data.pedido ?? "-"}</p>
        <p><strong>AWB:</strong> ${data.awb ?? "-"}</p>
        <p><strong>Nota Fiscal:</strong> ${data.nfiscal ?? valor}</p>
        <p><strong>Previsão de Entrega:</strong> ${data.detalhes?.dataPrev?.PrevEntrega ?? "—"}</p>
        <h3>Status da Encomenda:</h3>
        <ul>
          ${
            data.detalhes?.statusDeEncomenda?.map(
              s => `<li>${s.status} — ${new Date(s.data).toLocaleString("pt-BR")}</li>`
            ).join("") || "<li>Sem atualizações</li>"
          }
        </ul>`;
    } else {
      detalhes.innerHTML = `<div class="alerta erro">⚠️ ${data.message || "Erro na consulta."}</div>`;
    }
  } catch (err) {
    detalhes.innerHTML = `<div class="alerta erro">❌ Erro: ${err.message}</div>`;
  }
});
