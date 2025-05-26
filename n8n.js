async function enviarProducaoGET(dados) {
  try {
    const queryParams = new URLSearchParams(dados).toString();

    const url = `https://auto.pfklabs.online/webhook-test/401dd29c-28c7-467d-9a24-bfb77d38fd86?${queryParams}`;

    const resposta = await fetch(url, {
      method: 'GET',
    
    });

    if (!resposta.ok) {
      const erro = await resposta.text();
      console.error('Erro ao enviar:', erro);
      return;
    }

    try {
      const resultado = await resposta.json();
      console.log('Resposta do n8n:', resultado);
    } catch {
      console.log('Webhook enviado com sucesso, mas sem JSON de resposta.');
    }
  } catch (erro) {
    console.error('Erro na requisição:', erro);
  }
}

function testeEnvio() {
  const dados = {
    ordem: 123,
    status: 'iniciado',
    operador: 'João'
  };

  enviarProducaoGET(dados);
}
