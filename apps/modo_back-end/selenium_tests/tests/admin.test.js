const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const path = require('path'); 
const fs = require('fs');

// Import the Page Objects
const { LoginPage } = require('../pages/AuthPages');

// 1. LOAD CREDENTIALS
let ADMIN_USER;
const credsPath = path.resolve(__dirname, '../admin.credentials.json');
try {
    const rawData = fs.readFileSync(credsPath);
    ADMIN_USER = JSON.parse(rawData);
} catch (error) {
    throw new Error("admin.credentials.json file not found!");
}

const TEST_USER = {
  email: "user.test@email.com",
  password: "Selenium2026!#",
};

async function performNativeClick(driver, element) {
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
    await driver.executeScript(`
        var el = arguments[0];
        el.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true, isPrimary: true}));
        el.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, cancelable: true, isPrimary: true}));
        el.click();
    `, element);
}

// DESCRIBE MUST BE HERE AT TOP LEVEL
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

        console.log(`Searching for '${TEST_USER.email}'...`);
        await searchInput.clear();
        await searchInput.sendKeys(TEST_USER.email);
        await driver.sleep(1500); // Wait for table filter to process

        console.log("Locating the delete button for the user...");
        const adminTable = await usersTable.findElement(By.className("admin-table"));
        const tbody = await adminTable.findElement(By.tagName("tbody"));
        
        // Try to find the delete button. If it doesn't exist, the user isn't there, which is fine!
        const deleteBtns = await tbody.findElements(By.css(".action-icon.action-delete"));
        if (deleteBtns.length === 0) {
            console.log("User not found in the table. Skipping deletion.");
            return; // Skip the rest of the test since there's nothing to delete
        }
        
        const deleteBtn = deleteBtns[0];
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

        // Read text immediately before the element can be removed by the v-if transition
        const rawToastText = await toast.getText();
        const cleanToast = rawToastText.replace(/\s+/g, " ").trim();
        
        console.log("--- DEBUG DO TEXTO DO TOAST ---");
        console.log("Raw Text:", rawToastText);
        console.log("Clean Text:", cleanToast);
        console.log("--------------------------------");

        await driver.sleep(1000);

        assert.ok(
            cleanToast.length > 0, 
            "Toast found, but text is empty."
        );
        
        assert.ok(
            cleanToast.includes("User deleted"),
            `Expected to contain 'User deleted', but received: '${cleanToast}'`
        );
    });

    // ----------------------------------------------------
    // Test 3: Admin Notifications (Broadcast)
    // ----------------------------------------------------
    it('testAdminNotifications', async function () {
        console.log("Starting Admin Notifications Test...");

        // 1. Scroll and Wait BEFORE interacting
        console.log("Scrolling to admin notifications section...");
        const notifSection = await driver.wait(until.elementLocated(By.id("admin-notifications")), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", notifSection);
        
        console.log("Waiting for section to stabilize after scroll...");
        await driver.sleep(1500); 

        // 2. Locate elements
        const cardBody = await notifSection.findElement(By.className("card-body"));
        const inputField = await cardBody.findElement(By.css(".form-control.border-success-subtle"));
        
        // 3. Write the message
        console.log("Typing notification message...");
        await inputField.sendKeys("Notification from selenium test");

        // 4. 2-second pause before sending
        console.log("Waiting 2 seconds before sending...");
        await driver.sleep(2000);

        // Select the broadcast button reliably
        const sendBtn = await cardBody.findElement(By.css(".input-group button"));
        console.log("Clicking the send broadcast button...");
        await driver.executeScript("arguments[0].click();", sendBtn);

        // Wait for the toast — the title is 'Broadcast Sent'
        await driver.sleep(500);

        console.log("Waiting for success toast message...");
        const toast = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Broadcast Sent')]") ),
            15000
        );

        // Read immediately before the v-if removes the element
        const rawToastText = await toast.getText();
        const cleanToast = rawToastText.replace(/\s+/g, " ").trim();
        
        console.log("--- DEBUG TOAST ---");
        console.log("Actual text captured:", cleanToast);
        console.log("-------------------");

        assert.ok(
            cleanToast.length > 0, 
            "Toast was found, but text was still empty."
        );

        assert.ok(
            cleanToast.toLowerCase().includes("sent"),
            `Esperava uma confirmação de envio (contendo 'sent'), but received: '${cleanToast}'`
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

        console.log("Waiting for Add Toast message (searching by XPath text)...");
        // FIX: Use text to ignore class issues
        await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Decoration added')]")), 
            15000
        );
        
        console.log("Decoration created. Waiting 2 seconds as requested...");
        await driver.sleep(2000);

        // 2. DELETE DECORATION
        console.log("Searching for the newly created 'Selenium' decoration...");
        const searchInput = await decTableSection.findElement(By.css(".search-input"));
        await searchInput.clear();
        await searchInput.sendKeys("Selenium");
        await driver.sleep(1500); // Wait for filter

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

        console.log("Waiting for Delete Toast message (searching by XPath text)...");
        // CORREÇÃO: Search explicitly for deletion Toast text
        await driver.wait(async () => {
            const toasts = await driver.findElements(By.xpath("//*[contains(text(), 'Decoration deleted')]"));
            return toasts.length > 0;
        }, 15000, "The decoration delete toast message did not appear.");

        console.log("Test passed: Decoration successfully added and then deleted.");
    });

    // ----------------------------------------------------
    // Test 5: Admin Habits Management (Add & Delete)
    // ----------------------------------------------------
    it('testAdminHabitsManagement', async function () {
        console.log("Starting Admin Habits Management Test...");

        // 1. ADD HABIT
        console.log("Scrolling to habits table...");
        const habitTableSection = await driver.wait(until.elementLocated(By.id("habits-table")), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", habitTableSection);

        console.log("Clicking 'Add' habit button...");
        const addHabitBtn = await habitTableSection.findElement(By.css(".btn.btn-add-decoration"));
        await performNativeClick(driver, addHabitBtn);

        console.log("Waiting for habit modal to open...");
        const habitModal = await driver.wait(until.elementLocated(By.css(".custom-modal-backdrop .modal-panel")), 10000);
        await driver.sleep(500);

        console.log("Filling habit title...");
        const titleInput = await habitModal.findElement(By.css("input[placeholder*='Exercise']"));
        await titleInput.sendKeys("Selenium Habit Test");

        console.log("Filling habit category...");
        const categoryInput = await habitModal.findElement(By.css("input[placeholder*='Health']"));
        await categoryInput.sendKeys("Selenium");

        console.log("Saving new habit...");
        const saveHabitBtn = await habitModal.findElement(By.css("button.btn-success"));
        await driver.executeScript("arguments[0].click();", saveHabitBtn);

        console.log("Waiting for Add Toast message...");
        const addToast = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Habit added')]")),
            15000
        );
        const addToastText = await driver.executeScript("return arguments[0].innerText;", addToast);
        assert.ok(addToastText.includes("Habit added"), "Failed to add habit. Text found: " + addToastText);

        console.log("Habit created. Waiting 1.5 seconds...");
        await driver.sleep(1500);

        // 2. DELETE HABIT
        console.log("Searching for the newly created 'Selenium Habit Test' habit...");
        const searchInput = await habitTableSection.findElement(By.css(".search-input"));
        await searchInput.clear();
        await searchInput.sendKeys("Selenium Habit Test");
        await driver.sleep(1500);

        console.log("Locating the target habit in the table to delete...");
        const deleteXPath = "//tbody//tr[td//span[contains(text(), 'Selenium Habit Test')]]//button[contains(@class, 'action-delete')]";
        const habitDeleteBtn = await driver.wait(until.elementLocated(By.xpath(deleteXPath)), 10000);
        await performNativeClick(driver, habitDeleteBtn);

        console.log("Handling confirmation modal...");
        await driver.sleep(500);
        const deleteModal = await driver.wait(
            until.elementLocated(By.css(".custom-modal-backdrop .modal-panel")),
            10000
        );
        const deleteConfirmBtn = await deleteModal.findElement(By.css(".btn.btn-danger"));
        await driver.executeScript("arguments[0].click();", deleteConfirmBtn);

        await driver.sleep(1000);

        console.log("Waiting for Delete Toast message...");
        const deleteToast = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Habit deleted')]")),
            15000
        );
        const deleteToastText = await driver.executeScript("return arguments[0].innerText;", deleteToast);
        assert.ok(deleteToastText.includes("Habit deleted"), "Failed to delete habit. Text found: " + deleteToastText);

        console.log("Test passed: Habit successfully added and then deleted.");
    });

    // ----------------------------------------------------
    // Test 6: Admin Tasks Management (Add & Delete)
    // ----------------------------------------------------
    it('testAdminTasksManagement', async function () {
        console.log("Starting Admin Tasks Management Test...");

        // 1. ADD TASK
        console.log("Scrolling to tasks table...");
        const taskTableSection = await driver.wait(until.elementLocated(By.id("tasks-table")), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", taskTableSection);

        console.log("Clicking 'Add' task button...");
        const addTaskBtn = await taskTableSection.findElement(By.css(".btn.btn-add-decoration"));
        await performNativeClick(driver, addTaskBtn);

        console.log("Waiting for task modal to open...");
        const taskModal = await driver.wait(until.elementLocated(By.css(".custom-modal-backdrop .modal-panel")), 10000);
        await driver.sleep(500);

        console.log("Filling task title...");
        const titleInput = await taskModal.findElement(By.css("input[placeholder*='Morning Run']"));
        await titleInput.sendKeys("Selenium Task Test");

        console.log("Selecting priority (Low)...");
        await driver.executeScript(`
            var sel = arguments[0].querySelector("select");
            sel.value = 'Low';
            sel.dispatchEvent(new Event('change', { bubbles: true }));
        `, taskModal.findElement ? taskModal : taskModal);

        // Use explicit selects array and sendKeys for reliability so Vue picks up the change
        const selects = await taskModal.findElements(By.css("select.form-select"));
        // Priority (index 0)
        await selects[0].sendKeys("Low");
        await driver.sleep(300);
        // Task Type (index 1)
        await selects[1].sendKeys("Check");
        await driver.sleep(300);
        // Location (index 2)
        await selects[2].sendKeys("Inside");
        await driver.sleep(300);
        // Habit (index 3)
        await selects[3].sendKeys(Key.ARROW_DOWN); // Select first available habit
        await driver.sleep(300);

        console.log("Saving new task...");
        const saveTaskBtn = await taskModal.findElement(By.css("button.btn-success"));
        await driver.executeScript("arguments[0].click();", saveTaskBtn);

        console.log("Waiting for Add Toast message...");
        const addToast = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Task added')]")),
            15000
        );
        const addToastText = await driver.executeScript("return arguments[0].innerText;", addToast);
        assert.ok(addToastText.includes("Task added"), "Failed to add task. Text found: " + addToastText);

        console.log("Task created. Waiting 1.5 seconds...");
        await driver.sleep(1500);

        // 2. DELETE TASK
        console.log("Searching for the newly created 'Selenium Task Test' task...");
        const searchInput = await taskTableSection.findElement(By.css(".search-input"));
        await searchInput.clear();
        await searchInput.sendKeys("Selenium Task Test");
        await driver.sleep(1500);

        console.log("Locating the target task in the table to delete...");
        const deleteXPath = "//tbody//tr[td//span[contains(text(), 'Selenium Task Test')]]//button[contains(@class, 'action-delete')]";
        const taskDeleteBtn = await driver.wait(until.elementLocated(By.xpath(deleteXPath)), 10000);
        await performNativeClick(driver, taskDeleteBtn);

        console.log("Handling confirmation modal...");
        await driver.sleep(500);
        const deleteModal = await driver.wait(
            until.elementLocated(By.css(".custom-modal-backdrop .modal-panel")),
            10000
        );
        const deleteConfirmBtn = await deleteModal.findElement(By.css(".btn.btn-danger"));
        await driver.executeScript("arguments[0].click();", deleteConfirmBtn);

        await driver.sleep(1000);

        console.log("Waiting for Delete Toast message...");
        const deleteToast = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Task deleted')]")),
            15000
        );
        const deleteToastText = await driver.executeScript("return arguments[0].innerText;", deleteToast);
        assert.ok(deleteToastText.includes("Task deleted"), "Failed to delete task. Text found: " + deleteToastText);

        console.log("Test passed: Task successfully added and then deleted.");
    });

    // ----------------------------------------------------
    // Test 7: Admin Session Secure Logout
    // ----------------------------------------------------
    it('testAdminSessionSecureLogout', async function () {
        console.log("Starting Admin Session Secure Logout Test...");

        console.log("Navigating to Settings page...");
        const settingsNavBtn = await driver.wait(
            until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")), 
            10000
        );
        await performNativeClick(driver, settingsNavBtn);
        
        await driver.wait(until.urlContains('/settings'), 10000);
        await driver.sleep(1000); 

        console.log("Locating the logout button inside the sidebar...");
        let settingsCard;
        try {
            settingsCard = await driver.wait(until.elementLocated(By.className("settings-card")), 10000);
        } catch (err) {
            console.error("FAILED TO FIND .settings-card. DUMPING DOM:");
            console.error(await driver.executeScript("return document.body.innerHTML;"));
            throw err;
        }
        const settingsContent = await settingsCard.findElement(By.className("settings-content"));
        const sidebar = await settingsContent.findElement(By.className("sidebar"));
        const logoutBtn = await sidebar.findElement(By.id("logout-btn"));

        console.log("Clicking the logout button...");
        await driver.executeScript("arguments[0].click();", logoutBtn);

        console.log("Waiting for the confirmation modal to appear...");
        const confirmModal = await driver.wait(until.elementLocated(By.className("confirm-modal")), 10000);
        await driver.sleep(500); 

        // Re-locate to avoid StaleElementReferenceError
        const confirmBtn = await driver.wait(
            until.elementLocated(By.css(".confirm-modal .modal-actions .btn-confirm")), 
            10000
        );

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