# República — O Poder das Escolhas

MVP de um jogo de governo em português: 24 decisões de dois meses, quatro anos por mandato e possibilidade de uma única reeleição. React + TypeScript + Tailwind CSS + Vite, sem servidor e sem contas de usuário.

## Enviar para o GitHub

1. Extraia o ZIP e crie um repositório no GitHub.
2. Envie **o conteúdo da pasta `republica` para a raiz do repositório**, incluindo `.github`, `.gitignore` e `.nvmrc`. Não envie a pasta ZIP inteira como um único arquivo.
3. A aba Actions executa os testes e a compilação em pushes para `main` ou `master` e em pull requests.

Não há credenciais, identificadores de hosting, dependências instaladas ou arquivos de referência do projeto ChatGPT neste pacote.

## Executar na sua máquina

Use Node.js 24 (ou Node.js >= 22.18). Dentro da pasta do projeto:

```sh
npm install
npm run dev
```

Abra a URL mostrada pelo Vite. Para validar e gerar os arquivos de produção:

```sh
npm test
npm run build
npm run preview
```

O build gera `dist/`. Não abra `index.html` diretamente: o código React/TypeScript precisa ser compilado pelo Vite.

As dependências não foram instaladas nesta entrega, por solicitação do usuário. Portanto, **a compilação TypeScript/Vite e a interface no navegador ainda precisam ser verificadas**. Os 11 testes do motor foram executados e passaram usando o suporte nativo a TypeScript do Node.js 24. Não é necessário instalar dependências para executar `npm test`. O pacote não inclui lockfile; após sua primeira instalação, envie o `package-lock.json` gerado para o GitHub e, para instalações reproduzíveis, troque `npm install` por `npm ci` nos workflows.

## Publicar

### GitHub Pages

1. Em **Settings → Pages**, selecione **GitHub Actions** como fonte.
2. Em **Actions → Publicar no GitHub Pages**, clique em **Run workflow**.
3. Após testes e build, o workflow publica a pasta `dist` e exibe a URL na execução.

O deploy é manual. O workflow de validação não publica automaticamente. A opção `base: './'` no Vite permite hospedar sob o caminho de um repositório. A disponibilidade de Pages depende da visibilidade do repositório e do plano da conta.

### Vercel ou Netlify

Importe o repositório, escolha Node.js 24, use `npm run build` como comando e `dist` como saída. Os arquivos `vercel.json` e `netlify.toml` já contêm essa configuração. Se você manteve a pasta `republica` dentro do repositório em vez de enviar seu conteúdo à raiz, selecione `republica` como diretório raiz no serviço e adapte os workflows.

## Como jogar

- Informe nome, país e orientação política sem partido. A orientação não altera os cálculos.
- Confira indicadores econômicos e sociais. Todos são simulados.
- Selecione uma das três opções, leia efeitos imediatos e projeções, depois confirme.
- A cada decisão, dois meses passam. Efeitos antigos amadurecem e acontecimentos podem modificar a situação.
- Consulte manchetes, diário e efeitos pendentes. O progresso é salvo automaticamente no navegador.
- Ao fim de 24 decisões, veja a eleição. Com pelo menos 50% dos votos simulados, você pode aceitar um segundo mandato ou encerrar.
- O segundo mandato reapresenta as 24 decisões em condições herdadas. Após 48 decisões, a trajetória termina.
- O relatório compara todos os indicadores com a posse, distingue legado econômico e social, lista marcos fictícios e projeções pendentes. Você pode exportá-lo em JSON.

Há um save por navegador e origem. Limpar dados do navegador ou mudar de domínio remove o acesso ao save anterior. O JSON exportado é um relatório completo; o MVP não oferece importação pela interface.

## Modelo e limites

Os países são **cenários fictícios**, não dados atuais, rankings da ONU ou estimativas oficiais. Valores iniciais foram escolhidos para variar a dificuldade. PIB é um índice com início em 100; dívida é uma razão dívida/PIB; inflação é uma taxa anual simulada. Os outros indicadores são índices de 0 a 100. Em desigualdade, menor é melhor; nos demais índices sociais, maior é melhor.

O motor é determinístico, sem prêmio por ideologia. Educação reforça inovação; saúde baixa causa afastamentos; proteção ambiental amortece choques; dívida elevada pressiona crédito. Benefícios tardios são multiplicados por `0,55 + capacidade / 125`, usando a capacidade no momento da decisão. Custos e efeitos negativos são preservados. Indicadores ficam em limites definidos para evitar números impossíveis no jogo.

Há feedback macroeconômico simplificado a cada bimestre. Não é um modelo contábil de orçamento nem um sistema de previsão: os pontos de dívida/PIB são efeitos estilizados, não calculados a partir de um estoque monetário de dívida. O modelo não representa Congresso, partidos, câmbio, demografia ou contratos reais com FMI. Reconhecimentos internacionais são explicitamente fictícios. Efeitos cujo prazo ultrapassa o mandato ficam no relatório como projeções, sem serem somados aos resultados realizados; ao aceitar a reeleição, continuam amadurecendo.

Votos simulados: `0,55 × aprovação + 0,20 × emprego + 0,15 × (100 − desigualdade) + 0,10 × saúde − 0,7 × max(0, inflação − 6)`, arredondados e limitados entre 10 e 90. O relatório social compara `saúde + educação − desigualdade` com a posse, enquanto o legado econômico compara o PIB. Esses resumos não substituem a leitura de cada indicador.

## Organização

```text
src/
  main.tsx                  # Entrada React
  App.tsx                   # Onboarding, gabinete, eleição, relatório
  styles.css                # Tailwind e identidade visual responsiva
  components/
    City.tsx                # Ilustração vetorial local, sem assets externos
    Metrics.tsx             # Indicadores e variações
  simulation/
    types.ts                # Contratos de estado e efeitos
    decisions.ts            # 24 decisões, 72 opções e mecanismos
    engine.ts               # Regras puras, feedback e eleição
    storage.ts              # Save local versionado e recuperação de erros
    engine.test.ts          # 11 testes, incluindo múltiplas trajetórias
.github/workflows/
  ci.yml                    # Testes e build
  pages.yml                 # Publicação manual no GitHub Pages
```

## Verificação antes de publicar

Após instalar dependências, confirme que `npm test` e `npm run build` passam. No navegador, confira onboarding, seleção por teclado, tela móvel, confirmação das decisões, recarregamento e retomada do save, diário, exportação JSON, eleição e novo jogo. Teste uma trajetória até a rodada 24 e, quando elegível, até a rodada 48. A interface usa labels, radios, foco visível, diálogo de confirmação com Escape e contenção de foco, avisos de falha de armazenamento e preferência por movimento reduzido.

## Alterar ou ampliar

Edite conteúdo e efeitos em `src/simulation/decisions.ts` e regras em `src/simulation/engine.ts`. As funções do motor não dependem de React nem de APIs de navegador. Para mudanças incompatíveis no estado, incremente a versão do save e adicione migração ou altere a chave em `storage.ts`. Não reutilize saves incompatíveis silenciosamente.
