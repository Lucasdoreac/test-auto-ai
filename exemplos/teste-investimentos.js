/**
 * Exemplo de teste usando o framework-ia para verificar um site de investimentos
 */

const framework = require('../framework-ia');

async function testarSiteInvestimentos() {
  // Inicializa o navegador e acessa o site
  await framework.iniciar('https://luaraujo.com');
  
  // Define o fluxo de teste em linguagem natural
  const fluxo = `
    # Verificação Inicial
    1. Verifique se o título contém "Calculadoras Financeiras"
    2. Capture screenshot
    
    # Navegação para Simulador
    1. Clique no elemento "Planejamento Financeiro"
    2. Aguarde 2 segundos
    3. Verifique se o título contém "Simulador"
    4. Capture screenshot
    
    # Preenchimento do Simulador
    1. Digite "1000" no campo "Valor Inicial"
    2. Digite "500" no campo "Aporte Mensal"
    3. Digite "0.8" no campo "Taxa Fixa Mensal"
    4. Digite "36" no campo "Prazo"
    5. Digite "4.5" no campo "Inflação Anual Estimada"
    6. Capture screenshot
    
    # Cálculo e Verificação
    1. Clique no botão "Calcular Simulação"
    2. Aguarde 2 segundos
    3. Verifique se o elemento "Valor Final" está visível
    4. Verifique se o elemento "Ganho Total" está visível
    5. Capture screenshot
    
    # Verificação das Comparações
    1. Clique no elemento "Comparações"
    2. Aguarde 1 segundo
    3. Verifique se o elemento "Laudo Comparativo" está visível
    4. Capture screenshot
    
    # Verificação do Material Educativo
    1. Clique no elemento "Material Educativo"
    2. Aguarde 1 segundo
    3. Verifique se o elemento "Como Funcionam os Investimentos" está visível
    4. Capture screenshot
    
    # Teste de PGBL vs CDB
    1. Clique no elemento "PGBL vs CDB"
    2. Aguarde 2 segundos
    3. Verifique se o elemento "Simulador PGBL vs CDB" está visível
    4. Capture screenshot
    
    # Navegação para outra Calculadora
    1. Clique no elemento "PGBL vs CDB" no menu
    2. Aguarde 2 segundos
    3. Verifique se o título contém "PGBL vs CDB"
    4. Capture os logs do console
  `;
  
  // Executa o fluxo de teste
  const resultado = await framework.executar(fluxo, {
    captureScreenshots: true,
    captureLogs: true,
    reportFormat: 'html',
    reportDir: './relatorios-investimentos',
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
testarSiteInvestimentos().catch(erro => {
  console.error('Erro ao executar o teste:', erro);
  process.exit(1);
});
