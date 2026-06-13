const fs = require('fs');
const path = require('path');

let userTest = fs.readFileSync('tests/user.test.js', 'utf8');
let adminTest = fs.readFileSync('tests/admin.test.js', 'utf8');

// Bug fixes for user.test.js
userTest = userTest.replace(
    'email: "user.test@email.com"',
    'email: `selenium_${Date.now()}@email.com`'
);

const userBtnReplace = `let btn = await firstCard.findElement(By.css(".btn-outline-success")); 
        
        console.log("Forçando clique no primeiro botão (Mark Done)...");
        await driver.executeScript("arguments[0].click();", btn);
        
        // 3. Aguarda a transição e recaptura o botão
        console.log("Aguardando transição do botão...");
        await driver.sleep(2500);`;

const userBtnTarget = `let outlineBtns = await firstCard.findElements(By.css(".btn-outline-success")); 
        if (outlineBtns.length > 0) {
            console.log("Forçando clique no primeiro botão (Mark Done)...");
            await driver.executeScript("arguments[0].click();", outlineBtns[0]);
            console.log("Aguardando transição do botão...");
            await driver.sleep(2500); 
        }`;

userTest = userTest.replace(userBtnReplace, userBtnTarget);

// Translation Dictionary
const dict = {
    'Função infalível para interagir com a sua UI': 'Robust function to interact with the UI',
    'Inicializa as páginas para que fiquem disponíveis': 'Initializes pages to be available',
    'Usando a lógica robusta da LoginPage (que deve ter os IDs novos: login_btn)': 'Using robust LoginPage logic (should have new IDs: login_btn)',
    'Verificando se o login foi bem-sucedido...': 'Verifying if login was successful...',
    'Login validado com sucesso! A navegação está pronta.': 'Login successfully validated! Navigation is ready.',
    'CORREÇÃO: O cleanup também precisa do NativeClick': 'FIX: Cleanup also needs NativeClick',
    'Aguardando o redirecionamento do router...': 'Waiting for router redirection...',
    'ESPERA CRÍTICA: Garante que o Vue/React já atualizou a URL': 'CRITICAL WAIT: Ensures Vue/React has updated the URL',
    'Verificando a barra de navegação...': 'Checking the navigation bar...',
    'Garante que a interface também já terminou de renderizar': 'Ensures the interface has finished rendering',
    'Agora é 100% seguro capturar a URL': 'Now it is 100% safe to capture the URL',
    'Navegar para a página de Exploração': 'Navigate to Explore page',
    'Localizar a Grid de Hábitos e fazer scroll': 'Locate Habits Grid and scroll',
    'Aguardando a grid de hábitos (.habits-grid) carregar...': 'Waiting for habits grid (.habits-grid) to load...',
    'Fazendo scroll até a grid de hábitos...': 'Scrolling to the habits grid...',
    'Pausa para a API carregar os dados': 'Pause for API to load data',
    'Escolher e clicar num cartão': 'Choose and click a card',
    'Localizando os cartões de hábitos dentro da grid...': 'Locating habit cards inside the grid...',
    'Encontrados': 'Found',
    'cartões na grid.': 'cards in the grid.',
    'A grid carregou, mas está vazia. Nenhum cartão encontrado!': 'Grid loaded, but it is empty. No cards found!',
    'Clicando no hábito número': 'Clicking on habit number',
    'Clicar no botão de adicionar (Sem esperar pelo modal)': 'Click add button (Without waiting for modal)',
    'Aguardando o botão de adicionar hábito...': 'Waiting for add habit button...',
    'Aumentei um pouco o tempo caso o modal demore a animar': 'Increased time slightly in case modal animation is slow',
    'Pequena pausa para garantir estabilidade': 'Short pause to ensure stability',
    'Botão encontrado! Executando clique nativo...': 'Button found! Executing native click...',
    'Espera o backend confirmar a adição': 'Wait for backend to confirm addition',
    'Procurando o botão de fechar com a classe .custom-modal-close...': 'Looking for close button with class .custom-modal-close...',
    'Tentativa 1: Clicar no botão pela classe que você descobriu': 'Attempt 1: Click button by discovered class',
    'Botão .custom-modal-close não encontrado, tentando tecla ESC...': '.custom-modal-close button not found, trying ESC key...',
    'Voltar ao Dashboard e verificar': 'Return to Dashboard and verify',
    'Espera e prepara a grid': 'Wait and prepare the grid',
    'Timeout: Nenhum cartão foi carregado.': 'Timeout: No card was loaded.',
    'Usaremos a função performNativeClick que já está definida no topo do ficheiro e provou ser fiável': 'We will use performNativeClick function defined at the top which proved reliable',
    'Localiza o primeiro cartão e clica em "Mark Done"': 'Locate first card and click "Mark Done"',
    'Forçando clique no primeiro botão (Mark Done)...': 'Forcing click on first button (Mark Done)...',
    'Aguarda a transição e recaptura o botão': 'Wait for transition and recapture button',
    'Aguardando transição do botão...': 'Waiting for button transition...',
    'Força o clique na Recompensa (o botão mudou de classe)': 'Force click on Reward (button class changed)',
    'Forçando clique no segundo botão (Complete & Earn Points)...': 'Forcing click on second button (Complete & Earn Points)...',
    'Verifica se o item foi removido': 'Verify if item was removed',
    'Aguardando remoção do cartão...': 'Waiting for card removal...',
    'O cartão não foi removido da grelha!': 'Card was not removed from grid!',
    'A tarefa não foi deletada.': 'Task was not deleted.',
    'Aguarda o dashboard e faz scroll até ao bloco de gráficos': 'Wait for dashboard and scroll to charts block',
    'Localiza e clica no botão com title="Generate Report" DENTRO da chartsBox': 'Locate and click button with title="Generate Report" INSIDE chartsBox',
    'Aguarda o painel de relatório aparecer': 'Wait for report panel to appear',
    'Pequena pausa para animação do painel': 'Short pause for panel animation',
    'Localiza os selects específicos': 'Locate specific selects',
    'Interage com o primeiro Select': 'Interact with first Select',
    'Mudamos para a opção 1 (o segundo item da lista, assumindo que o 0 é "Selecione...")': 'Change to option 1 (second item in list, assuming 0 is "Select...")',
    'Interage com o segundo Select': 'Interact with second Select',
    'Clica no botão final para gerar': 'Click final button to generate',
    'Valida o sucesso do Download': 'Validate Download success',
    'Dá um tempo extra para garantir que o download inicia antes do browser fechar': 'Give extra time to ensure download starts before browser closes',
    'Navegação': 'Navigation',
    'Edição': 'Editing',
    'PAUSA SOLICITADA: 1 segundo para visualização': 'REQUESTED PAUSE: 1 second for viewing',
    'Visualizando o swiper antes de confirmar...': 'Viewing swiper before confirming...',
    'Confirmando a decoração...': 'Confirming decoration...',
    'Aguardar o avatar voltar': 'Wait for avatar to return',
    'Procurando o Toast via escaneamento de conteúdo...': 'Looking for Toast via content scanning...',
    'Em vez de esperar por uma classe, vamos esperar por um elemento que contenha o texto esperado': 'Instead of waiting for a class, wait for element containing expected text',
    'Isto ignora a classe CSS e foca-se apenas no conteúdo': 'This ignores CSS class and focuses only on content',
    'Falha: O XPath não encontrou nenhum elemento com o texto': 'Failure: XPath did not find any element with text',
    'DUMP DE SEGURANÇA: Mostra-nos o que existe no corpo da página para descobrirmos a classe': 'SECURITY DUMP: Show what exists in page body to discover class',
    'DUMP DO INÍCIO DO BODY': 'DUMP OF BODY START',
    'Toast não encontrado. Verifique o DUMP acima para ver se o elemento existe no DOM.': 'Toast not found. Check DUMP above to see if element exists in DOM.',
    'Adicionando a pausa de 2 segundos solicitada': 'Adding requested 2 second pause',
    'Clique Nativo': 'Native Click',
    'CORREÇÃO AQUI: Em vez do body, capturamos a tag html': 'FIX HERE: Instead of body, capture html tag',
    'Em vez da classe, lemos o atributo do Bootstrap': 'Instead of class, read Bootstrap attribute',
    'O atributo data-bs-theme="dark" não foi aplicado à tag html.': 'Attribute data-bs-theme="dark" was not applied to html tag.',
    'Navegação para Settings': 'Navigation to Settings',
    'Localizar o Avatar e verificar a condição inicial (Tem imagem ou é vazio?)': 'Locate Avatar and verify initial condition (Has image or is empty?)',
    'Verificando o estado inicial do avatar...': 'Checking initial avatar state...',
    'Em vez de wait, usamos findElements para não dar erro se não existir': 'Instead of wait, use findElements to avoid error if not exists',
    'Condição A': 'Condition A',
    'Imagem atual detetada. URL:': 'Current image detected. URL:',
    'Condição B': 'Condition B',
    'Nenhuma imagem de perfil detetada (Placeholder ativo).': 'No profile picture detected (Placeholder active).',
    'Preparar e enviar o ficheiro local': 'Prepare and send local file',
    'Injetando a imagem no input oculto...': 'Injecting image into hidden input...',
    'MOSTRAR: Forçamos a exibição apenas para o Selenium não dar erro de elemento não interativo': 'SHOW: Force display so Selenium does not throw un-interactive element error',
    'INJETAR: Selenium envia o ficheiro': 'INJECT: Selenium sends the file',
    'ESCONDER: Imediatamente após o envio, forçamos o sumiço completo do elemento do ecrã': 'HIDE: Immediately after sending, force complete disappearance of element from screen',
    'Validação Condicional Pós-Upload': 'Post-Upload Conditional Validation',
    'Aguardando a aplicação processar o upload e atualizar o ecrã...': 'Waiting for app to process upload and update screen...',
    'Se ainda não há imagem no DOM, continua à espera': 'If still no image in DOM, keep waiting',
    'O teste passa quando o SRC for diferente do antigo': 'Test passes when SRC is different from old one',
    'O teste passa mal a tag img surja com um link válido': 'Test passes as soon as img tag appears with valid link',
    'Timeout: A nova imagem do avatar não foi renderizada no ecrã.': 'Timeout: New avatar image was not rendered on screen.',
    'Confirmação Final': 'Final Confirmation',
    'Sucesso! Nova imagem processada pelo site:': 'Success! New image processed by site:',
    'Validação do Toast': 'Toast Validation',
    'Aguardando notificação de sucesso...': 'Waiting for success notification...',
    'Toast capturado:': 'Captured toast:',
    'O toast não contém o texto de sucesso esperado.': 'Toast does not contain expected success text.',
    'Nota: Toast não localizado, mas a imagem do avatar foi validada visualmente!': 'Note: Toast not located, but avatar image was visually validated!',
    'Navegar para a página Settings': 'Navigate to Settings page',
    'Aguarda a mudança de URL e dá um tempo para a página desenhar': 'Wait for URL change and give time for page to render',
    'Localizar o botão de Logout seguindo a hierarquia exata': 'Locate Logout button following exact hierarchy',
    'Localizar o modal de confirmação e os seus botões': 'Locate confirmation modal and its buttons',
    'Pequena pausa para garantir que qualquer animação de fade-in do modal termina': 'Short pause to ensure any fade-in animation of modal ends',
    'Validar o redirecionamento para o Login': 'Validate redirection to Login'
};

for (const [pt, en] of Object.entries(dict)) {
    userTest = userTest.split(pt).join(en);
}

// Admin dict
const adminDict = {
    'CARREGAR CREDENCIAIS': 'LOAD CREDENTIALS',
    'Ficheiro admin.credentials.json não encontrado!': 'admin.credentials.json file not found!',
    'O DESCRIBE DEVE ESTAR AQUI NO NÍVEL SUPERIOR': 'DESCRIBE MUST BE HERE AT TOP LEVEL',
    'Aguardar o filtro da tabela processar': 'Wait for table filter to process',
    'Texto Bruto': 'Raw Text',
    'Texto Limpo': 'Clean Text',
    'Esperava que contivesse': 'Expected to contain',
    'mas recebi': 'but received',
    'Toast encontrado, mas texto vazio.': 'Toast found, but text is empty.',
    'Scroll e Espera ANTES de interagir': 'Scroll and Wait BEFORE interacting',
    'Aguardando estabilização da secção após scroll...': 'Waiting for section to stabilize after scroll...',
    'Localizar elementos': 'Locate elements',
    'Escrever a mensagem': 'Write the message',
    'Pausa de 2 segundos antes do envio': '2-second pause before sending',
    'Aguardando 2 segundos antes de enviar...': 'Waiting 2 seconds before sending...',
    'Texto real capturado': 'Actual text captured',
    'O toast foi encontrado, mas o texto ainda estava vazio.': 'Toast was found, but text was still empty.',
    "Esperava uma confirmação de envio (contendo 'sent'), mas recebi": "Expected a send confirmation (containing 'sent'), but received",
    'CORREÇÃO: Usar o texto para ignorar problemas de classes': 'FIX: Use text to ignore class issues',
    'buscando por texto XPath': 'searching by XPath text',
    'Aguarda o filtro': 'Wait for filter',
    'Buscar explicitamente pelo texto do Toast de deleção': 'Search explicitly for deletion Toast text'
};

for (const [pt, en] of Object.entries(adminDict)) {
    adminTest = adminTest.split(pt).join(en);
}

// Replace select interactions in Admin Test to fix bug
const adminSelectBug = `await selects[0].sendKeys("Low");
        await driver.sleep(300);
        // Task Type (index 1)
        await selects[1].sendKeys("Check");
        await driver.sleep(300);
        // Location (index 2)
        await selects[2].sendKeys("Inside");
        await driver.sleep(300);`;

const adminSelectFix = `await selects[0].click();
        await selects[0].findElement(By.xpath(".//option[@value='Low']")).click();
        await driver.sleep(300);
        // Task Type (index 1)
        await selects[1].click();
        await selects[1].findElement(By.xpath(".//option[@value='Check']")).click();
        await driver.sleep(300);
        // Location (index 2)
        await selects[2].click();
        await selects[2].findElement(By.xpath(".//option[@value='Inside']")).click();
        await driver.sleep(300);`;

adminTest = adminTest.replace(adminSelectBug, adminSelectFix);

fs.writeFileSync('tests/user.test.js', userTest);
fs.writeFileSync('tests/admin.test.js', adminTest);
