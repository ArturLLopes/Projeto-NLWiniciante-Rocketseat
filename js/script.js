const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const aiResponse = document.getElementById("aiResponse");
const form = document.getElementById("form");

const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Prompt para jogos em geral (MOBA, etc.)
  const generalPromptTemplate = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda sobre itens que você não tenha certeza de que existem no patch atual.

    ## Resposta
    - Seja direto e responda em no máximo 500 caracteres.
    - Responda em formato Markdown.
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n
    ---
    Aqui está a pergunta do usuário: ${question}
  `;

  // Prompt especializado para jogos FPS
  const fpsPromptTemplate = `
    ## Especialidade
    Você é um especialista em jogos de tiro em primeira pessoa (FPS), com foco no jogo ${game}.

    ## Tarefa
    Você deve responder às perguntas do usuário sobre o jogo, incluindo as melhores estratégias, configurações de sensibilidade e vídeo, 'loadouts' de armas, 'callouts' de mapas, habilidades de agentes/operadores e dicas para melhorar a mira e o posicionamento.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
    - Considere a data atual: ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda sobre itens que você não tenha certeza de que existem no patch atual.

    ## Resposta
    - Seja direto e responda em no máximo 500 caracteres.
    - Responda em formato Markdown.
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor loadout para a Vandal no Valorant?
    resposta: A Vandal é uma ótima escolha para tiros de longa distância. Aqui estão algumas dicas:\n\n**Mira:**\nUma mira pequena em formato de cruz é recomendada para precisão.\n\n**Dicas de Uso:**\nPriorize o 'tap-shooting' (tiros únicos) em longas distâncias e 'bursts' (rajadas curtas) em médias distâncias.
    ---
    Aqui está a pergunta do usuário: ${question}
  `;

  // Lista de jogos FPS para determinar qual prompt usar (use os 'values' do seu select)
  const fpsGames = ['valorant', 'cs-go', 'apex-legends', 'call-of-duty-warzone', 'overwatch-2'];
  const pergunta = fpsGames.includes(game) ? fpsPromptTemplate : generalPromptTemplate;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: pergunta,
        },
      ],
    },
  ];

  const tools = [
    {
      google_search: {},
    },
  ];

  // API
  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      tools,
    }),
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const enviarFormulario = async (evento) => {
  evento.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  //console.log({ apiKey, game, question})

  if (apiKey == "" || game == "" || question == "") {
    alert("Complete todos os campos");
    return;
  }
  

  askButton.disabled = true;
  askButton.innerText = "Carregando...";
  askButton.classList.add("loading");

  try {
    const text = await perguntarAI(question, game, apiKey);
    aiResponse.querySelector(".response-content").innerHTML =
      markdownToHTML(text);
    aiResponse.classList.remove("hidden");
  } catch (error) {
    console.log("Erro", error);
  } finally {
    askButton.disabled = false;
    askButton.innerText = "Perguntar";
    askButton.classList.remove("loading");
    aiResponse.scrollIntoView({ behavior: "smooth" }); //descer a pagina automaticamente
  }
};

form.addEventListener("submit", enviarFormulario);
