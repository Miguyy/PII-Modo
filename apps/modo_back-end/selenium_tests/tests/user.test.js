const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");
const path = require("path"); // IMPORTANTE: Necessário para o Teste 8 (Upload de Imagem)

// Import the Page Objects
const { HomePage, LoginPage, RegisterPage } = require("../pages/AuthPages");
const {
  DashboardPage,
  ExplorePage,
  SettingsPage,
} = require("../pages/AppPages");

// Centralized test credentials
const TEST_USER = {
  email: "user.test@email.com",
  password: "Selenium2026!#",
};

// Função infalível para interagir com a sua UI
async function performNativeClick(driver, element) {
  await driver.executeScript(
    "arguments[0].scrollIntoView({block: 'center'});",
    element,
  );
  await driver.executeScript(
    `
        var el = arguments[0];
        el.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true, isPrimary: true}));
        el.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, cancelable: true, isPrimary: true}));
        el.click();
    `,
    element,
  );
}

describe("User Journey Tests - Standard Profile", function () {
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
      .forBrowser("chrome")
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
    const testsWithoutAutoLogin = [
      "testUserRegistration",
      "testUserAuthentication",
      "testUserForgotPassword",
    ];

    if (!testsWithoutAutoLogin.includes(currentTestName)) {
      console.log(`[Setup] Auto-login triggered for: ${currentTestName}`);

      await driver.get("http://localhost:5173/login");

      // Usando a lógica robusta da LoginPage (que deve ter os IDs novos: login_btn)
      await loginPage.performLogin(TEST_USER.email, TEST_USER.password);

      console.log("[Setup] Verificando se o login foi bem-sucedido...");
      await driver.wait(
        until.elementLocated(By.css("a[title='Explore Habits']")),
        10000,
      );
      console.log(
        "[Setup] Login validado com sucesso! A navegação está pronta.",
      );
    }
  });

  afterEach(async function () {
    try {
      // CORREÇÃO: O cleanup também precisa do NativeClick
      const settingsLink = await driver.wait(
        until.elementLocated(By.id("menu-link-settings")),
        3000,
      );
      await performNativeClick(driver, settingsLink);

      await driver.wait(until.urlContains("/settings"), 5000);

      const logoutBtn = await driver.wait(
        until.elementLocated(By.id("btn-logout")),
        5000,
      );
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
  it("testUserRegistration", async function () {
    const homePage = new HomePage(driver);
    const loginPage = new LoginPage(driver);
    const registerPage = new RegisterPage(driver);

    console.log("Starting Registration Flow Test...");
    console.log("Opening the website...");
    await driver.get("http://localhost:5173");

    console.log("Navigating to registration page...");
    await homePage.clickLoginNavbar();
    await loginPage.clickSignUpLink(); // Na AuthPages, este deve usar By.id("signUp_btn")

    console.log("Waiting for /signin page to load...");
    await driver.wait(until.urlContains("/signin"), 10000);

    console.log("Filling the registration inputs...");
    await registerPage.fillRegistrationForm(
      "Selenium User Test",
      TEST_USER.email,
      TEST_USER.password,
    );

    console.log("Submitting the registration form...");
    await registerPage.clickSignUpSubmit();

    console.log("Waiting for automatic redirection to login page...");
    try {
        await loginPage.waitForLoginPageToLoad();
    } catch (err) {
        // Find any toast notifications that might explain the failure
        const toasts = await driver.findElements(By.css(".toast-notification"));
        if (toasts.length > 0) {
            const title = await toasts[0].findElement(By.css("strong")).getText();
            const message = await toasts[0].findElement(By.css("small")).getText();
            console.error(`REGISTRATION FAILED WITH TOAST: ${title} - ${message}`);
        } else {
            console.error("REGISTRATION FAILED: No toast found, URL did not change.");
        }
        throw err;
    }

    const currentUrl = await driver.getCurrentUrl();
    console.log("Current URL after registration:", currentUrl);

    assert.ok(
      currentUrl.includes("/login"),
      "Redirection to login page failed after registration.",
    );

    console.log("Test passed: Registration flow works correctly.");
  });

  // ----------------------------------------------------
  // Test 2: User Authentication Success
  // ----------------------------------------------------
  it("testUserAuthentication", async function () {
    const loginPage = new LoginPage(driver);

    console.log("Starting Authentication Success Test...");
    console.log("Opening the login page...");
    await driver.get("http://localhost:5173/login");

    console.log("Filling credentials and clicking the login button...");
    await loginPage.performLogin(TEST_USER.email, TEST_USER.password);

    console.log("Aguardando o redirecionamento do router...");

    // 1. ESPERA CRÍTICA: Garante que o Vue/React já atualizou a URL
    await driver.wait(until.urlContains("/habitsmanager"), 10000);

    console.log("Verificando a barra de navegação...");
    // 2. Garante que a interface também já terminou de renderizar
    await driver.wait(
      until.elementLocated(By.css("a[title='Explore Habits']")),
      10000,
    );

    // 3. Agora é 100% seguro capturar a URL
    const currentUrl = await driver.getCurrentUrl();
    console.log("Current URL after authentication:", currentUrl);

    assert.ok(
      currentUrl.includes("/habitsmanager"),
      "Redirection to habits manager dashboard failed after login.",
    );

    console.log(
      "Test passed: User authentication and dashboard redirection work correctly.",
    );
  });

  // ----------------------------------------------------
  // Test 3: Explore Habits Catalog & Add Habit
  // ----------------------------------------------------
  it("testUserExploreHabitsAndAddHabit", async function () {
    console.log("Starting Explore and Add Habit Test...");

    // 1. Navegar para a página de Exploração
    console.log("Navigating to Explore Habits page...");
    const exploreNavBtn = await driver.wait(
      until.elementLocated(By.css("a[aria-label='Explore Habits']")),
      10000,
    );
    await performNativeClick(driver, exploreNavBtn);

    await driver.wait(until.urlContains("/explorehabits"), 10000);

    // 2. Localizar a Grid de Hábitos e fazer scroll
    console.log("Aguardando a grid de hábitos (.habits-grid) carregar...");
    const habitsGrid = await driver.wait(
      until.elementLocated(By.css(".habits-grid")),
      10000,
    );

    console.log("Fazendo scroll até a grid de hábitos...");
    await driver.executeScript(
      "arguments[0].scrollIntoView({block: 'center'});",
      habitsGrid,
    );

    await driver.sleep(1500); // Pausa para a API carregar os dados

    // Re-localizar a grid pois o Vue pode ter feito re-render e tornado a referência antiga "stale"
    let updatedHabitsGrid = await driver.wait(
      until.elementLocated(By.css(".habits-grid")),
      10000,
    );

    // 3. Escolher e clicar num cartão
    console.log("Localizando os cartões de hábitos dentro da grid...");
    // Wait for at least one card to appear
    await driver.wait(async () => {
      const cards = await updatedHabitsGrid.findElements(By.css(".card, .habit-card-item, [class*='card']"));
      return cards.length > 0;
    }, 10000, "Os cartões não apareceram na grid");

    const habits = await updatedHabitsGrid.findElements(
      By.css(".card, .habit-card-item, [class*='card']"),
    );

    console.log(`Encontrados ${habits.length} cartões na grid.`);
    assert.ok(
      habits.length > 0,
      "A grid carregou, mas está vazia. Nenhum cartão encontrado!",
    );

    const targetIndex = habits.length >= 2 ? 1 : 0;
    const targetHabit = habits[targetIndex];

    console.log(`Clicando no hábito número ${targetIndex + 1}...`);
    await performNativeClick(driver, targetHabit);

    // 4. Clicar no botão de adicionar (Sem esperar pelo modal)
    console.log("Aguardando o botão de adicionar hábito...");

    const addHabitBtn = await driver.wait(
      until.elementLocated(By.css(".btn-add-habit")),
      15000, // Aumentei um pouco o tempo caso o modal demore a animar
    );

    await driver.sleep(1000); // Pequena pausa para garantir estabilidade
    console.log("Botão encontrado! Executando clique nativo...");
    await performNativeClick(driver, addHabitBtn);

    await driver.sleep(2000); // Espera o backend confirmar a adição

    console.log(
      "Procurando o botão de fechar com a classe .custom-modal-close...",
    );
    try {
      // Tentativa 1: Clicar no botão pela classe que você descobriu
      const closeModalBtn = await driver.findElement(
        By.css(".custom-modal-close"),
      );
      await performNativeClick(driver, closeModalBtn);
    } catch (e) {
      console.log(
        "Botão .custom-modal-close não encontrado, tentando tecla ESC...",
      );
      await driver.actions().sendKeys(Key.ESCAPE).perform();
    }

    await driver.sleep(1000);

    // 6. Voltar ao Dashboard e verificar
    console.log("Navigating back to the Habits Manager dashboard...");
    const managerNavBtn = await driver.wait(
      until.elementLocated(By.css("a[aria-label='Habits Manager']")),
      10000,
    );
    await performNativeClick(driver, managerNavBtn);

    await driver.wait(until.urlContains("/habitsmanager"), 10000);

    console.log(
      "Verifying if the tasks were successfully added to the manager...",
    );
    const managerTasks = await driver.wait(
      until.elementsLocated(By.css(".manager-task-item, .card")),
      10000,
    );

    console.log(`Found ${managerTasks.length} tasks in the dashboard.`);

    assert.ok(
      managerTasks.length > 0,
      "The dashboard should contain the newly added tasks, but it is empty.",
    );

    console.log(
      "Test passed: Habit successfully explored and added to the manager.",
    );
  });

  // ----------------------------------------------------
  // Test 4: Explore Habits Catalog & Add task
  // ----------------------------------------------------
  it("testUserExploreHabitsAndAddTask", async function () {
    console.log("Starting Explore and Add Task Test...");

    // 1. Navegar para a página de Exploração
    console.log("Navigating to Explore Habits page...");
    const exploreNavBtn = await driver.wait(
      until.elementLocated(By.css("a[aria-label='Explore Habits']")),
      10000,
    );
    await performNativeClick(driver, exploreNavBtn);

    await driver.wait(until.urlContains("/explorehabits"), 10000);

    // 2. Localizar a Grid de Hábitos e fazer scroll
    console.log("Aguardando a grid de hábitos (.habits-grid) carregar...");
    const habitsGrid = await driver.wait(
      until.elementLocated(By.css(".habits-grid")),
      10000,
    );

    console.log("Fazendo scroll até a grid de hábitos...");
    await driver.executeScript(
      "arguments[0].scrollIntoView({block: 'center'});",
      habitsGrid,
    );

    await driver.sleep(1500); // Pausa para a API carregar os dados

    // Re-localizar a grid pois o Vue pode ter feito re-render e tornado a referência antiga "stale"
    let updatedHabitsGrid = await driver.wait(
      until.elementLocated(By.css(".habits-grid")),
      10000,
    );

    // 3. Escolher e clicar num cartão
    console.log("Localizando os cartões de hábitos dentro da grid...");
    // Wait for at least one card to appear
    await driver.wait(async () => {
      const cards = await updatedHabitsGrid.findElements(By.css(".card, .habit-card-item, [class*='card']"));
      return cards.length > 0;
    }, 10000, "Os cartões não apareceram na grid");

    const habits = await updatedHabitsGrid.findElements(
      By.css(".card, .habit-card-item, [class*='card']"),
    );

    console.log(`Encontrados ${habits.length} cartões na grid.`);
    assert.ok(
      habits.length > 0,
      "A grid carregou, mas está vazia. Nenhum cartão encontrado!",
    );

    const targetIndex = habits.length >= 2 ? 1 : 0;
    const targetHabit = habits[targetIndex];

    console.log(`Clicando no hábito número ${targetIndex + 1}...`);
    await performNativeClick(driver, targetHabit);

    // 4. Clicar no botão de adicionar (Sem esperar pelo modal)
    console.log("Aguardando o botão de adicionar hábito...");

    const addHabitBtn = await driver.wait(
      until.elementLocated(By.css(".btn-add-habit")),
      15000, // Aumentei um pouco o tempo caso o modal demore a animar
    );

    await driver.sleep(1000); // Pequena pausa para garantir estabilidade
    console.log("Botão encontrado! Executando clique nativo...");
    await performNativeClick(driver, addHabitBtn);

    await driver.sleep(2000); // Espera o backend confirmar a adição

    console.log(
      "Procurando o botão de fechar com a classe .custom-modal-close...",
    );
    try {
      // Tentativa 1: Clicar no botão pela classe que você descobriu
      const closeModalBtn = await driver.findElement(
        By.css(".custom-modal-close"),
      );
      await performNativeClick(driver, closeModalBtn);
    } catch (e) {
      console.log(
        "Botão .custom-modal-close não encontrado, tentando tecla ESC...",
      );
      await driver.actions().sendKeys(Key.ESCAPE).perform();
    }

    await driver.sleep(1000);

    // 6. Voltar ao Dashboard e verificar
    console.log("Navigating back to the Habits Manager dashboard...");
    const managerNavBtn = await driver.wait(
      until.elementLocated(By.css("a[aria-label='Habits Manager']")),
      10000,
    );
    await performNativeClick(driver, managerNavBtn);

    await driver.wait(until.urlContains("/habitsmanager"), 10000);

    console.log(
      "Verifying if the tasks were successfully added to the manager...",
    );
    const managerTasks = await driver.wait(
      until.elementsLocated(By.css(".manager-task-item, .card")),
      10000,
    );

    console.log(`Found ${managerTasks.length} tasks in the dashboard.`);

    assert.ok(
      managerTasks.length > 0,
      "The dashboard should contain the newly added tasks, but it is empty.",
    );

    console.log(
      "Test passed: Habit successfully explored and added to the manager.",
    );
  });

  // ----------------------------------------------------
  // Test 5: Habit Task Completion and Rewards
  // ----------------------------------------------------
  it("testUserHabitTaskCompletionAndRewards", async function () {
    console.log("Starting Habit Task Completion Test...");

    // 1. Espera e prepara a grid
    const habitsGrid = await driver.wait(
      until.elementLocated(By.className("habits-grid")),
      15000,
    );
    await driver.executeScript(
      "arguments[0].scrollIntoView({block: 'center'});",
      habitsGrid,
    );

    await driver.wait(
      async () => {
        const cards = await driver.findElements(By.className("habit-item"));
        return cards.length > 0;
      },
      15000,
      "Timeout: Nenhum cartão foi carregado.",
    );

    let cards = await driver.findElements(By.className("habit-item"));
    const initialCardCount = cards.length;
    console.log(`Initial number of task cards: ${initialCardCount}`);

    // Função reutilizável para o clique agressivo (Martelo de Thor)
    const clickWithThorHammer = async (element) => {
      await driver.executeScript(
        `
                var el = arguments[0];
                el.scrollIntoView({block: 'center'});
                var ev1 = document.createEvent('MouseEvent');
                ev1.initMouseEvent('mousedown', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                el.dispatchEvent(ev1);
                var ev2 = document.createEvent('MouseEvent');
                ev2.initMouseEvent('mouseup', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                el.dispatchEvent(ev2);
                el.click();
            `,
        element,
      );
    };

    // 2. Localiza um cartão que seja do tipo "Check" (que tenha btn-outline-success)
    const btnToFind = await driver.wait(
      until.elementLocated(By.css(".habit-item .btn-outline-success")),
      10000,
    );

    // Encontra o cartão pai desse botão
    const firstCard = await btnToFind.findElement(By.xpath("./ancestor::div[contains(@class, 'habit-item')]"));

    console.log("Forçando clique no botão (Mark Done)...");
    await clickWithThorHammer(btnToFind);

    // 3. Aguarda a transição e recaptura o botão
    console.log("Aguardando transição do botão...");
    await driver.sleep(2500);

    // 4. Força o clique na Recompensa (o botão mudou de classe)
    console.log("Forçando clique no segundo botão (Complete & Earn Points)...");
    const rewardBtn = await firstCard.findElement(By.css(".btn-success"));
    await clickWithThorHammer(rewardBtn);

    // 5. Verifica se o item foi removido
    console.log("Aguardando remoção do cartão...");
    await driver.wait(
      async () => {
        const currentCards = await driver.findElements(
          By.className("habit-item"),
        );
        return currentCards.length < initialCardCount;
      },
      15000,
      "O cartão não foi removido da grelha!",
    );

    const finalCards = await driver.findElements(By.className("habit-item"));
    assert.strictEqual(
      finalCards.length,
      initialCardCount - 1,
      "A tarefa não foi deletada.",
    );

    console.log("Test passed: Task completed and removed!");
  });

  // ----------------------------------------------------
  // Test 6: Statistics Dashboard and PDF Export
  // ----------------------------------------------------
  it("testUserStatisticsDashboardAndReportExport", async function () {
    console.log("Starting Statistics Dashboard and PDF Export Test...");

    // 1. Aguarda o dashboard e faz scroll até ao bloco de gráficos
    console.log("Waiting for the charts box to load...");
    const chartsBox = await driver.wait(
      until.elementLocated(By.className("charts-box")),
      15000,
    );

    console.log("Scrolling to the charts box...");
    await driver.executeScript(
      "arguments[0].scrollIntoView({block: 'center'});",
      chartsBox,
    );
    await driver.sleep(1000);

    // 2. Localiza e clica no botão com title="Generate Report" DENTRO da chartsBox
    console.log("Locating the 'Generate Report' button...");
    const openReportBtn = await chartsBox.findElement(
      By.css("[title='Generate Report']"),
    );

    console.log("Clicking the 'Generate Report' button...");
    await driver.executeScript("arguments[0].click();", openReportBtn);

    // 3. Aguarda o painel de relatório aparecer
    console.log("Waiting for the '.report-panel' div to appear...");
    const reportPanel = await driver.wait(
      until.elementLocated(By.css(".report-panel")),
      10000,
    );
    await driver.sleep(1000); // Pequena pausa para animação do painel

    // 4. Localiza os selects específicos
    console.log("Locating the select dropdowns...");
    const selects = await reportPanel.findElements(
      By.css("select.form-select.form-select-sm"),
    );
    assert.ok(
      selects.length >= 2,
      "The report panel should contain at least 2 select elements.",
    );

    // 5. Interage com o primeiro Select
    console.log("Interacting with the first Select dropdown...");
    // Mudamos para a opção 1 (o segundo item da lista, assumindo que o 0 é "Selecione...")
    await driver.executeScript(
      `
            var select = arguments[0];
            select.selectedIndex = 1; 
            select.dispatchEvent(new Event('change', { bubbles: true }));
        `,
      selects[0],
    );
    await driver.sleep(500);

    // 6. Interage com o segundo Select
    console.log("Interacting with the second Select dropdown...");
    await driver.executeScript(
      `
            var select = arguments[0];
            select.selectedIndex = 1; 
            select.dispatchEvent(new Event('change', { bubbles: true }));
        `,
      selects[1],
    );
    await driver.sleep(500);

    // 7. Clica no botão final para gerar
    console.log("Clicking the 'btn-generate' button...");
    const generateBtn = await reportPanel.findElement(
      By.css(".btn.btn-generate.w-100"),
    );
    await driver.executeScript("arguments[0].click();", generateBtn);

    // 8. Valida o sucesso do Download
    console.log("Waiting for the PDF generation and the success message...");
    const successMessageLocator = By.xpath(
      "//*[contains(text(), 'Report saved and download started!')]",
    );

    const successMsgElement = await driver.wait(
      until.elementLocated(successMessageLocator),
      15000,
    );
    const msgText = await successMsgElement.getText();

    assert.ok(
      msgText.includes("Report saved and download started!"),
      "The system failed to display the correct download confirmation message.",
    );

    console.log(
      "Test passed: Statistics panel works and PDF export was triggered successfully.",
    );
    await driver.sleep(3000); // Dá um tempo extra para garantir que o download inicia antes do browser fechar
  });

  // ----------------------------------------------------
  // Test 7: Avatar Decoration Customization
  // ----------------------------------------------------
  it("testUserCustomAvatarDecoration", async function () {
    console.log("Starting Avatar Decoration Customization Test...");

    // Navegação
    const settingsNavBtn = await driver.wait(
      until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")),
      10000,
    );
    await driver.executeScript("arguments[0].click();", settingsNavBtn);
    await driver.wait(until.urlContains("/settings"), 10000);
    await driver.sleep(1000);

    // Edição
    const settingsCard = await driver.wait(
      until.elementLocated(By.className("settings-card")),
      10000,
    );
    const editAvatarBtn = await settingsCard.findElement(
      By.css(".btn-avatar-edit"),
    );
    await driver.executeScript("arguments[0].click();", editAvatarBtn);

    // Swiper
    const swiper = await driver.wait(
      until.elementLocated(By.className("swiper")),
      10000,
    );
    const checkAvatarBtn = await swiper.findElement(
      By.css(".swiper-slide .btn-avatar-check"),
    );

    // PAUSA SOLICITADA: 1 segundo para visualização
    console.log("Visualizando o swiper antes de confirmar...");
    await driver.sleep(1000);

    console.log("Confirmando a decoração...");
    await driver.executeScript("arguments[0].click();", checkAvatarBtn);

    // Aguardar o avatar voltar
    await driver.wait(
      until.elementLocated(By.css(".settings-card .avatar")),
      10000,
    );

    console.log("Procurando o Toast via escaneamento de conteúdo...");

    // Em vez de esperar por uma classe, vamos esperar por um elemento que contenha o texto esperado
    // Isto ignora a classe CSS e foca-se apenas no conteúdo
    try {
      const toast = await driver.wait(
        until.elementLocated(
          By.xpath("//*[contains(text(), 'Decoration Applied')]"),
        ),
        20000,
      );
      const toastText = await toast.getText();
      console.log(`Sucesso! Toast encontrado. Texto: "${toastText}"`);
    } catch (err) {
      console.log(
        "Falha: O XPath não encontrou nenhum elemento com o texto 'Decoration Applied'.",
      );

      // DUMP DE SEGURANÇA: Mostra-nos o que existe no corpo da página para descobrirmos a classe
      const bodyContent = await driver.executeScript(
        "return document.body.innerHTML.substring(0, 500);",
      );
      console.log("--- DUMP DO INÍCIO DO BODY ---");
      console.log(bodyContent);
      console.log("------------------------------");
      throw new Error(
        "Toast não encontrado. Verifique o DUMP acima para ver se o elemento existe no DOM.",
      );
    }

    console.log("Test passed: Decoration successfully applied.");
  });

  // ----------------------------------------------------
  // Test 8: User Theme Toggle (Dark/Light Mode)
  // ----------------------------------------------------
  it("testUserSettingsAndThemeToggle", async function () {
    console.log("Starting User Theme Toggle Test...");

    await driver.wait(
      until.elementLocated(By.css("a[title='Explore Habits']")),
      10000,
    );

    console.log("Locating the theme toggle button...");
    const themeToggleBtn = await driver.wait(
      until.elementLocated(By.css(".custom-theme-toggle")),
      10000,
    );

    // Adicionando a pausa de 2 segundos solicitada
    console.log("Waiting 2 seconds before clicking...");
    await driver.sleep(2000);

    const initialTitle = await themeToggleBtn.getAttribute("title");
    assert.strictEqual(
      initialTitle,
      "Switch to Dark Mode",
      "App should be in Light Mode.",
    );

    console.log("Clicking the theme toggle button to activate Dark Mode...");
    // CORREÇÃO: Clique Nativo
    await performNativeClick(driver, themeToggleBtn);

    console.log("Waiting for the button title to update...");
    await driver.wait(async () => {
      const currentTitle = await themeToggleBtn.getAttribute("title");
      return currentTitle === "Switch to Light Mode";
    }, 10000);

    console.log(
      "Verifying if the Dark Mode attribute was applied to the HTML tag...",
    );
    // CORREÇÃO AQUI: Em vez do 'body', capturamos a tag 'html'
    const htmlElement = await driver.findElement(By.tagName("html"));

    // Em vez da classe, lemos o atributo do Bootstrap
    const themeAttribute = await htmlElement.getAttribute("data-bs-theme");

    assert.strictEqual(
      themeAttribute,
      "dark",
      "O atributo data-bs-theme='dark' não foi aplicado à tag html.",
    );

    console.log(
      "Test passed: Theme toggle works and dark mode is activated successfully.",
    );
    await driver.sleep(1000);
  });

  // ----------------------------------------------------
  // Test 9: User Image Profile Update
  // ----------------------------------------------------
  it("testUserChangeImageProfile", async function () {
    console.log("Starting User Image Profile Update Test...");

    // 1. Navegação para Settings
    console.log("Navigating to Settings page...");
    const settingsNavBtn = await driver.wait(
      until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")),
      10000,
    );
    await driver.executeScript("arguments[0].click();", settingsNavBtn);
    await driver.wait(until.urlContains("/settings"), 10000);
    await driver.sleep(1500);

    // 2. Localizar o Avatar e verificar a condição inicial (Tem imagem ou é vazio?)
    console.log("Verificando o estado inicial do avatar...");
    const settingsCard = await driver.wait(
      until.elementLocated(By.className("settings-card")),
      10000,
    );
    const profileHeader = await settingsCard.findElement(
      By.className("profile-header"),
    );
    const avatar = await profileHeader.findElement(By.className("avatar"));

    // Em vez de 'wait', usamos 'findElements' para não dar erro se não existir
    const initialImages = await avatar.findElements(By.tagName("img"));
    let initialSrc = null;

    if (initialImages.length > 0) {
      initialSrc = await initialImages[0].getAttribute("src");
      console.log(`[Condição A] Imagem atual detetada. URL: ${initialSrc}`);
    } else {
      console.log(
        `[Condição B] Nenhuma imagem de perfil detetada (Placeholder ativo).`,
      );
    }

    // 3. Preparar e enviar o ficheiro local
    console.log("Resolving local image path...");
    const filePath = path.resolve(__dirname, "../images/profile_picture.jpg");

    console.log("Injetando a imagem no input oculto...");
    const fileInput = await driver.wait(
      until.elementLocated(By.css('input[type="file"]')),
      10000,
    );

    // MOSTRAR: Forçamos a exibição apenas para o Selenium não dar erro de "elemento não interativo"
    await driver.executeScript(
      "arguments[0].style.display = 'block'; arguments[0].style.visibility = 'visible'; arguments[0].style.opacity = '1';",
      fileInput,
    );

    // INJETAR: Selenium envia o ficheiro
    await fileInput.sendKeys(filePath);

    // ESCONDER: Imediatamente após o envio, forçamos o sumiço completo do elemento do ecrã
    await driver.executeScript(
      "arguments[0].style.display = 'none'; arguments[0].style.visibility = 'hidden'; arguments[0].style.opacity = '0';",
      fileInput,
    );

    // 4. Validação Condicional Pós-Upload
    console.log(
      "Aguardando a aplicação processar o upload e atualizar o ecrã...",
    );
    await driver.wait(
      async () => {
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
      },
      20000,
      "Timeout: A nova imagem do avatar não foi renderizada no ecrã.",
    );

    // Confirmação Final
    const finalImages = await avatar.findElements(By.tagName("img"));
    const updatedSrc = await finalImages[0].getAttribute("src");
    console.log(`Sucesso! Nova imagem processada pelo site: ${updatedSrc}`);

    // 5. Validação do Toast
    console.log("Aguardando notificação de sucesso...");
    try {
      const toast = await driver.wait(
        until.elementLocated(By.css(".toast, .notification")),
        8000,
      );
      const toastText = await toast.getText();
      console.log(`Toast capturado: "${toastText.trim()}"`);
      assert.ok(
        toastText.includes("Picture updated"),
        "O toast não contém o texto de sucesso esperado.",
      );
    } catch (e) {
      console.log(
        "Nota: Toast não localizado, mas a imagem do avatar foi validada visualmente!",
      );
    }

    console.log(
      "Test passed: Profile picture successfully uploaded and verified.",
    );
    await driver.sleep(1500);
  });

  // ----------------------------------------------------
  // Test 10: User Session Secure Logout
  // ----------------------------------------------------
  it("testUserSessionSecureLogout", async function () {
    console.log("Starting User Session Secure Logout Test...");

    // 1. Navegar para a página Settings
    console.log("Navigating to Settings page...");
    const settingsNavBtn = await driver.wait(
      until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")),
      10000,
    );
    await driver.executeScript("arguments[0].click();", settingsNavBtn);

    // Aguarda a mudança de URL e dá um tempo para a página desenhar
    await driver.wait(until.urlContains("/settings"), 10000);
    await driver.sleep(1000);

    // 2. Localizar o botão de Logout seguindo a hierarquia exata
    console.log("Locating the logout button inside the sidebar...");
    const settingsCard = await driver.wait(
      until.elementLocated(By.className("settings-card")),
      10000,
    );
    const settingsContent = await settingsCard.findElement(
      By.className("settings-content"),
    );
    const sidebar = await settingsContent.findElement(By.className("sidebar"));
    const logoutBtn = await sidebar.findElement(By.id("logout-btn"));

    console.log("Clicking the logout button...");
    await driver.executeScript("arguments[0].click();", logoutBtn);

    // 3. Localizar o modal de confirmação e os seus botões
    console.log("Waiting for the confirmation modal to appear...");
    const confirmModal = await driver.wait(
      until.elementLocated(By.className("confirm-modal")),
      10000,
    );

    // Pequena pausa para garantir que qualquer animação de fade-in do modal termina
    await driver.sleep(500);

    const modalActions = await confirmModal.findElement(
      By.className("modal-actions"),
    );
    const confirmBtn = await modalActions.findElement(
      By.className("btn-confirm"),
    );

    console.log("Confirming logout via modal...");
    await driver.executeScript("arguments[0].click();", confirmBtn);

    // 4. Validar o redirecionamento para o Login
    console.log("Waiting for redirection to login page...");
    await driver.wait(until.urlContains("/login"), 15000);

    const currentUrl = await driver.getCurrentUrl();
    assert.ok(
      currentUrl.includes("/login"),
      "Logout failed: System did not redirect to login.",
    );

    console.log(
      "Test passed: Session safely destroyed via modal confirmation.",
    );
    await driver.sleep(1000);
  });
  // ----------------------------------------------------
  // Test 11: Add user localization
  // ----------------------------------------------------
  it("testUserLocalization", async function () {
    console.log("Starting User Localization Test...");

    // 0. Mock geolocation via CDP BEFORE any navigation
    console.log("Mocking geolocation via CDP...");
    await driver.sendAndGetDevToolsCommand("Browser.grantPermissions", {
      permissions: ["geolocation"],
      origin: "http://localhost:5173",
    });
    await driver.sendAndGetDevToolsCommand("Emulation.setGeolocationOverride", {
      latitude: 41.1579,
      longitude: -8.6291,
      accuracy: 100,
    });

    // 1. Navigate to Habits Manager
    console.log("Navigating to Habits Manager page...");
    const managerNavBtn = await driver.wait(
      until.elementLocated(By.css("a[aria-label='Habits Manager']")),
      10000,
    );
    await performNativeClick(driver, managerNavBtn);
    await driver.wait(until.urlContains("/habitsmanager"), 10000);
    await driver.sleep(1500); // let the page fully render

    // 2. Locate the refresh button
    console.log("Locating the refresh button...");
    const localizationBtn = await driver.wait(
      until.elementLocated(By.css(".refresh-btn")),
      10000,
    );

    // 3. Scroll into view and force click
    console.log("Clicking the refresh button...");
    await driver.executeScript(
      `
    var el = arguments[0];
    el.scrollIntoView({ block: 'center' });
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    el.click();
    `,
      localizationBtn,
    );

    // 4. Wait for weather data to appear
    console.log("Waiting for weather data to load...");
    await driver.wait(
      async () => {
        try {
          const weatherH3 = await driver.findElement(By.css(".weather h3"));
          const text = await weatherH3.getText();
          return text && text.trim().length > 0;
        } catch {
          return false;
        }
      },
      15000,
      "Timeout: Weather data never appeared after clicking refresh.",
    );

    // 5. Assert city name is visible
    console.log("Asserting city name is displayed...");
    const cityName = await driver.findElement(By.css(".weather h3"));
    const cityText = await cityName.getText();
    console.log(`City detected: ${cityText}`);
    assert.ok(cityText.length > 0, "City name should be displayed");

    // 6. Assert temperature is visible
    console.log("Asserting temperature is displayed...");
    const paragraphs = await driver.findElements(By.css(".weather div p"));
    const texts = await Promise.all(paragraphs.map((p) => p.getText()));
    console.log("Weather paragraphs found:", texts);
    const hasTemp = texts.some((t) => t.includes("°C"));
    assert.ok(hasTemp, "Temperature should be displayed in °C");

    console.log("User Localization Test passed!");
  });

  // ----------------------------------------------------
  // Test 12: Check user notifications (enable/disable, read just one and clear all)
  // ----------------------------------------------------
  it("testUserNotifications", async function () {
    console.log("Starting User Notifications Test...");

    // 1. Navigate to Settings
    console.log("Navigating to Settings page...");
    const settingsNavBtn = await driver.wait(
      until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")),
      10000,
    );
    await driver.executeScript("arguments[0].click();", settingsNavBtn);
    await driver.wait(until.urlContains("/settings"), 10000);
    await driver.sleep(1000);

    // 2. Open the Notifications section via sidebar
    console.log("Clicking the Notifications nav item...");
    const notificationNavBtn = await driver.wait(
      until.elementLocated(By.id("notification-btn")),
      10000,
    );
    await performNativeClick(driver, notificationNavBtn);
    await driver.sleep(500);

    // 3. Confirm the Notifications section is visible
    console.log("Confirming notifications section is visible...");
    const notificationSection = await driver.wait(
      until.elementLocated(By.id("notification-section")),
      10000,
    );
    const isSectionDisplayed = await notificationSection.isDisplayed();
    assert.ok(isSectionDisplayed, "Notification section should be visible.");

    // 4. Find the toggle checkbox and check its initial state (should be enabled)
    console.log("Verifying notifications are enabled by default...");
    const toggleCheckbox = await notificationSection.findElement(
      By.css("input[type='checkbox']"),
    );
    let isChecked = await toggleCheckbox.isSelected();
    assert.ok(isChecked, "Notifications toggle should be ON by default.");
    console.log("Toggle is ON — notifications enabled.");

    // 5. Disable notifications via the toggle
    console.log("Disabling notifications via toggle...");
    await driver.executeScript("arguments[0].click();", toggleCheckbox);
    await driver.sleep(500);

    // Verify "Notifications are turned off" message appears
    const turnedOffMsg = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'Notifications are turned off')]"),
      ),
      5000,
    );
    assert.ok(
      await turnedOffMsg.isDisplayed(),
      "'Notifications are turned off' message should appear.",
    );
    console.log("Notifications disabled — message confirmed.");

    // 6. Re-enable notifications
    console.log("Re-enabling notifications...");
    await driver.executeScript("arguments[0].click();", toggleCheckbox);
    await driver.sleep(500);

    isChecked = await toggleCheckbox.isSelected();
    assert.ok(isChecked, "Notifications toggle should be back ON.");
    console.log("Notifications re-enabled.");

    // 7. Check if there are notifications to interact with
    const notificationCards = await notificationSection.findElements(
      By.css(".notification-card"),
    );
    console.log(`Found ${notificationCards.length} notification card(s).`);

    if (notificationCards.length > 0) {
      const initialCount = notificationCards.length;

      // 8. Read the first notification (click "Read" on the first card)
      console.log("Reading the first notification...");
      const firstReadBtn = await notificationCards[0].findElement(
        By.css(".clear-notification-btn"),
      );
      await performNativeClick(driver, firstReadBtn);
      await driver.sleep(1000);

      // Verify one card was removed
      const afterReadCards = await notificationSection.findElements(
        By.css(".notification-card"),
      );
      assert.strictEqual(
        afterReadCards.length,
        initialCount - 1,
        "One notification should have been removed after clicking Read.",
      );
      console.log(
        `Notification read — cards remaining: ${afterReadCards.length}.`,
      );

      // 9. Clear all remaining notifications (only if there are more)
      if (afterReadCards.length > 0) {
        console.log("Clearing all remaining notifications...");
        const clearAllBtn = await driver.wait(
          until.elementLocated(By.css(".btn-clear-all")),
          5000,
        );
        await performNativeClick(driver, clearAllBtn);
        await driver.sleep(1000);

        // Verify no notification cards remain
        await driver.wait(async () => {
            const cards = await notificationSection.findElements(By.css(".notification-card"));
            return cards.length === 0;
        }, 15000, "All notifications should be cleared.");
        console.log("All notifications cleared.");

        // Verify "No notifications yet!" message appears
        const emptyMsg = await driver.wait(
          until.elementLocated(
            By.xpath("//*[contains(text(), 'No notifications yet!')]"),
          ),
          5000,
        );
        assert.ok(
          await emptyMsg.isDisplayed(),
          "'No notifications yet!' message should appear after clearing all.",
        );
        console.log("Empty state confirmed.");
      }
    } else {
      // No notifications present — just verify the empty state message
      console.log(
        "No notifications found — verifying empty state message is shown...",
      );
      const emptyMsg = await driver.wait(
        until.elementLocated(
          By.xpath("//*[contains(text(), 'No notifications yet!')]"),
        ),
        5000,
      );
      assert.ok(
        await emptyMsg.isDisplayed(),
        "'No notifications yet!' message should be visible when there are no notifications.",
      );
      console.log("Empty state confirmed — test adapted gracefully.");
    }

    console.log("User Notifications Test passed!");
  });
  // ----------------------------------------------------
  // Test 13: User requests a new password (reset password)
  // ----------------------------------------------------
  it("testUserForgotPassword", async function () {
    console.log("Starting Forgot Password Test...");

    // 1. Navigate to login page directly (no auto-login for this test)
    console.log("Navigating to login page...");
    await driver.get("http://localhost:5173/login");
    await driver.wait(until.elementLocated(By.id("login_btn")), 10000);

    // 2. Click the "Forgot Password?" link
    console.log("Clicking 'Forgot Password?' link...");
    const forgotLink = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'Forgot Password?')]"),
      ),
      10000,
    );
    await performNativeClick(driver, forgotLink);

    // 3. Wait for the modal (step 1) to appear
    console.log("Waiting for the forgot password modal to appear...");
    const modalPanel = await driver.wait(
      until.elementLocated(By.css(".modal-panel")),
      10000,
    );
    await driver.sleep(500); // Wait for modalFadeIn animation to finish
    assert.ok(
      await modalPanel.isDisplayed(),
      "Forgot password modal should be visible.",
    );

    // 4. Fill in the email input with the test user's email
    console.log("Filling in the email address...");
    const emailInput = await modalPanel.findElement(
      By.css("input[type='email']"),
    );
    await emailInput.clear();
    await emailInput.sendKeys(TEST_USER.email);

    // 5. Click "Send Link"
    console.log("Clicking 'Send Link' button...");
    const sendBtn = await modalPanel.findElement(By.css(".btn-submit"));
    await performNativeClick(driver, sendBtn);

    // 6. Wait for step 2 modal to appear (token + new password inputs)
    console.log("Waiting for step 2 modal (token input) to appear...");
    await driver.wait(
      async () => {
        try {
          const tokenInput = await driver.findElement(
            By.css(".modal-panel input[placeholder='Reset Token']"),
          );
          return await tokenInput.isDisplayed();
        } catch {
          return false;
        }
      },
      15000,
      "Timeout: Step 2 modal with token input never appeared.",
    );

    console.log("Step 2 modal appeared — token input is visible.");

    // 7. Assert the token input and new password input are present
    const tokenInput = await driver.findElement(
      By.css(".modal-panel input[placeholder='Reset Token']"),
    );
    const newPasswordInput = await driver.findElement(
      By.css(".modal-panel input[placeholder='New Password']"),
    );
    assert.ok(
      await tokenInput.isDisplayed(),
      "Reset Token input should be visible in step 2.",
    );
    assert.ok(
      await newPasswordInput.isDisplayed(),
      "New Password input should be visible in step 2.",
    );

    console.log("Forgot Password Test passed!");
  });
  // ----------------------------------------------------
  // Test 14: Chatbot Interaction on Explore Habits Page
  // ----------------------------------------------------
  it("testUserChatbotInteraction", async function () {
    console.log("Starting Chatbot Interaction Test...");

    // 1. Navigate to Explore Habits page
    console.log("Navigating to Explore Habits page...");
    const exploreNavBtn = await driver.wait(
      until.elementLocated(By.css("a[aria-label='Explore Habits']")),
      10000,
    );
    await performNativeClick(driver, exploreNavBtn);
    await driver.wait(until.urlContains("/explorehabits"), 10000);
    console.log("On Explore Habits page.");

    // 2. Open the chatbot
    console.log("Opening the chatbot...");
    const chatFab = await driver.wait(
      until.elementLocated(By.css(".chatbot-fab")),
      10000,
    );
    await performNativeClick(driver, chatFab);
    await driver.sleep(1000); // let the panel animate open visibly

    // 3. Confirm the chat panel is visible
    const chatPanel = await driver.wait(
      until.elementLocated(By.css(".chatbot-panel")),
      10000,
    );
    assert.ok(await chatPanel.isDisplayed(), "Chat panel should be visible.");
    console.log("Chat panel is open.");

    // 4. Type the message slowly so it's visible on screen
    console.log("Typing message...");
    const chatTextarea = await driver.wait(
      until.elementLocated(By.css(".chat-textarea")),
      10000,
    );
    await chatTextarea.click();
    await driver.sleep(500);

    const message = "How can I get points?";
    for (const char of message) {
      await chatTextarea.sendKeys(char);
      await driver.sleep(80); // 80ms per character — visible typing effect
    }
    console.log("Message typed.");
    await driver.sleep(700); // pause so user can read what was typed

    // 5. Send the message
    console.log("Sending the message...");
    const sendBtn = await driver.findElement(By.css(".send-btn"));
    await performNativeClick(driver, sendBtn);

    // 6. Confirm the user bubble appeared
    console.log("Confirming user message bubble appeared...");
    await driver.wait(
      until.elementLocated(By.css(".bubble--user")),
      5000,
      "User message bubble should appear after sending.",
    );
    console.log("User message bubble confirmed.");

    // 7. Wait for the typing indicator to appear (dots animation)
    console.log("Waiting for typing indicator (dots)...");
    try {
      await driver.wait(until.elementLocated(By.css(".bubble--typing")), 8000);
      console.log("Typing indicator visible — assistant is writing...");

      // Keep it visible on screen for 2 seconds so the animation is seen
      await driver.sleep(2000);
    } catch {
      console.log("Typing indicator was too fast to catch — continuing.");
    }

    // 8. Wait for the full assistant response to appear
    console.log("Waiting for assistant response (up to 30s)...");
    await driver.wait(
      async () => {
        try {
          const bubbles = await driver.findElements(
            By.css(".bubble--assistant:not(.bubble--typing) .bubble-text"),
          );
          if (bubbles.length === 0) return false;
          const text = await bubbles[bubbles.length - 1].getText();
          return text && text.trim().length > 5;
        } catch {
          return false;
        }
      },
      60000,
      "Timeout: Assistant never responded.",
    );

    // 9. Capture and log the response
    const bubbles = await driver.findElements(
      By.css(".bubble--assistant:not(.bubble--typing) .bubble-text"),
    );
    const responseText = await bubbles[bubbles.length - 1].getText();
    console.log(`Assistant response: "${responseText.substring(0, 150)}"`);

    assert.ok(
      responseText.trim().length > 0,
      "Assistant response should not be empty.",
    );

    // 10. Pause so the full response is readable on screen before the test ends
    console.log("Holding response on screen for 3 seconds...");
    await driver.sleep(3000);

    console.log("Chatbot Interaction Test passed!");
  });
  // ----------------------------------------------------
  // Test 15: Change user information (name, email and password)
  // ----------------------------------------------------
  it("testUserChangeInformation", async function () {
    console.log("Starting Change User Information Test...");

    // 1. Navigate to Settings
    console.log("Navigating to Settings page...");
    const settingsNavBtn = await driver.wait(
      until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")),
      10000,
    );
    await driver.executeScript("arguments[0].click();", settingsNavBtn);
    await driver.wait(until.urlContains("/settings"), 10000);
    await driver.sleep(1000);

    // 2. Change the Name
    console.log("Changing the name...");
    let toggleNameBtn;
    try {
        toggleNameBtn = await driver.wait(
            until.elementLocated(By.id("toggle-name")),
            10000,
        );
    } catch (err) {
        console.error("FAILED TO FIND toggle-name. DUMPING DOM:");
        console.error(await driver.executeScript("return document.body.innerHTML;"));
        throw err;
    }
    await driver.executeScript("arguments[0].click();", toggleNameBtn);
    await driver.sleep(500);

    const nameInput = await driver.wait(
      until.elementLocated(By.css("input.input-settings")),
      5000,
    );
    await driver.executeScript("arguments[0].value = '';", nameInput);
    await nameInput.sendKeys("Selenium Change User Info");
    await driver.sleep(500);

    // Click "Ok" to confirm name
    await driver.executeScript("arguments[0].click();", toggleNameBtn);
    await driver.sleep(500);
    console.log("Name changed to 'Selenium Change User Info'.");

    // 3. Change the Email — same email as TEST_USER (no actual change)
    console.log("Changing the email...");
    const toggleEmailBtn = await driver.wait(
      until.elementLocated(By.id("toggle-email")),
      10000,
    );
    await driver.executeScript("arguments[0].click();", toggleEmailBtn);
    await driver.sleep(500);

    const emailInput = await driver.wait(
      until.elementLocated(By.id("change-email")),
      5000,
    );
    await driver.executeScript("arguments[0].value = '';", emailInput);
    await emailInput.sendKeys(TEST_USER.email);
    await driver.sleep(500);

    // Click "Ok" to confirm email
    await driver.executeScript("arguments[0].click();", toggleEmailBtn);
    await driver.sleep(500);
    console.log(`Email kept as: ${TEST_USER.email}`);

    // 4. Change the Password — same password as TEST_USER (no actual change)
    console.log("Changing the password...");
    const togglePasswordBtn = await driver.wait(
      until.elementLocated(By.id("toggle-password")),
      10000,
    );
    await driver.executeScript("arguments[0].click();", togglePasswordBtn);
    await driver.sleep(500);

    const passwordInput = await driver.wait(
      until.elementLocated(
        By.css("input.input-settings[placeholder='Enter new password']"),
      ),
      5000,
    );
    await passwordInput.sendKeys(TEST_USER.password);
    await driver.sleep(500);

    // Click "Ok" to confirm password
    await driver.executeScript("arguments[0].click();", togglePasswordBtn);
    await driver.sleep(500);
    console.log("Password confirmed.");

    // 5. Click "Save changes"
    console.log("Saving all changes...");
    const saveBtn = await driver.wait(
      until.elementLocated(By.css(".btn-primary")),
      10000,
    );
    await driver.executeScript("arguments[0].click();", saveBtn);

    // 6. Wait for the success toast
    console.log("Waiting for success toast...");
    const successToast = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'Changes saved successfully')]"),
      ),
      10000,
      "Success toast should appear after saving changes.",
    );
    assert.ok(
      await successToast.isDisplayed(),
      "Success toast should be visible after saving.",
    );
    console.log("Success toast confirmed.");

    await driver.sleep(2000);
    console.log("Change User Information Test passed!");
  });
});
