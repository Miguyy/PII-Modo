const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const path = require('path'); 
const fs = require('fs');

// Import the Page Objects
const { LoginPage } = require('../pages/AuthPages');

// 1. CARREGAR CREDENCIAIS
let ADMIN_USER;
const credsPath = path.resolve(__dirname, '../admin.credentials.json');
try {
    const rawData = fs.readFileSync(credsPath);
    ADMIN_USER = JSON.parse(rawData);
} catch (error) {
    throw new Error("Ficheiro admin.credentials.json não encontrado!");
}

async function performNativeClick(driver, element) {
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
    await driver.executeScript(`
        var el = arguments[0];
        el.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true, isPrimary: true}));
        el.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, cancelable: true, isPrimary: true}));
        el.click();
    `, element);
}

// O DESCRIBE DEVE ESTAR AQUI NO NÍVEL SUPERIOR
describe('Admin Journey Tests - Privileged Operations', function () {
    let driver;
    let loginPage;

    this.timeout(40000);

    beforeEach(async function () {
        const options = new chrome.Options();
        options.excludeSwitches("enable-logging");
        options.addArguments("--log-level=3", "--disable-logging", "--silent");

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
            
        await driver.manage().window().maximize();
        loginPage = new LoginPage(driver);

        const currentTestName = this.currentTest.title;
        if (currentTestName !== 'testAdminAuthentication') {
            await driver.get('http://localhost:5173/login');
            await loginPage.performLogin(ADMIN_USER.email, ADMIN_USER.password);
            await driver.wait(until.urlContains('/adminpanel'), 15000);
        }
    });

    afterEach(async function () {
        if (driver) await driver.quit();
    });

    // ----------------------------------------------------
    // Test 1: Admin Authentication Success
    // ----------------------------------------------------
    it('testAdminAuthentication', async function () {
        console.log("Starting Admin Authentication Success Test...");
        console.log("Opening the login page...");
        await driver.get('http://localhost:5173/login');

        console.log("Filling secure admin credentials and clicking the login button...");
        await loginPage.performLogin(ADMIN_USER.email, ADMIN_USER.password);

        console.log("Waiting for the router redirection to /adminpanel...");
        await driver.wait(until.urlContains('/adminpanel'), 15000);
        
        const currentUrl = await driver.getCurrentUrl();
        console.log("Current URL after authentication:", currentUrl);

        assert.ok(
            currentUrl.includes('/adminpanel'), 
            "Redirection to Admin Dashboard failed after login."
        );

        console.log("Test passed: Admin authentication and dashboard redirection work correctly.");
    });

    // ----------------------------------------------------
    // Test 2: Admin User Management (Delete User)
    // ----------------------------------------------------
    it('testAdminUserManagement', async function () {
        console.log("Starting Admin User Management Test...");

        console.log("Locating users table and search input...");
        const usersTable = await driver.wait(until.elementLocated(By.id("users-table")), 10000);
        const searchInput = await usersTable.findElement(By.css(".search-group .search-input"));

        console.log("Searching for 'Selenium User Test'...");
        await searchInput.clear();
        await searchInput.sendKeys("Selenium User Test");
        await driver.sleep(1500); // Aguardar o filtro da tabela processar

        console.log("Locating the delete button for the user...");
        const adminTable = await usersTable.findElement(By.className("admin-table"));
        const tbody = await adminTable.findElement(By.tagName("tbody"));
        
        const deleteBtn = await tbody.findElement(By.css(".action-icon.action-delete"));
        await performNativeClick(driver, deleteBtn);

        console.log("Handling confirmation modal...");
        await driver.sleep(500); // Wait for modal to appear
        const confirmModal = await driver.wait(
            until.elementLocated(By.css(".custom-modal-backdrop .modal-panel")),
            10000
        );
        const confirmBtn = await confirmModal.findElement(By.css(".btn.btn-danger"));
        await driver.executeScript("arguments[0].click();", confirmBtn);

        console.log("Waiting for success toast message...");
        const toast = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'User deleted')]")), 
            15000
        );

        await driver.sleep(2000);
        
        // DEBUG: Obter o texto bruto para ver o que realmente está lá
        const rawToastText = await toast.getText();
        const cleanToast = rawToastText.replace(/\s+/g, " ").trim(); // Substitui qualquer espaço/quebra por 1 espaço
        
        console.log("--- DEBUG DO TEXTO DO TOAST ---");
        console.log("Texto Bruto:", rawToastText);
        console.log("Texto Limpo:", cleanToast);
        console.log("--------------------------------");

        // Validação relaxada: vamos imprimir o erro se falhar, mas com os valores reais
        assert.ok(
            cleanToast.length > 0, 
            "Toast encontrado, mas texto vazio."
        );
        
        // Se este assert falhar, o log acima dir-nos-á exatamente o que escrever no assert abaixo
        assert.ok(
            cleanToast.includes("User deleted"),
            `Esperava que contivesse 'User deleted', mas recebi: '${cleanToast}'`
        );
    });

    // ----------------------------------------------------
    // Test 3: Admin Notifications (Broadcast)
    // ----------------------------------------------------
    it('testAdminNotifications', async function () {
        console.log("Starting Admin Notifications Test...");

        // 1. Scroll e Espera ANTES de interagir
        console.log("Scrolling to admin notifications section...");
        const notifSection = await driver.wait(until.elementLocated(By.id("admin-notifications")), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", notifSection);
        
        console.log("Aguardando estabilização da secção após scroll...");
        await driver.sleep(1500); 

        // 2. Localizar elementos
        const cardBody = await notifSection.findElement(By.className("card-body"));
        const inputField = await cardBody.findElement(By.css(".form-control.border-success-subtle"));
        
        // 3. Escrever a mensagem
        console.log("Typing notification message...");
        await inputField.sendKeys("Notification from selenium test");

        // 4. Pausa de 2 segundos antes do envio
        console.log("Aguardando 2 segundos antes de enviar...");
        await driver.sleep(2000);

        const sendBtn = await cardBody.findElement(By.css(".btn.text-white.px-4.shadow-sm"));
        console.log("Clicking the send broadcast button...");
        await performNativeClick(driver, sendBtn);

        // PAUSA SOLICITADA: 1 segundo para garantir que o toast processa o texto
        await driver.sleep(1000);

        console.log("Waiting for success toast message...");
        // Aumentamos a robustez: esperaremos até que um elemento com o texto exista E não esteja vazio
        const toast = await driver.wait(async () => {
            const elements = await driver.findElements(By.xpath("//*[contains(text(), 'Sent')]"));
            for (let el of elements) {
                const txt = await el.getText();
                if (txt.trim().length > 0) return el; // Só retorna se tiver texto real
            }
            return null;
        }, 15000);
        
        const rawToastText = await toast.getText();
        const cleanToast = rawToastText.replace(/\s+/g, " ").trim();
        
        console.log("--- DEBUG TOAST ---");
        console.log("Texto real capturado:", cleanToast);
        console.log("-------------------");

        assert.ok(
            cleanToast.length > 0, 
            "O toast foi encontrado, mas o texto ainda estava vazio."
        );

        assert.ok(
            cleanToast.toLowerCase().includes("sent"),
            `Esperava uma confirmação de envio (contendo 'sent'), mas recebi: '${cleanToast}'`
        );

        console.log("Test passed: Broadcast notification sent successfully.");
    });

    // ----------------------------------------------------
    // Test 4: Admin Decorations Management (Add & Delete)
    // ----------------------------------------------------
    it('testAdminDecorationsManagement', async function () {
        console.log("Starting Admin Decorations Management Test...");

        // 1. ADD DECORATION
        console.log("Scrolling to decorations table...");
        const decTableSection = await driver.wait(until.elementLocated(By.id("decorations-table")), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", decTableSection);

        console.log("Clicking 'Add Decoration' button...");
        const addDecBtn = await decTableSection.findElement(By.css(".btn-add-decoration"));
        await performNativeClick(driver, addDecBtn);

        console.log("Waiting for modal to open...");
        const modal = await driver.wait(until.elementLocated(By.css(".custom-modal-backdrop .modal-panel")), 10000);
        await driver.sleep(500);

        console.log("Filling decoration details...");
        const nameInput = await modal.findElement(By.id("edit-decoration-name"));
        await nameInput.sendKeys("Selenium");

        const levelInput = await modal.findElement(By.id("edit-decoration-required-level"));
        await levelInput.clear();
        await levelInput.sendKeys("20");

        console.log("Injecting decoration image file...");
        const filePath = path.resolve(__dirname, '../images/Selenium decoration.png');
        
        const fileInput = await modal.findElement(By.css('input[type="file"]'));
        await driver.executeScript(
            "arguments[0].style.display = 'block'; arguments[0].style.visibility = 'visible';", 
            fileInput
        );
        await fileInput.sendKeys(filePath);
        await driver.executeScript("arguments[0].style.display = 'none';", fileInput);

        console.log("Saving new decoration...");
        const saveBtn = await modal.findElement(By.css(".btn.btn-success"));
        await performNativeClick(driver, saveBtn);

        console.log("Waiting for Add Toast message (buscando por texto XPath)...");
        // CORREÇÃO: Usar o texto para ignorar problemas de classes
        const addToast = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Decoration added')]")), 
            15000
        );
        const addToastText = await addToast.getText();
        assert.ok(addToastText.includes("Decoration added"), "Failed to add decoration.");
        
        console.log("Decoration created. Waiting 2 seconds as requested...");
        await driver.sleep(2000);

        // 2. DELETE DECORATION
        console.log("Searching for the newly created 'Selenium' decoration...");
        const searchInput = await decTableSection.findElement(By.css(".search-input"));
        await searchInput.clear();
        await searchInput.sendKeys("Selenium");
        await driver.sleep(1500); // Aguarda o filtro

        console.log("Locating the target decoration in the table to delete...");
        const deleteXPath = "//tbody//tr[td[contains(@class, 'fw-medium') and contains(text(), 'Selenium')]]//button[contains(@class, 'action-delete')]";
        const decDeleteBtn = await driver.wait(until.elementLocated(By.xpath(deleteXPath)), 10000);
        await performNativeClick(driver, decDeleteBtn);

        console.log("Handling confirmation modal...");
        await driver.sleep(500);
        const deleteModal = await driver.wait(
            until.elementLocated(By.css(".custom-modal-backdrop .modal-panel")),
            10000
        );
        const deleteConfirmBtn = await deleteModal.findElement(By.css(".btn.btn-danger"));
        await driver.executeScript("arguments[0].click();", deleteConfirmBtn);

        await driver.sleep(1000);

        console.log("Waiting for Delete Toast message (buscando por texto XPath)...");
        // CORREÇÃO: Buscar explicitamente pelo texto do Toast de deleção
        await driver.wait(async () => {
            const toasts = await driver.findElements(By.xpath("//*[contains(text(), 'Decoration deleted')]"));
            return toasts.length > 0;
        }, 15000, "The decoration delete toast message did not appear.");

        console.log("Test passed: Decoration successfully added and then deleted.");
    });

    // ----------------------------------------------------
    // Test 5: Admin Session Secure Logout
    // ----------------------------------------------------
    it('testAdminSessionSecureLogout', async function () {
        console.log("Starting Admin Session Secure Logout Test...");

        console.log("Navigating to Settings page...");
        const settingsNavBtn = await driver.wait(
            until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")), 
            10000
        );
        await driver.executeScript("arguments[0].click();", settingsNavBtn);
        
        await driver.wait(until.urlContains('/settings'), 10000);
        await driver.sleep(1000); 

        console.log("Locating the logout button inside the sidebar...");
        const settingsCard = await driver.wait(until.elementLocated(By.className("settings-card")), 10000);
        const settingsContent = await settingsCard.findElement(By.className("settings-content"));
        const sidebar = await settingsContent.findElement(By.className("sidebar"));
        const logoutBtn = await sidebar.findElement(By.id("logout-btn"));

        console.log("Clicking the logout button...");
        await driver.executeScript("arguments[0].click();", logoutBtn);

        console.log("Waiting for the confirmation modal to appear...");
        const confirmModal = await driver.wait(until.elementLocated(By.className("confirm-modal")), 10000);
        await driver.sleep(500); 

        const modalActions = await confirmModal.findElement(By.className("modal-actions"));
        const confirmBtn = await modalActions.findElement(By.className("btn-confirm"));

        console.log("Confirming logout via modal...");
        await driver.executeScript("arguments[0].click();", confirmBtn);

        console.log("Waiting for redirection to login page...");
        await driver.wait(until.urlContains('/login'), 15000);

        const currentUrl = await driver.getCurrentUrl();
        assert.ok(currentUrl.includes('/login'), "Logout failed: Admin system did not redirect to login.");

        console.log("Test passed: Admin session safely destroyed via modal confirmation.");
        await driver.sleep(1000); 
    });

});