# 🚀 Framework de Automação de Testes com IA

Framework para automação de testes web que utiliza linguagem natural e inteligência artificial para simplificar a criação e manutenção de testes.

## 🔍 Visão Geral

Este framework foi projetado para reduzir a quantidade de código necessário para escrever testes automatizados, permitindo que você descreva os testes em linguagem quase natural e deixe que a IA complete os detalhes técnicos.

## ✨ Características

- 📝 **Linguagem Natural**: Descreva seus testes em linguagem quase natural
- 💻 **Menos Código**: Minimize a quantidade de código escrito manualmente
- 🧠 **Suporte a IA**: Estrutura preparada para que a IA complete os "gaps" técnicos
- 🌐 **Multi-plataforma**: Funciona com Playwright e Cypress
- 📊 **Relatórios Intuitivos**: Visualize os resultados de forma clara e concisa

## 📋 Como Usar

```javascript
const { teste, navegador, acao } = require('./framework-ia');

// Configuração inicial
iniciar('https://exemplo.com');

// Defina passos em linguagem semi-natural
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

// Execute o fluxo e gere o relatório
executar(fluxo, {
  captureScreenshots: true,
  captureLogs: true,
  reportFormat: 'html'
});
```

## 🔧 Instalação

```bash
npm install test-auto-ai
```

## 📚 Exemplos de Comandos

### Navegação
```
# Navegar para páginas
1. Vá para a página inicial
2. Volte para a página anterior
3. Atualize a página
4. Aguarde 5 segundos
```

### Interação
```
# Interagir com elementos
1. Clique no botão "Enviar"
2. Digite "Texto de exemplo" no campo "Nome"
3. Selecione "Opção 2" no dropdown "Categorias" 
4. Marque a checkbox "Aceito os termos"
5. Role até o elemento "Rodapé"
```

### Verificação
```
# Validar resultados
1. Verifique se o título contém "Dashboard"
2. Verifique se o elemento "Mensagem de sucesso" está visível
3. Verifique se a URL contém "perfil"
4. Verifique se existe o log "Operação concluída"
```

## 🔄 Fluxo de Trabalho

1. **Defina seus testes em linguagem natural**
   - Escreva os passos do teste de forma clara e direta
   - Agrupe os passos em seções lógicas

2. **Execute os testes**
   - O framework traduz automaticamente para comandos Playwright/Cypress
   - A IA preenche os "gaps" técnicos como seletores complexos

3. **Visualize os resultados**
   - Relatórios visuais com screenshots e logs
   - Identifique facilmente os pontos de falha

## 🛠️ Arquitetura

O framework é composto por três componentes principais:

- **Parser de Linguagem Natural**: Converte instruções em linguagem natural para comandos técnicos
- **Adaptadores para Frameworks**: Implementações específicas para Playwright e Cypress
- **Gerador de Relatórios**: Cria relatórios visuais e detalhados dos resultados dos testes

## 📊 Benefícios

- **Redução de 70% no código escrito manualmente**
- **Testes mais fáceis de entender e manter**
- **Menor curva de aprendizado para novos membros da equipe**
- **Adaptação rápida a mudanças na interface**

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## 📄 Licença

MIT
