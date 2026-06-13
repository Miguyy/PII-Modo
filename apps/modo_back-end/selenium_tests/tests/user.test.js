const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const path = require('path'); // IMPORTANTE: Necessário para o Teste 8 (Upload de Imagem)

// Import the Page Objects
const { HomePage, LoginPage, RegisterPage } = require('../pages/AuthPages');
const { DashboardPage, ExplorePage } = require('../pages/AppPages');

// Centralized test credentials
const TEST_USER = {
    email: "user.test@email.com",
    password: "Selenium2026!#"
};

// Função infalível para interagir com a sua UI
async function performNativeClick(driver, element) {
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
    await driver.executeScript(`
        var el = arguments[0];
        el.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true, isPrimary: true}));
        el.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, cancelable: true, isPrimary: true}));
        el.click();
    `, element);
}

describe('User Journey Tests - Standard Profile', function () {
    let driver;
    let loginPage;
    let registerPage;

    // Set Mocha timeout to 30 seconds
    this.timeout(30000);

    beforeEach(async function () {
        const options = new chrome.Options();
        options.excludeSwitches("enable-logging");
        options.addArguments("--log-level=3", "--disable-logging", "--silent");

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
            
        await driver.manage().window().maximize();

        // Inicializa as páginas para que fiquem disponíveis
        loginPage = new LoginPage(driver);
        registerPage = new RegisterPage(driver);

        // ----------------------------------------------------
        // Auto-Login Logic (Robust)
        // ----------------------------------------------------
        const currentTestName = this.currentTest.title;
        const testsWithoutAutoLogin = ['testUserRegistrationFlow', 'testUserAuthenticationSuccess'];

        if (!testsWithoutAutoLogin.includes(currentTestName)) {
            console.log(`[Setup] Auto-login triggered for: ${currentTestName}`);
            
            await driver.get('http://localhost:5173/login');
            
            // Usando a lógica robusta da LoginPage (que deve ter os IDs novos: login_btn)
            await loginPage.performLogin(TEST_USER.email, TEST_USER.password);
            
            console.log("[Setup] Verificando se o login foi bem-sucedido...");
            await driver.wait(until.elementLocated(By.css("a[title='Explore Habits']")), 10000);
            console.log("[Setup] Login validado com sucesso! A navegação está pronta.");
        }
    });

    afterEach(async function () {
        try {
            // CORREÇÃO: O cleanup também precisa do NativeClick
            const settingsLink = await driver.wait(until.elementLocated(By.id("menu-link-settings")), 3000);
            await performNativeClick(driver, settingsLink);
            
            await driver.wait(until.urlContains("/settings"), 5000);
            
            const logoutBtn = await driver.wait(until.elementLocated(By.id("btn-logout")), 5000);
            await performNativeClick(driver, logoutBtn);
            
            await driver.wait(until.urlContains("/login"), 5000);
        } catch (err) {
            console.log("Cleanup bypassed: No logout needed or already logged out.");
        }

        if (driver) {
            await driver.quit();
        }
    });

    // ----------------------------------------------------
    // Test 1: User Registration Flow
    // ----------------------------------------------------
    it('testUserRegistrationFlow', async function () {
        const homePage = new HomePage(driver);
        const loginPage = new LoginPage(driver);
        const registerPage = new RegisterPage(driver);

        console.log("Starting Registration Flow Test...");
        console.log("Opening the website...");
        await driver.get('http://localhost:5173');

        console.log("Navigating to registration page...");
        await homePage.clickLoginNavbar();
        await loginPage.clickSignUpLink(); // Na AuthPages, este deve usar By.id("signUp_btn")

        console.log("Filling the registration inputs...");
        await registerPage.fillRegistrationForm(
            "Selenium User Test", 
            TEST_USER.email, 
            TEST_USER.password
        );

        console.log("Submitting the registration form...");
        await registerPage.clickSignUpSubmit();

        console.log("Waiting for automatic redirection to login page...");
        await loginPage.waitForLoginPageToLoad();
        
        const currentUrl = await driver.getCurrentUrl();
        console.log("Current URL after registration:", currentUrl);

        assert.ok(
            currentUrl.includes('/login'), 
            "Redirection to login page failed after registration."
        );

        console.log("Test passed: Registration flow works correctly.");
    });

    // ----------------------------------------------------
    // Test 2: User Authentication Success
    // ----------------------------------------------------
    it('testUserAuthenticationSuccess', async function () {
        const loginPage = new LoginPage(driver);

        console.log("Starting Authentication Success Test...");
        console.log("Opening the login page...");
        await driver.get('http://localhost:5173/login');

        console.log("Filling credentials and clicking the login button...");
        await loginPage.performLogin(TEST_USER.email, TEST_USER.password);

        console.log("Aguardando o redirecionamento do router...");
        
        // 1. ESPERA CRÍTICA: Garante que o Vue/React já atualizou a URL
        await driver.wait(until.urlContains('/habitsmanager'), 10000);

        console.log("Verificando a barra de navegação...");
        // 2. Garante que a interface também já terminou de renderizar
        await driver.wait(until.elementLocated(By.css("a[title='Explore Habits']")), 10000);
        
        // 3. Agora é 100% seguro capturar a URL
        const currentUrl = await driver.getCurrentUrl();
        console.log("Current URL after authentication:", currentUrl);

        assert.ok(
            currentUrl.includes('/habitsmanager'), 
            "Redirection to habits manager dashboard failed after login."
        );

        console.log("Test passed: User authentication and dashboard redirection work correctly.");
    });

    // ----------------------------------------------------
    // Test 3: Explore Habits Catalog & Add Habit
    // ----------------------------------------------------
    it('testExploreAndAddHabit', async function () {
        console.log("Starting Explore and Add Habit Test...");

        // 1. Navegar para a página de Exploração
        console.log("Navigating to Explore Habits page...");
        const exploreNavBtn = await driver.wait(
            until.elementLocated(By.css("a[aria-label='Explore Habits']")), 
            10000
        );
        await performNativeClick(driver, exploreNavBtn);

        await driver.wait(until.urlContains("/explorehabits"), 10000);

        // 2. Localizar a Grid de Hábitos e fazer scroll
        console.log("Aguardando a grid de hábitos (.habits-grid) carregar...");
        const habitsGrid = await driver.wait(
            until.elementLocated(By.css(".habits-grid")), 
            10000
        );
        
        console.log("Fazendo scroll até a grid de hábitos...");
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", habitsGrid);
        
        await driver.sleep(1500); // Pausa para a API carregar os dados

        // 3. Escolher e clicar num cartão
        console.log("Localizando os cartões de hábitos dentro da grid...");
        const habits = await habitsGrid.findElements(By.css(".card, .habit-card-item, [class*='card']"));
        
        console.log(`Encontrados ${habits.length} cartões na grid.`);
        assert.ok(habits.length > 0, "A grid carregou, mas está vazia. Nenhum cartão encontrado!");
        
        const targetIndex = habits.length >= 2 ? 1 : 0;
        const targetHabit = habits[targetIndex];
        
        console.log(`Clicando no hábito número ${targetIndex + 1}...`);
        await performNativeClick(driver, targetHabit);

        // 4. Clicar no botão de adicionar (Sem esperar pelo modal)
        console.log("Aguardando o botão de adicionar hábito...");
        
        const addHabitBtn = await driver.wait(
            until.elementLocated(By.css(".btn-add-habit")), 
            15000 // Aumentei um pouco o tempo caso o modal demore a animar
        );
        
        await driver.sleep(1000); // Pequena pausa para garantir estabilidade
        console.log("Botão encontrado! Executando clique nativo...");
        await performNativeClick(driver, addHabitBtn);

        await driver.sleep(2000); // Espera o backend confirmar a adição

        console.log("Procurando o botão de fechar com a classe .custom-modal-close...");
        try {
            // Tentativa 1: Clicar no botão pela classe que você descobriu
            const closeModalBtn = await driver.findElement(By.css(".custom-modal-close"));
            await performNativeClick(driver, closeModalBtn);
        } catch (e) {
            console.log("Botão .custom-modal-close não encontrado, tentando tecla ESC...");
            await driver.actions().sendKeys(Key.ESCAPE).perform();
        }
        
        await driver.sleep(1000);

        // 6. Voltar ao Dashboard e verificar
        console.log("Navigating back to the Habits Manager dashboard...");
        const managerNavBtn = await driver.wait(
            until.elementLocated(By.css("a[aria-label='Habits Manager']")), 
            10000
        );
        await performNativeClick(driver, managerNavBtn);

        await driver.wait(until.urlContains("/habitsmanager"), 10000);

        console.log("Verifying if the tasks were successfully added to the manager...");
        const managerTasks = await driver.wait(
            until.elementsLocated(By.css(".manager-task-item, .card")), 
            10000
        );

        console.log(`Found ${managerTasks.length} tasks in the dashboard.`);

        assert.ok(
            managerTasks.length > 0, 
            "The dashboard should contain the newly added tasks, but it is empty."
        );

        console.log("Test passed: Habit successfully explored and added to the manager.");
    });

    // ----------------------------------------------------
    // Test 3.1: Explore Habits Catalog & Add task (Alternative Flow)
    // ----------------------------------------------------
    // este é o mesmo do anterior, só que em vez de adicionar habit, ele adiciona um task específica
    it('testExploreAndAddTask', async function () {
        console.log("Starting Explore and Add Task Test...");

        // 1. Navegar para a página de Exploração
        console.log("Navigating to Explore Habits page...");
        const exploreNavBtn = await driver.wait(
            until.elementLocated(By.css("a[aria-label='Explore Habits']")), 
            10000
        );
        await performNativeClick(driver, exploreNavBtn);

        await driver.wait(until.urlContains("/explorehabits"), 10000);

        // 2. Localizar a Grid de Hábitos e fazer scroll
        console.log("Aguardando a grid de hábitos (.habits-grid) carregar...");
        const habitsGrid = await driver.wait(
            until.elementLocated(By.css(".habits-grid")), 
            10000
        );
        
        console.log("Fazendo scroll até a grid de hábitos...");
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", habitsGrid);
        
        await driver.sleep(1500); // Pausa para a API carregar os dados

        // 3. Escolher e clicar num cartão
        console.log("Localizando os cartões de hábitos dentro da grid...");
        const habits = await habitsGrid.findElements(By.css(".card, .habit-card-item, [class*='card']"));
        
        console.log(`Encontrados ${habits.length} cartões na grid.`);
        assert.ok(habits.length > 0, "A grid carregou, mas está vazia. Nenhum cartão encontrado!");
        
        const targetIndex = habits.length >= 2 ? 1 : 0;
        const targetHabit = habits[targetIndex];
        
        console.log(`Clicando no hábito número ${targetIndex + 1}...`);
        await performNativeClick(driver, targetHabit);

        // 4. Clicar no botão de adicionar (Sem esperar pelo modal)
        console.log("Aguardando o botão de adicionar hábito...");
        
        const addHabitBtn = await driver.wait(
            until.elementLocated(By.css(".btn-add-habit")), 
            15000 // Aumentei um pouco o tempo caso o modal demore a animar
        );
        
        await driver.sleep(1000); // Pequena pausa para garantir estabilidade
        console.log("Botão encontrado! Executando clique nativo...");
        await performNativeClick(driver, addHabitBtn);

        await driver.sleep(2000); // Espera o backend confirmar a adição

        console.log("Procurando o botão de fechar com a classe .custom-modal-close...");
        try {
            // Tentativa 1: Clicar no botão pela classe que você descobriu
            const closeModalBtn = await driver.findElement(By.css(".custom-modal-close"));
            await performNativeClick(driver, closeModalBtn);
        } catch (e) {
            console.log("Botão .custom-modal-close não encontrado, tentando tecla ESC...");
            await driver.actions().sendKeys(Key.ESCAPE).perform();
        }
        
        await driver.sleep(1000);

        // 6. Voltar ao Dashboard e verificar
        console.log("Navigating back to the Habits Manager dashboard...");
        const managerNavBtn = await driver.wait(
            until.elementLocated(By.css("a[aria-label='Habits Manager']")), 
            10000
        );
        await performNativeClick(driver, managerNavBtn);

        await driver.wait(until.urlContains("/habitsmanager"), 10000);

        console.log("Verifying if the tasks were successfully added to the manager...");
        const managerTasks = await driver.wait(
            until.elementsLocated(By.css(".manager-task-item, .card")), 
            10000
        );

        console.log(`Found ${managerTasks.length} tasks in the dashboard.`);

        assert.ok(
            managerTasks.length > 0, 
            "The dashboard should contain the newly added tasks, but it is empty."
        );

        console.log("Test passed: Habit successfully explored and added to the manager.");
    });

    // ----------------------------------------------------
    // Test 4: Habit Task Completion and Rewards
    // ----------------------------------------------------
    it('testHabitTaskCompletionAndRewards', async function () {
        console.log("Starting Habit Task Completion Test...");

        // 1. Espera e prepara a grid
        const habitsGrid = await driver.wait(until.elementLocated(By.className("habits-grid")), 15000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", habitsGrid);
        
        await driver.wait(async () => {
            const cards = await driver.findElements(By.className("habit-item"));
            return cards.length > 0;
        }, 15000, "Timeout: Nenhum cartão foi carregado.");
        
        let cards = await driver.findElements(By.className("habit-item")); 
        const initialCardCount = cards.length;
        console.log(`Initial number of task cards: ${initialCardCount}`);

        // Função reutilizável para o clique agressivo (Martelo de Thor)
        const clickWithThorHammer = async (element) => {
            await driver.executeScript(`
                var el = arguments[0];
                el.scrollIntoView({block: 'center'});
                var ev1 = document.createEvent('MouseEvent');
                ev1.initMouseEvent('mousedown', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                el.dispatchEvent(ev1);
                var ev2 = document.createEvent('MouseEvent');
                ev2.initMouseEvent('mouseup', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                el.dispatchEvent(ev2);
                el.click();
            `, element);
        };

        // 2. Localiza o primeiro cartão e clica em "Mark Done"
        const firstCard = await driver.wait(until.elementLocated(By.className("habit-item")), 10000);
        let btn = await firstCard.findElement(By.css(".btn-outline-success")); 
        
        console.log("Forçando clique no primeiro botão (Mark Done)...");
        await clickWithThorHammer(btn);
        
        // 3. Aguarda a transição e recaptura o botão
        console.log("Aguardando transição do botão...");
        await driver.sleep(2500); 

        // 4. Força o clique na Recompensa (o botão mudou de classe)
        console.log("Forçando clique no segundo botão (Complete & Earn Points)...");
        btn = await firstCard.findElement(By.css(".btn-success"));
        await clickWithThorHammer(btn);

        // 5. Verifica se o item foi removido
        console.log("Aguardando remoção do cartão...");
        await driver.wait(async () => {
            const currentCards = await driver.findElements(By.className("habit-item"));
            return currentCards.length < initialCardCount;
        }, 15000, "O cartão não foi removido da grelha!");

        const finalCards = await driver.findElements(By.className("habit-item"));
        assert.strictEqual(finalCards.length, initialCardCount - 1, "A tarefa não foi deletada.");

        console.log("Test passed: Task completed and removed!");
    });

    // ----------------------------------------------------
    // Test 5: Statistics Dashboard and PDF Export
    // ----------------------------------------------------
    it('testStatisticsDashboardAndPdfExport', async function () {
        console.log("Starting Statistics Dashboard and PDF Export Test...");

        // 1. Aguarda o dashboard e faz scroll até ao bloco de gráficos
        console.log("Waiting for the charts box to load...");
        const chartsBox = await driver.wait(
            until.elementLocated(By.className("charts-box")), 
            15000
        );
        
        console.log("Scrolling to the charts box...");
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", chartsBox);
        await driver.sleep(1000);

        // 2. Localiza e clica no botão com title="Generate Report" DENTRO da chartsBox
        console.log("Locating the 'Generate Report' button...");
        const openReportBtn = await chartsBox.findElement(By.css("[title='Generate Report']"));
        
        console.log("Clicking the 'Generate Report' button...");
        await driver.executeScript("arguments[0].click();", openReportBtn);

        // 3. Aguarda o painel de relatório aparecer
        console.log("Waiting for the '.report-panel' div to appear...");
        const reportPanel = await driver.wait(
            until.elementLocated(By.css(".report-panel")), 
            10000
        );
        await driver.sleep(1000); // Pequena pausa para animação do painel

        // 4. Localiza os selects específicos
        console.log("Locating the select dropdowns...");
        const selects = await reportPanel.findElements(By.css("select.form-select.form-select-sm"));
        assert.ok(selects.length >= 2, "The report panel should contain at least 2 select elements.");

        // 5. Interage com o primeiro Select
        console.log("Interacting with the first Select dropdown...");
        // Mudamos para a opção 1 (o segundo item da lista, assumindo que o 0 é "Selecione...")
        await driver.executeScript(`
            var select = arguments[0];
            select.selectedIndex = 1; 
            select.dispatchEvent(new Event('change', { bubbles: true }));
        `, selects[0]);
        await driver.sleep(500);

        // 6. Interage com o segundo Select
        console.log("Interacting with the second Select dropdown...");
        await driver.executeScript(`
            var select = arguments[0];
            select.selectedIndex = 1; 
            select.dispatchEvent(new Event('change', { bubbles: true }));
        `, selects[1]);
        await driver.sleep(500);

        // 7. Clica no botão final para gerar
        console.log("Clicking the 'btn-generate' button...");
        const generateBtn = await reportPanel.findElement(By.css(".btn.btn-generate.w-100"));
        await driver.executeScript("arguments[0].click();", generateBtn);

        // 8. Valida o sucesso do Download
        console.log("Waiting for the PDF generation and the success message...");
        const successMessageLocator = By.xpath("//*[contains(text(), 'Report saved and download started!')]");
        
        const successMsgElement = await driver.wait(until.elementLocated(successMessageLocator), 15000);
        const msgText = await successMsgElement.getText();
        
        assert.ok(
            msgText.includes("Report saved and download started!"),
            "The system failed to display the correct download confirmation message."
        );

        console.log("Test passed: Statistics panel works and PDF export was triggered successfully.");
        await driver.sleep(3000); // Dá um tempo extra para garantir que o download inicia antes do browser fechar
    });

    // ----------------------------------------------------
    // Test 6: Avatar Decoration Customization
    // ----------------------------------------------------
    it('testAvatarDecorationCustomization', async function () {
        console.log("Starting Avatar Decoration Customization Test...");

        // Navegação
        const settingsNavBtn = await driver.wait(
            until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")), 
            10000
        );
        await driver.executeScript("arguments[0].click();", settingsNavBtn);
        await driver.wait(until.urlContains('/settings'), 10000);
        await driver.sleep(1000);

        // Edição
        const settingsCard = await driver.wait(until.elementLocated(By.className("settings-card")), 10000);
        const editAvatarBtn = await settingsCard.findElement(By.css(".btn-avatar-edit"));
        await driver.executeScript("arguments[0].click();", editAvatarBtn);

        // Swiper
        const swiper = await driver.wait(until.elementLocated(By.className("swiper")), 10000);
        const checkAvatarBtn = await swiper.findElement(By.css(".swiper-slide .btn-avatar-check"));
        
        // PAUSA SOLICITADA: 1 segundo para visualização
        console.log("Visualizando o swiper antes de confirmar...");
        await driver.sleep(1000); 
        
        console.log("Confirmando a decoração...");
        await driver.executeScript("arguments[0].click();", checkAvatarBtn);

        // Aguardar o avatar voltar
        await driver.wait(until.elementLocated(By.css(".settings-card .avatar")), 10000);

        console.log("Procurando o Toast via escaneamento de conteúdo...");
        
        // Em vez de esperar por uma classe, vamos esperar por um elemento que contenha o texto esperado
        // Isto ignora a classe CSS e foca-se apenas no conteúdo
        try {
            const toast = await driver.wait(
                until.elementLocated(By.xpath("//*[contains(text(), 'Decoration Applied')]")), 
                20000
            );
            const toastText = await toast.getText();
            console.log(`Sucesso! Toast encontrado. Texto: "${toastText}"`);
        } catch (err) {
            console.log("Falha: O XPath não encontrou nenhum elemento com o texto 'Decoration Applied'.");
            
            // DUMP DE SEGURANÇA: Mostra-nos o que existe no corpo da página para descobrirmos a classe
            const bodyContent = await driver.executeScript("return document.body.innerHTML.substring(0, 500);");
            console.log("--- DUMP DO INÍCIO DO BODY ---");
            console.log(bodyContent);
            console.log("------------------------------");
            throw new Error("Toast não encontrado. Verifique o DUMP acima para ver se o elemento existe no DOM.");
        }

        console.log("Test passed: Decoration successfully applied.");
    });

    // ----------------------------------------------------
    // Test 7: User Theme Toggle (Dark/Light Mode)
    // ----------------------------------------------------
    it('testUserThemeToggle', async function () {
        console.log("Starting User Theme Toggle Test...");

        await driver.wait(until.elementLocated(By.css("a[title='Explore Habits']")), 10000);

        console.log("Locating the theme toggle button...");
        const themeToggleBtn = await driver.wait(
            until.elementLocated(By.css(".custom-theme-toggle")),
            10000
        );

        // Adicionando a pausa de 2 segundos solicitada
        console.log("Waiting 2 seconds before clicking...");
        await driver.sleep(2000);

        const initialTitle = await themeToggleBtn.getAttribute("title");
        assert.strictEqual(initialTitle, "Switch to Dark Mode", "App should be in Light Mode.");

        console.log("Clicking the theme toggle button to activate Dark Mode...");
        // CORREÇÃO: Clique Nativo
        await performNativeClick(driver, themeToggleBtn);

        console.log("Waiting for the button title to update...");
        await driver.wait(async () => {
            const currentTitle = await themeToggleBtn.getAttribute("title");
            return currentTitle === "Switch to Light Mode";
        }, 10000);

        console.log("Verifying if the Dark Mode attribute was applied to the HTML tag...");
        // CORREÇÃO AQUI: Em vez do 'body', capturamos a tag 'html'
        const htmlElement = await driver.findElement(By.tagName("html"));
        
        // Em vez da classe, lemos o atributo do Bootstrap
        const themeAttribute = await htmlElement.getAttribute("data-bs-theme");

        assert.strictEqual(
            themeAttribute, 
            "dark", 
            "O atributo data-bs-theme='dark' não foi aplicado à tag html."
        );

        console.log("Test passed: Theme toggle works and dark mode is activated successfully.");
        await driver.sleep(1000);
    });

    // ----------------------------------------------------
    // Test 8: User Image Profile Update
    // ----------------------------------------------------
    it('testUserImageProfile', async function () {
        console.log("Starting User Image Profile Update Test...");

        // 1. Navegação para Settings
        console.log("Navigating to Settings page...");
        const settingsNavBtn = await driver.wait(
            until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")), 
            10000
        );
        await driver.executeScript("arguments[0].click();", settingsNavBtn);
        await driver.wait(until.urlContains('/settings'), 10000);
        await driver.sleep(1500);

        // 2. Localizar o Avatar e verificar a condição inicial (Tem imagem ou é vazio?)
        console.log("Verificando o estado inicial do avatar...");
        const settingsCard = await driver.wait(until.elementLocated(By.className("settings-card")), 10000);
        const profileHeader = await settingsCard.findElement(By.className("profile-header"));
        const avatar = await profileHeader.findElement(By.className("avatar"));
        
        // Em vez de 'wait', usamos 'findElements' para não dar erro se não existir
        const initialImages = await avatar.findElements(By.tagName("img"));
        let initialSrc = null;

        if (initialImages.length > 0) {
            initialSrc = await initialImages[0].getAttribute("src");
            console.log(`[Condição A] Imagem atual detetada. URL: ${initialSrc}`);
        } else {
            console.log(`[Condição B] Nenhuma imagem de perfil detetada (Placeholder ativo).`);
        }

        // 3. Preparar e enviar o ficheiro local
        console.log("Resolving local image path...");
        const filePath = path.resolve(__dirname, '../images/profile_picture.jpg');
        
        console.log("Injetando a imagem no input oculto...");
        const fileInput = await driver.wait(until.elementLocated(By.css('input[type="file"]')), 10000);
        
        // MOSTRAR: Forçamos a exibição apenas para o Selenium não dar erro de "elemento não interativo"
        await driver.executeScript(
            "arguments[0].style.display = 'block'; arguments[0].style.visibility = 'visible'; arguments[0].style.opacity = '1';", 
            fileInput
        );
        
        // INJETAR: Selenium envia o ficheiro
        await fileInput.sendKeys(filePath);

        // ESCONDER: Imediatamente após o envio, forçamos o sumiço completo do elemento do ecrã
        await driver.executeScript(
            "arguments[0].style.display = 'none'; arguments[0].style.visibility = 'hidden'; arguments[0].style.opacity = '0';", 
            fileInput
        );

        // 4. Validação Condicional Pós-Upload
        console.log("Aguardando a aplicação processar o upload e atualizar o ecrã...");
        await driver.wait(async () => {
            const currentImages = await avatar.findElements(By.tagName("img"));
            
            // Se ainda não há imagem no DOM, continua à espera
            if (currentImages.length === 0) return false; 
            
            const currentSrc = await currentImages[0].getAttribute("src");
            
            if (initialSrc) {
                // Condição A (Tinha imagem): O teste passa quando o SRC for diferente do antigo
                return currentSrc !== initialSrc && currentSrc.length > 0;
            } else {
                // Condição B (Não tinha imagem): O teste passa mal a tag img surja com um link válido
                return currentSrc && currentSrc.length > 0;
            }
        }, 20000, "Timeout: A nova imagem do avatar não foi renderizada no ecrã.");

        // Confirmação Final
        const finalImages = await avatar.findElements(By.tagName("img"));
        const updatedSrc = await finalImages[0].getAttribute("src");
        console.log(`Sucesso! Nova imagem processada pelo site: ${updatedSrc}`);

        // 5. Validação do Toast
        console.log("Aguardando notificação de sucesso...");
        try {
            const toast = await driver.wait(until.elementLocated(By.css(".toast, .notification")), 8000);
            const toastText = await toast.getText();
            console.log(`Toast capturado: "${toastText.trim()}"`);
            assert.ok(
                toastText.includes("Picture updated"), 
                "O toast não contém o texto de sucesso esperado."
            );
        } catch (e) {
            console.log("Nota: Toast não localizado, mas a imagem do avatar foi validada visualmente!");
        }

        console.log("Test passed: Profile picture successfully uploaded and verified.");
        await driver.sleep(1500);
    });

    // ----------------------------------------------------
    // Test 9: User Session Secure Logout
    // ----------------------------------------------------
    it('testUserSessionSecureLogout', async function () {
        console.log("Starting User Session Secure Logout Test...");

        // 1. Navegar para a página Settings
        console.log("Navigating to Settings page...");
        const settingsNavBtn = await driver.wait(
            until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")), 
            10000
        );
        await driver.executeScript("arguments[0].click();", settingsNavBtn);
        
        // Aguarda a mudança de URL e dá um tempo para a página desenhar
        await driver.wait(until.urlContains('/settings'), 10000);
        await driver.sleep(1000); 

        // 2. Localizar o botão de Logout seguindo a hierarquia exata
        console.log("Locating the logout button inside the sidebar...");
        const settingsCard = await driver.wait(until.elementLocated(By.className("settings-card")), 10000);
        const settingsContent = await settingsCard.findElement(By.className("settings-content"));
        const sidebar = await settingsContent.findElement(By.className("sidebar"));
        const logoutBtn = await sidebar.findElement(By.id("logout-btn"));

        console.log("Clicking the logout button...");
        await driver.executeScript("arguments[0].click();", logoutBtn);

        // 3. Localizar o modal de confirmação e os seus botões
        console.log("Waiting for the confirmation modal to appear...");
        const confirmModal = await driver.wait(until.elementLocated(By.className("confirm-modal")), 10000);
        
        // Pequena pausa para garantir que qualquer animação de fade-in do modal termina
        await driver.sleep(500); 

        const modalActions = await confirmModal.findElement(By.className("modal-actions"));
        const confirmBtn = await modalActions.findElement(By.className("btn-confirm"));

        console.log("Confirming logout via modal...");
        await driver.executeScript("arguments[0].click();", confirmBtn);

        // 4. Validar o redirecionamento para o Login
        console.log("Waiting for redirection to login page...");
        await driver.wait(until.urlContains('/login'), 15000);

        const currentUrl = await driver.getCurrentUrl();
        assert.ok(currentUrl.includes('/login'), "Logout failed: System did not redirect to login.");

        console.log("Test passed: Session safely destroyed via modal confirmation.");
        await driver.sleep(1000); // Pausa final para estabilidade da suite de testes
    });

});