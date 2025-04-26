/**
 * Exemplo de teste usando o framework-ia para verificar o GitHub
 */

const framework = require('../framework-ia');

async function testarGitHub() {
  // Inicializa o navegador e acessa o GitHub
  await framework.iniciar('https://github.com/Lucasdoreac');
  
  // Define o fluxo de teste em linguagem natural
  const fluxo = `
    # Verificação de Perfil
    1. Verifique se o título contém "Lucasdoreac"
    2. Capture screenshot
    
    # Navegação para Repositórios
    1. Clique no elemento "Repositories"
    2. Aguarde 2 segundos
    3. Verifique se a URL contém "tab=repositories"
    4. Capture screenshot
    
    # Verificação de Repositório
    1. Clique no elemento "test-auto-ai"
    2. Aguarde 2 segundos
    3. Verifique se o título contém "test-auto-ai"
    4. Verifique se o elemento "Framework para automação de testes web" está visível
    5. Capture screenshot
    
    # Verificação de Código
    1. Clique no elemento "framework-ia.js"
    2. Aguarde 2 segundos
    3. Verifique se o elemento "class FrameworkIA" existe
    4. Capture screenshot
    
    # Navegação de Volta
    1. Volte para a página anterior
    2. Aguarde 1 segundo
    3. Verifique se o elemento "README.md" está visível
    4. Capture os logs do console
  `;
  
  // Executa o fluxo de teste
  const resultado = await framework.executar(fluxo, {
    captureScreenshots: true,
    captureLogs: true,
    reportFormat: 'html',
    reportDir: './relatorios',
    tempoEspera: 500,
    pararNaFalha: false
  });
  
  // Exibe o resultado
  console.log(`Teste finalizado com ${resultado.sucessos} passos bem-sucedidos e ${resultado.falhas} falhas.`);
  console.log(`Tempo total: ${resultado.duracao}ms`);
  
  if (resultado.falhas > 0) {
    console.error('Alguns testes falharam. Verifique o relatório para mais detalhes.');
    process.exit(1);
  } else {
    console.log('Todos os testes foram bem-sucedidos!');
  }
}

// Executa o teste
testarGitHub().catch(erro => {
  console.error('Erro ao executar o teste:', erro);
  process.exit(1);
});
