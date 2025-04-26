# Guia de Uso - Test Auto AI

Este guia explica como instalar, configurar e utilizar o framework de automação de testes com IA.

## Requisitos

- Node.js versão 14 ou superior
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Lucasdoreac/test-auto-ai.git
cd test-auto-ai
```

2. Instale as dependências:
```bash
npm install
```

3. Instale os navegadores necessários para o Playwright:
```bash
npx playwright install
```

## Estrutura do Projeto

- `framework-ia.js` - O arquivo principal do framework
- `exemplos/` - Diretório com exemplos de testes
- `relatorios/` - Diretório onde são salvos os relatórios de testes

## Como Escrever Testes

Os testes são escritos em linguagem natural estruturada. Veja o exemplo abaixo:

```javascript
const framework = require('./framework-ia');

async function meuTeste() {
  // Inicializa o navegador e acessa a URL
  await framework.iniciar('https://exemplo.com');
  
  // Define o fluxo de teste em linguagem natural
  const fluxo = `
    # Login
    1. Vá para a página inicial
    2. Clique no botão "Login"
    3. Digite "usuario@teste.com" no campo "Email"
    4. Digite "senha123" no campo "Senha"
    5. Clique no botão "Entrar"
    6. Aguarde 2 segundos
    7. Verifique se o elemento "Bem-vindo, usuário" está visível
  `;
  
  // Executa o fluxo de teste
  const resultado = await framework.executar(fluxo, {
    captureScreenshots: true,
    reportFormat: 'html'
  });
  
  console.log(`Teste finalizado com ${resultado.sucessos} sucessos e ${resultado.falhas} falhas`);
}

meuTeste();
```

## Sintaxe da Linguagem Natural

### Estrutura Geral
- Use `#` para definir grupos de passos
- Use numeração (`1.`, `2.`, etc.) para definir os passos em sequência

### Comandos de Navegação
- `Vá para [url]` - Navega para uma URL específica
- `Volte` - Volta para a página anterior
- `Atualize` - Atualiza a página atual
- `Aguarde [segundos] segundos` - Aguarda um tempo específico

### Comandos de Interação
- `Clique no botão/link/elemento "[texto]"` - Clica em um elemento
- `Digite "[valor]" no campo "[nome]"` - Insere texto em um campo
- `Selecione "[valor]" no dropdown "[nome]"` - Seleciona opção em um dropdown
- `Marque a checkbox "[nome]"` - Marca uma checkbox
- `Desmarque a checkbox "[nome]"` - Desmarca uma checkbox
- `Role até o elemento "[nome]"` - Rola até um elemento específico

### Comandos de Verificação
- `Verifique se o título contém/é "[texto]"` - Verifica o título da página
- `Verifique se o elemento "[nome]" está visível/existe/contém "[texto]"` - Verifica um elemento
- `Verifique se a URL contém/é "[texto]"` - Verifica a URL atual
- `Verifique se existe o log "[texto]"` - Verifica logs do console

### Comandos de Captura
- `Capture screenshot` - Captura um screenshot da página
- `Capture os logs do console` - Captura logs do console

## Opções de Execução

Ao executar o framework, você pode passar as seguintes opções:

```javascript
const resultado = await framework.executar(fluxo, {
  // Opções de captura
  captureScreenshots: true, // Captura screenshots
  captureLogs: true,        // Captura logs do console
  captureNetwork: true,     // Captura requisições de rede
  
  // Opções de relatório
  reportFormat: 'html',     // Formato do relatório (html ou json)
  reportDir: './relatorios', // Diretório para salvar relatórios
  
  // Opções de execução
  tempoEspera: 500,         // Tempo de espera entre passos (ms)
  pararNaFalha: false,      // Para a execução na primeira falha
  
  // Opções do navegador
  headless: false,          // Executa em modo headless
  slowMo: 50,               // Executa em slow motion (ms)
});
```

## Executando os Exemplos

```bash
# Executa o exemplo de teste do GitHub
npm test

# Ou diretamente
node exemplos/teste-github.js
```

## Personalizando o Framework

O framework é facilmente extensível. Você pode adicionar novos comandos modificando o método `executarComando` no arquivo `framework-ia.js`.

## Solução de Problemas

### Elemento não encontrado

Se o framework não conseguir encontrar um elemento, verifique:

1. O texto está exatamente igual ao que aparece na página?
2. O elemento está visível na página?
3. O elemento está dentro de um iframe?

### Erro ao executar comandos

Se ocorrer um erro ao executar um comando:

1. Verifique a sintaxe do comando
2. Verifique se o elemento está visível e interagível
3. Aumente o tempo de espera entre passos (`tempoEspera`)

## Recursos Adicionais

- [Documentação do Playwright](https://playwright.dev/)
- [Guia de Seletores CSS](https://www.w3schools.com/cssref/css_selectors.asp)
- [Guia de XPath](https://www.w3schools.com/xml/xpath_intro.asp)
