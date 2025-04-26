/**
 * Framework de Automação de Testes com IA
 * 
 * Este framework permite a criação de testes automatizados utilizando
 * linguagem natural, reduzindo a quantidade de código necessário.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class FrameworkIA {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
    this.logs = [];
    this.screenshots = [];
    this.resultados = {
      passos: [],
      sucessos: 0,
      falhas: 0,
      duracao: 0
    };
  }

  /**
   * Inicia o navegador e carrega a URL especificada
   * @param {string} url - URL a ser carregada
   * @param {Object} opcoes - Opções de inicialização
   */
  async iniciar(url, opcoes = {}) {
    console.log(`Iniciando navegador e carregando ${url}`);
    
    const browserOptions = {
      headless: opcoes.headless ?? false,
      slowMo: opcoes.slowMo ?? 50
    };
    
    this.browser = await chromium.launch(browserOptions);
    this.context = await this.browser.newContext({
      viewport: opcoes.viewport ?? { width: 1280, height: 720 },
      recordVideo: opcoes.recordVideo ? { dir: 'videos/' } : undefined
    });
    
    this.page = await this.context.newPage();
    
    // Capturar logs do console
    this.page.on('console', msg => {
      this.logs.push({
        type: msg.type(),
        text: msg.text(),
        time: new Date().toISOString()
      });
    });
    
    // Capturar requisições de rede
    if (opcoes.captureNetwork) {
      this.requests = [];
      this.page.on('request', request => {
        this.requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType()
        });
      });
    }
    
    const inicio = Date.now();
    await this.page.goto(url);
    
    this.registrarPasso({
      descricao: `Navegou para ${url}`,
      duracao: Date.now() - inicio,
      status: 'sucesso'
    });
    
    return this.page;
  }

  /**
   * Executa um fluxo de teste descrito em linguagem natural
   * @param {string} fluxo - Fluxo em linguagem natural
   * @param {Object} opcoes - Opções de execução
   */
  async executar(fluxo, opcoes = {}) {
    console.log('Executando fluxo de teste');
    const inicioTeste = Date.now();
    
    // Extrair grupos e passos
    const grupos = this.extrairGrupos(fluxo);
    
    for (const [nomeGrupo, passos] of Object.entries(grupos)) {
      console.log(`\nExecutando grupo: ${nomeGrupo}`);
      
      for (const passo of passos) {
        try {
          const inicioPasso = Date.now();
          const comando = passo.replace(/^\d+\.\s*/, '').trim();
          
          console.log(`  - ${comando}`);
          
          await this.executarComando(comando, opcoes);
          
          this.registrarPasso({
            grupo: nomeGrupo,
            descricao: comando,
            duracao: Date.now() - inicioPasso,
            status: 'sucesso'
          });
          
          this.resultados.sucessos++;
          
          if (opcoes.tempoEspera) {
            await this.page.waitForTimeout(opcoes.tempoEspera);
          }
        } catch (erro) {
          this.registrarPasso({
            grupo: nomeGrupo,
            descricao: passo,
            erro: erro.message,
            status: 'falha'
          });
          
          this.resultados.falhas++;
          
          if (opcoes.pararNaFalha) {
            break;
          }
        }
      }
    }
    
    this.resultados.duracao = Date.now() - inicioTeste;
    
    await this.gerarRelatorio(opcoes);
    
    if (!opcoes.manterAberto) {
      await this.finalizar();
    }
    
    return this.resultados;
  }

  /**
   * Extrai grupos e passos do fluxo em linguagem natural
   * @param {string} fluxo - Fluxo em linguagem natural
   * @returns {Object} - Grupos e seus passos
   */
  extrairGrupos(fluxo) {
    const linhas = fluxo.split('\n').map(l => l.trim()).filter(l => l);
    const grupos = {};
    
    let grupoAtual = 'Geral';
    const passos = [];
    
    for (const linha of linhas) {
      if (linha.startsWith('#')) {
        // Se já existem passos, salva o grupo anterior
        if (passos.length > 0) {
          grupos[grupoAtual] = [...passos];
          passos.length = 0;
        }
        
        grupoAtual = linha.substring(1).trim();
      } else if (/^\d+\./.test(linha)) {
        passos.push(linha);
      }
    }
    
    // Salva o último grupo
    if (passos.length > 0) {
      grupos[grupoAtual] = [...passos];
    }
    
    return grupos;
  }

  /**
   * Executa um comando em linguagem natural
   * @param {string} comando - Comando em linguagem natural
   * @param {Object} opcoes - Opções de execução
   */
  async executarComando(comando, opcoes = {}) {
    // Comandos de navegação
    if (comando.startsWith('Vá para')) {
      const url = comando.replace('Vá para', '').trim();
      await this.page.goto(url);
    }
    else if (comando.startsWith('Volte')) {
      await this.page.goBack();
    }
    else if (comando.startsWith('Atualize')) {
      await this.page.reload();
    }
    else if (comando.startsWith('Aguarde')) {
      const tempo = parseInt(comando.match(/\d+/)[0] || 1) * 1000;
      await this.page.waitForTimeout(tempo);
    }
    // Comandos de interação
    else if (comando.startsWith('Clique')) {
      const alvo = this.extrairAlvo(comando);
      await this.page.click(alvo);
    }
    else if (comando.startsWith('Digite')) {
      const [valor, campo] = this.extrairCampoValor(comando);
      await this.page.fill(campo, valor);
    }
    else if (comando.startsWith('Selecione')) {
      const [valor, campo] = this.extrairCampoValor(comando, 'selecione');
      await this.page.selectOption(campo, valor);
    }
    else if (comando.startsWith('Marque')) {
      const alvo = this.extrairAlvo(comando, 'marque');
      await this.page.check(alvo);
    }
    else if (comando.startsWith('Desmarque')) {
      const alvo = this.extrairAlvo(comando, 'desmarque');
      await this.page.uncheck(alvo);
    }
    else if (comando.startsWith('Pressione')) {
      const tecla = comando.replace('Pressione', '').trim();
      await this.page.keyboard.press(tecla);
    }
    else if (comando.startsWith('Role')) {
      if (comando.includes('até')) {
        const alvo = this.extrairAlvo(comando, 'até');
        const elemento = await this.page.$(alvo);
        await elemento.scrollIntoViewIfNeeded();
      } else {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      }
    }
    // Comandos de verificação
    else if (comando.startsWith('Verifique')) {
      await this.verificar(comando);
    }
    // Comandos de captura
    else if (comando.startsWith('Capture screenshot')) {
      const nome = `screenshot_${this.screenshots.length}.png`;
      await this.page.screenshot({ path: nome });
      this.screenshots.push(nome);
    }
    else if (comando.startsWith('Capture os logs')) {
      // Os logs já estão sendo capturados automaticamente
      console.log(`Logs capturados até o momento: ${this.logs.length}`);
    }
    else if (comando.startsWith('Extraia')) {
      await this.extrair(comando);
    }
    else {
      throw new Error(`Comando não reconhecido: ${comando}`);
    }
  }

  /**
   * Extrai o seletor alvo a partir do comando
   * @param {string} comando - Comando em linguagem natural
   * @param {string} acao - Ação sendo realizada (clique, marque, etc)
   * @returns {string} - Seletor CSS ou texto
   */
  extrairAlvo(comando, acao = 'clique') {
    let padrao;
    if (acao === 'clique') {
      padrao = /Clique (?:no|na|em) (?:botão|link|aba|elemento|checkbox) ["]([^"]+)["]/;
    } else if (acao === 'marque' || acao === 'desmarque') {
      padrao = /(?:Marque|Desmarque) (?:a|o) (?:checkbox|caixa) ["]([^"]+)["]/;
    } else if (acao === 'até') {
      padrao = /Role até (?:o|a) (?:elemento|secção|div|tabela) ["]([^"]+)["]/;
    }
    
    const matches = comando.match(padrao);
    if (matches) {
      // Tenta diferentes estratégias de seleção
      return `text="${matches[1]}", [placeholder="${matches[1]}"], [aria-label="${matches[1]}"], [name="${matches[1]}"], #${matches[1].toLowerCase().replace(/\s+/g, '-')}`;
    }
    
    throw new Error(`Não foi possível extrair o alvo do comando: ${comando}`);
  }

  /**
   * Extrai valor e campo a partir do comando
   * @param {string} comando - Comando em linguagem natural
   * @param {string} acao - Ação sendo realizada (digite, selecione, etc)
   * @returns {Array} - [valor, seletor]
   */
  extrairCampoValor(comando, acao = 'digite') {
    let padrao;
    if (acao === 'digite') {
      padrao = /Digite ["]([^"]+)["] (?:no|na|em) (?:campo|input|textarea|caixa) ["]([^"]+)["]/;
    } else if (acao === 'selecione') {
      padrao = /Selecione ["]([^"]+)["] (?:no|na|em|do) (?:dropdown|select|campo|seletor) ["]([^"]+)["]/;
    }
    
    const matches = comando.match(padrao);
    if (matches) {
      const valor = matches[1];
      const campo = matches[2];
      
      // Tenta diferentes estratégias de seleção
      const seletor = `[placeholder="${campo}"], [aria-label="${campo}"], [name="${campo}"], label:has-text("${campo}") + input, label:has-text("${campo}") + select, label:has-text("${campo}") + textarea`;
      
      return [valor, seletor];
    }
    
    throw new Error(`Não foi possível extrair campo e valor do comando: ${comando}`);
  }

  /**
   * Executa diferentes tipos de verificação
   * @param {string} comando - Comando de verificação
   */
  async verificar(comando) {
    // Verificar título
    if (comando.includes('título')) {
      const padrao = /Verifique se o título (?:é|contém) ["]([^"]+)["]/;
      const matches = comando.match(padrao);
      
      if (matches) {
        const textoEsperado = matches[1];
        const titulo = await this.page.title();
        
        if (comando.includes('contém')) {
          if (!titulo.includes(textoEsperado)) {
            throw new Error(`Título não contém "${textoEsperado}". Título atual: "${titulo}"`);
          }
        } else {
          if (titulo !== textoEsperado) {
            throw new Error(`Título não é "${textoEsperado}". Título atual: "${titulo}"`);
          }
        }
      }
    }
    // Verificar elemento
    else if (comando.includes('elemento')) {
      const padrao = /Verifique se (?:o|a) elemento ["]([^"]+)["] (?:está visível|existe|contém) (?:["]([^"]+)["]/;
      const matches = comando.match(padrao);
      
      if (matches) {
        const elemento = matches[1];
        const seletor = `text="${elemento}", [aria-label="${elemento}"], [placeholder="${elemento}"], #${elemento.toLowerCase().replace(/\s+/g, '-')}`;
        
        if (comando.includes('visível')) {
          const visivel = await this.page.isVisible(seletor);
          if (!visivel) {
            throw new Error(`Elemento "${elemento}" não está visível`);
          }
        } else if (comando.includes('existe')) {
          const existe = await this.page.$(seletor) !== null;
          if (!existe) {
            throw new Error(`Elemento "${elemento}" não existe`);
          }
        } else if (comando.includes('contém')) {
          const textoEsperado = matches[2];
          const textoAtual = await this.page.textContent(seletor);
          
          if (!textoAtual.includes(textoEsperado)) {
            throw new Error(`Elemento "${elemento}" não contém "${textoEsperado}". Texto atual: "${textoAtual}"`);
          }
        }
      }
    }
    // Verificar URL
    else if (comando.includes('URL')) {
      const padrao = /Verifique se a URL (?:é|contém) ["]([^"]+)["]/;
      const matches = comando.match(padrao);
      
      if (matches) {
        const urlEsperada = matches[1];
        const urlAtual = this.page.url();
        
        if (comando.includes('contém')) {
          if (!urlAtual.includes(urlEsperada)) {
            throw new Error(`URL não contém "${urlEsperada}". URL atual: "${urlAtual}"`);
          }
        } else {
          if (urlAtual !== urlEsperada) {
            throw new Error(`URL não é "${urlEsperada}". URL atual: "${urlAtual}"`);
          }
        }
      }
    }
    // Verificar logs
    else if (comando.includes('log')) {
      const padrao = /Verifique se existe (?:o|um) log ["]([^"]+)["]/;
      const matches = comando.match(padrao);
      
      if (matches) {
        const logEsperado = matches[1];
        const logEncontrado = this.logs.some(log => log.text.includes(logEsperado));
        
        if (!logEncontrado) {
          throw new Error(`Log "${logEsperado}" não encontrado`);
        }
      }
    }
  }

  /**
   * Registra um passo de teste
   * @param {Object} passo - Informações do passo
   */
  registrarPasso(passo) {
    this.resultados.passos.push({
      ...passo,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Gera um relatório com os resultados dos testes
   * @param {Object} opcoes - Opções de relatório
   */
  async gerarRelatorio(opcoes = {}) {
    const formato = opcoes.reportFormat || 'json';
    const diretorio = opcoes.reportDir || 'relatorios';
    
    // Cria o diretório de relatórios se não existir
    if (!fs.existsSync(diretorio)) {
      fs.mkdirSync(diretorio, { recursive: true });
    }
    
    const data = new Date();
    const timestamp = data.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const nomeArquivo = `relatorio-${timestamp}`;
    
    const relatorio = {
      timestamp: data.toISOString(),
      titulo: await this.page.title(),
      url: this.page.url(),
      duracao: this.resultados.duracao,
      passos: this.resultados.passos,
      sucessos: this.resultados.sucessos,
      falhas: this.resultados.falhas,
      logs: this.logs,
      screenshots: this.screenshots,
      status: this.resultados.falhas === 0 ? 'Sucesso' : 'Falha'
    };
    
    if (formato === 'json') {
      fs.writeFileSync(
        path.join(diretorio, `${nomeArquivo}.json`),
        JSON.stringify(relatorio, null, 2)
      );
    } else if (formato === 'html') {
      // Template simplificado para relatório HTML
      const html = `<!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Testes - ${timestamp}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
          h1 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .sumario { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .sucesso { color: green; }
          .falha { color: red; }
          .passo { margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
          .passo-sucesso { border-left: 4px solid green; }
          .passo-falha { border-left: 4px solid red; background: #fff0f0; }
          .screenshot { max-width: 100%; border: 1px solid #ddd; margin-top: 10px; }
          .logs { max-height: 200px; overflow: auto; background: #f0f0f0; padding: 10px; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>Relatório de Testes</h1>
        
        <div class="sumario">
          <p><strong>URL:</strong> ${relatorio.url}</p>
          <p><strong>Título:</strong> ${relatorio.titulo}</p>
          <p><strong>Data:</strong> ${relatorio.timestamp}</p>
          <p><strong>Duração:</strong> ${relatorio.duracao}ms</p>
          <p class="${relatorio.status === 'Sucesso' ? 'sucesso' : 'falha'}">
            <strong>Status:</strong> ${relatorio.status}
            (${relatorio.sucessos} sucesso(s), ${relatorio.falhas} falha(s))
          </p>
        </div>
        
        <h2>Passos Executados</h2>
        ${relatorio.passos.map((passo, index) => `
          <div class="passo ${passo.status === 'sucesso' ? 'passo-sucesso' : 'passo-falha'}">
            <p><strong>Passo ${index + 1}:</strong> ${passo.descricao}</p>
            <p><strong>Grupo:</strong> ${passo.grupo || 'Geral'}</p>
            <p><strong>Duração:</strong> ${passo.duracao || 0}ms</p>
            <p><strong>Status:</strong> ${passo.status}</p>
            ${passo.erro ? `<p><strong>Erro:</strong> ${passo.erro}</p>` : ''}
          </div>
        `).join('')}
        
        ${relatorio.screenshots.length > 0 ? `
          <h2>Screenshots</h2>
          ${relatorio.screenshots.map(screenshot => `
            <div>
              <p><strong>${screenshot}</strong></p>
              <img src="../${screenshot}" class="screenshot" alt="${screenshot}">
            </div>
          `).join('')}
        ` : ''}
        
        ${relatorio.logs.length > 0 ? `
          <h2>Logs do Console</h2>
          <div class="logs">
            ${relatorio.logs.map(log => `
              <div>
                <strong>[${log.type}]</strong> ${log.text}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </body>
      </html>`;
      
      fs.writeFileSync(
        path.join(diretorio, `${nomeArquivo}.html`),
        html
      );
    }
    
    console.log(`Relatório gerado: ${path.join(diretorio, nomeArquivo)}.${formato}`);
  }

  /**
   * Finaliza o navegador e libera recursos
   */
  async finalizar() {
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log('Testes finalizados');
  }

  /**
   * Extrai dados da página
   * @param {string} comando - Comando de extração
   */
  async extrair(comando) {
    // Extração de dados a ser implementada com base nas necessidades específicas
    console.log(`Extraindo dados: ${comando}`);
  }
}

// Exporta o framework
module.exports = new FrameworkIA();
