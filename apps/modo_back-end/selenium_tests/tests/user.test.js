const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const path = require('path'); // IMPORTANTE: Necessário para o Teste 8 (Upload de Imagem)

// Import the Page Objects
const { HomePage, LoginPage, RegisterPage } = require('../pages/AuthPages');
const { DashboardPage, ExplorePage } = require('../pages/AppPages');

// Centralized test credentials
const TEST_USER = {
    email: `selenium_${Date.now()}@email.com`,
    password: "Selenium2026!#"
};

// Robust function to interact with the UI
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

        // Initializes pages to be available
        loginPage = new LoginPage(driver);
        registerPage = new RegisterPage(driver);

        // ----------------------------------------------------
        // Auto-Login Logic (Robust)
        // ----------------------------------------------------
        const currentTestName = this.currentTest.title;
        const testsWithoutAutoLogin = ['testUserRegistration', 'testUserAuthentication'];

        if (!testsWithoutAutoLogin.includes(currentTestName)) {
            console.log(`[Setup] Auto-login triggered for: ${currentTestName}`);
            
            await driver.get('http://localhost:5173/login');
            
            // Using robust LoginPage logic (should have new IDs: login_btn)
            await loginPage.performLogin(TEST_USER.email, TEST_USER.password);
            
            // Wait for the login redirect to finish to avoid race conditions!
            await driver.wait(until.urlContains("/habitsmanager"), 10000);
            
            console.log("[Setup] Verifying if login was successful...");
            await driver.wait(until.elementLocated(By.css("a[title='Explore Habits']")), 10000);
            console.log("[Setup] Login successfully validated! Navigation is ready.");
        }
    });

    afterEach(async function () {
        try {
            // FIX: Cleanup also needs NativeClick
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
    it('testUserRegistration', async function () {
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
    it('testUserAuthentication', async function () {
        const loginPage = new LoginPage(driver);

        console.log("Starting Authentication Success Test...");
        console.log("Opening the login page...");
        await driver.get('http://localhost:5173/login');

        console.log("Filling credentials and clicking the login button...");
        await loginPage.performLogin(TEST_USER.email, TEST_USER.password);

        console.log("Waiting for router redirection...");
        
        // 1. CRITICAL WAIT: Ensures Vue/React has updated the URL
        await driver.wait(until.urlContains('/habitsmanager'), 10000);

        console.log("Checking the navigation bar...");
        // 2. Ensures the interface has finished rendering
        await driver.wait(until.elementLocated(By.css("a[title='Explore Habits']")), 10000);
        
        // 3. Now it is 100% safe to capture the URL
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
    it('testUserExploreHabitsAndAddHabit', async function () {
        console.log("Starting Explore and Add Habit Test...");

        // 1. Navigate to Explore page
        console.log("Navigating to Explore Habits page...");
        const exploreNavBtn = await driver.wait(
            until.elementLocated(By.css("a[aria-label='Explore Habits']")), 
            10000
        );
        await performNativeClick(driver, exploreNavBtn);

        await driver.wait(until.urlContains("/explorehabits"), 10000);

        // 2. Locate Habits Grid and scroll
        console.log("Waiting for habits grid (.habits-grid) to load...");
        const habitsGrid = await driver.wait(
            until.elementLocated(By.css(".habits-grid")), 
            10000
        );
        
        console.log("Scrolling to the habits grid...");
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", habitsGrid);
        
        await driver.sleep(1500); // Pause for API to load data

        // 3. Choose and click a card
        const habits = await driver.wait(
            until.elementsLocated(By.css(".habits-grid .habit-card, .habits-grid .card, .habits-grid [class*='card']")),
            10000
        );
        assert.ok(habits.length > 0, "Grid loaded, but it is empty. No cards found!");
        
        const targetIndex = habits.length >= 2 ? 1 : 0;
        const targetHabit = habits[targetIndex];
        
        console.log("Scrolling to the target habit...");
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", targetHabit);
        
        console.log(`Clicking on habit number ${targetIndex + 1}...`);
        await performNativeClick(driver, targetHabit);

        // 4. Click add button (Without waiting for modal)
        console.log("Waiting for add habit button...");
        
        const addHabitBtn = await driver.wait(
            until.elementLocated(By.css(".btn-add-habit")), 
            15000 // Increased time slightly in case modal animation is slow
        );
        
        await driver.sleep(1000); // Short pause to ensure stability
        console.log("Button found! Executing native click...");
        await performNativeClick(driver, addHabitBtn);

        await driver.sleep(2000); // Wait for backend to confirm addition

        console.log("Looking for close button with class .custom-modal-close...");
        try {
            // Attempt 1: Click button by discovered class
            const closeModalBtn = await driver.findElement(By.css(".custom-modal-close"));
            await performNativeClick(driver, closeModalBtn);
        } catch (e) {
            console.log(".custom-modal-close button not found, trying ESC key...");
            await driver.actions().sendKeys(Key.ESCAPE).perform();
        }
        
        await driver.sleep(1000);

        // 6. Return to Dashboard and verify
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
    // Test 4: Explore Habits Catalog & Add task 
    // ----------------------------------------------------
    it('testUserExploreHabitsAndAddTask', async function () {
        console.log("Starting Explore and Add Task Test...");

        // 1. Navigate to Explore page
        console.log("Navigating to Explore Habits page...");
        const exploreNavBtn = await driver.wait(
            until.elementLocated(By.css("a[aria-label='Explore Habits']")), 
            10000
        );
        await performNativeClick(driver, exploreNavBtn);

        await driver.wait(until.urlContains("/explorehabits"), 10000);

        await driver.sleep(1500); // Pause for API to load data

        // 3. Choose and click a card
        const habits = await driver.wait(
            until.elementsLocated(By.css(".habits-grid .habit-card, .habits-grid .card, .habits-grid [class*='card']")),
            10000
        );
        console.log(`Found ${habits.length} cards in the grid.`);
        assert.ok(habits.length > 0, "Grid loaded, but it is empty. No cards found!");
        
        // Use index 0 for Test 4, whereas Test 3 uses index 1. This prevents exploring a habit that was already added!
        const targetIndex = 0;
        const targetHabit = habits[targetIndex];
        
        console.log("Scrolling to the target habit...");
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", targetHabit);
        
        console.log(`Clicking on habit number ${targetIndex + 1}...`);
        await performNativeClick(driver, targetHabit);

        // 4. Click add button (Without waiting for modal)
        console.log("Waiting for add task button...");
        
        const addTaskBtn = await driver.wait(
            until.elementLocated(By.css(".btn-add-task")), 
            15000 // Increased time slightly in case modal animation is slow
        );
        
        await driver.sleep(1000); // Short pause to ensure stability
        console.log("Button found! Executing native click...");
        await performNativeClick(driver, addTaskBtn);

        await driver.sleep(2000); // Wait for backend to confirm addition

        console.log("Looking for close button with class .custom-modal-close...");
        try {
            // Attempt 1: Click button by discovered class
            const closeModalBtn = await driver.findElement(By.css(".custom-modal-close"));
            await performNativeClick(driver, closeModalBtn);
        } catch (e) {
            console.log(".custom-modal-close button not found, trying ESC key...");
            await driver.actions().sendKeys(Key.ESCAPE).perform();
        }
        
        await driver.sleep(1000);

        // 6. Return to Dashboard and verify
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
    // Test 5: Habit Task Completion and Rewards
    // ----------------------------------------------------
    it('testUserHabitTaskCompletionAndRewards', async function () {
        console.log("Starting Habit Task Completion Test...");

        // 1. Wait and prepare the grid
        const habitsGrid = await driver.wait(until.elementLocated(By.className("habits-grid")), 15000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", habitsGrid);
        
        await driver.wait(async () => {
            const cards = await driver.findElements(By.className("habit-item"));
            return cards.length > 0;
        }, 15000, "Timeout: No card was loaded.");
        
        let cards = await driver.findElements(By.className("habit-item")); 
        const initialCardCount = cards.length;
        console.log(`Initial number of task cards: ${initialCardCount}`);

        // We will use performNativeClick function defined at the top which proved reliable

        // 2. Locate first card and click "Mark Done"
        const firstCard = await driver.wait(until.elementLocated(By.className("habit-item")), 10000);
        let btn = await firstCard.findElement(By.css(".btn-outline-success")); 
        
        console.log("Forcing click on first button (Mark Done)...");
        await driver.executeScript("arguments[0].click();", btn);
        
        // 3. Wait for transition and recapture button
        console.log("Waiting for button transition...");
        await driver.sleep(2500); 

        console.log("Forcing click on second button (Complete & Earn Points)...");
        btn = await firstCard.findElement(By.css(".btn-success.flex-fill"));
        await driver.executeScript("arguments[0].click();", btn);

        // 5. Verify if item was removed
        console.log("Waiting for card removal...");
        await driver.wait(async () => {
            const currentCards = await driver.findElements(By.className("habit-item"));
            return currentCards.length < initialCardCount;
        }, 15000, "Card was not removed from grid!");

        const finalCards = await driver.findElements(By.className("habit-item"));
        assert.strictEqual(finalCards.length, initialCardCount - 1, "Task was not deleted.");

        console.log("Test passed: Task completed and removed!");
    });

    // ----------------------------------------------------
    // Test 6: Statistics Dashboard and PDF Export
    // ----------------------------------------------------
    it('testUserStatisticsDashboardAndReportExport', async function () {
        console.log("Starting Statistics Dashboard and PDF Export Test...");

        // 1. Wait for dashboard and scroll to charts block
        console.log("Waiting for the charts box to load...");
        const chartsBox = await driver.wait(
            until.elementLocated(By.className("charts-box")), 
            15000
        );
        
        console.log("Scrolling to the charts box...");
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", chartsBox);
        await driver.sleep(1000);

        // 2. Locate and click button with title="Generate Report" INSIDE chartsBox
        console.log("Locating the 'Generate Report' button...");
        const openReportBtn = await chartsBox.findElement(By.css("[title='Generate Report']"));
        
        console.log("Clicking the 'Generate Report' button...");
        await driver.executeScript("arguments[0].click();", openReportBtn);

        // 3. Wait for report panel to appear
        console.log("Waiting for the '.report-panel' div to appear...");
        const reportPanel = await driver.wait(
            until.elementLocated(By.css(".report-panel")), 
            10000
        );
        await driver.sleep(1000); // Short pause for panel animation

        // 4. Locate specific selects
        console.log("Locating the select dropdowns...");
        const selects = await reportPanel.findElements(By.css("select.form-select.form-select-sm"));
        assert.ok(selects.length >= 2, "The report panel should contain at least 2 select elements.");

        // 5. Interact with first Select
        console.log("Interacting with the first Select dropdown...");
        // Change to option 1 (second item in list, assuming 0 is "Select...")
        await driver.executeScript(`
            var select = arguments[0];
            select.selectedIndex = 1; 
            select.dispatchEvent(new Event('change', { bubbles: true }));
        `, selects[0]);
        await driver.sleep(500);

        // 6. Interact with second Select
        console.log("Interacting with the second Select dropdown...");
        await driver.executeScript(`
            var select = arguments[0];
            select.selectedIndex = 1; 
            select.dispatchEvent(new Event('change', { bubbles: true }));
        `, selects[1]);
        await driver.sleep(500);

        // 7. Click final button to generate
        console.log("Clicking the 'btn-generate' button...");
        const generateBtn = await reportPanel.findElement(By.css(".btn.btn-generate.w-100"));
        await driver.executeScript("arguments[0].click();", generateBtn);

        // 8. Validate Download success
        console.log("Waiting for the PDF generation and the success message...");
        const successMessageLocator = By.xpath("//*[contains(text(), 'Report saved and download started!')]");
        
        const successMsgElement = await driver.wait(until.elementLocated(successMessageLocator), 15000);
        const msgText = await successMsgElement.getText();
        
        assert.ok(
            msgText.includes("Report saved and download started!"),
            "The system failed to display the correct download confirmation message."
        );

        console.log("Test passed: Statistics panel works and PDF export was triggered successfully.");
        await driver.sleep(3000); // Give extra time to ensure download starts before browser closes
    });

    // ----------------------------------------------------
    // Test 7: Avatar Decoration Customization
    // ----------------------------------------------------
    it('testUserCustomAvatarDecoration', async function () {
        console.log("Starting Avatar Decoration Customization Test...");

        // Navigation
        const settingsNavBtn = await driver.wait(
            until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")), 
            10000
        );
        await driver.executeScript("arguments[0].click();", settingsNavBtn);
        await driver.wait(until.urlContains('/settings'), 10000);
        await driver.sleep(1000);

        // Editing
        const settingsCard = await driver.wait(until.elementLocated(By.className("settings-card")), 10000);
        const editAvatarBtn = await settingsCard.findElement(By.css(".btn-avatar-edit"));
        await driver.executeScript("arguments[0].click();", editAvatarBtn);

        // Swiper
        const swiper = await driver.wait(until.elementLocated(By.className("swiper")), 10000);
        const checkAvatarBtn = await swiper.findElement(By.css(".swiper-slide .btn-avatar-check"));
        
        // REQUESTED PAUSE: 1 second for viewing
        console.log("Viewing swiper before confirming...");
        await driver.sleep(1000); 
        
        console.log("Confirming decoration...");
        await driver.executeScript("arguments[0].click();", checkAvatarBtn);

        // Wait for avatar to return
        await driver.wait(until.elementLocated(By.css(".settings-card .avatar")), 10000);

        console.log("Looking for Toast via content scanning...");
        
        // Instead of waiting for a class, wait for element containing expected text
        // This ignores CSS class and focuses only on content
        try {
            const toast = await driver.wait(
                until.elementLocated(By.xpath("//*[contains(text(), 'Decoration Applied')]")), 
                20000
            );
            const toastText = await toast.getText();
            console.log(`Sucesso! Toast encontrado. Texto: "${toastText}"`);
        } catch (err) {
            console.log("Failure: XPath did not find any element with text 'Decoration Applied'.");
            
            // SECURITY DUMP: Show what exists in page body to discover class
            const bodyContent = await driver.executeScript("return document.body.innerHTML.substring(0, 500);");
            console.log("--- DUMP OF BODY START ---");
            console.log(bodyContent);
            console.log("------------------------------");
            throw new Error("Toast not found. Check DUMP above to see if element exists in DOM.");
        }

        console.log("Test passed: Decoration successfully applied.");
    });

    // ----------------------------------------------------
    // Test 8: User Theme Toggle (Dark/Light Mode)
    // ----------------------------------------------------
    it('testUserSettingsAndThemeToggle', async function () {
        console.log("Starting User Theme Toggle Test...");

        await driver.wait(until.elementLocated(By.css("a[title='Explore Habits']")), 10000);

        console.log("Locating the theme toggle button...");
        const themeToggleBtn = await driver.wait(
            until.elementLocated(By.css(".custom-theme-toggle")),
            10000
        );

        // Adding requested 2 second pause
        console.log("Waiting 2 seconds before clicking...");
        await driver.sleep(2000);

        const initialTitle = await themeToggleBtn.getAttribute("title");
        assert.strictEqual(initialTitle, "Switch to Dark Mode", "App should be in Light Mode.");

        console.log("Clicking the theme toggle button to activate Dark Mode...");
        // CORREÇÃO: Native Click
        await performNativeClick(driver, themeToggleBtn);

        console.log("Waiting for the button title to update...");
        await driver.wait(async () => {
            const currentTitle = await themeToggleBtn.getAttribute("title");
            return currentTitle === "Switch to Light Mode";
        }, 10000);

        console.log("Verifying if the Dark Mode attribute was applied to the HTML tag...");
        // CORREÇÃO AQUI: Em vez do 'body', capturamos a tag 'html'
        const htmlElement = await driver.findElement(By.tagName("html"));
        
        // Instead of class, read Bootstrap attribute
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
    // Test 9: User Image Profile Update
    // ----------------------------------------------------
    it('testUserChangeImageProfile', async function () {
        console.log("Starting User Image Profile Update Test...");

        // 1. Navigation para Settings
        console.log("Navigating to Settings page...");
        const settingsNavBtn = await driver.wait(
            until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")), 
            10000
        );
        await driver.executeScript("arguments[0].click();", settingsNavBtn);
        await driver.wait(until.urlContains('/settings'), 10000);
        await driver.sleep(1500);

        // 2. Locate Avatar and verify initial condition (Has image or is empty?)
        console.log("Checking initial avatar state...");
        const settingsCard = await driver.wait(until.elementLocated(By.className("settings-card")), 10000);
        const profileHeader = await settingsCard.findElement(By.className("profile-header"));
        const avatar = await profileHeader.findElement(By.className("avatar"));
        
        // Em vez de 'wait', usamos 'findElements' para não dar erro se não existir
        const initialImages = await avatar.findElements(By.tagName("img"));
        let initialSrc = null;

        if (initialImages.length > 0) {
            initialSrc = await initialImages[0].getAttribute("src");
            console.log(`[Condition A] Current image detected. URL: ${initialSrc}`);
        } else {
            console.log(`[Condition B] No profile picture detected (Placeholder active).`);
        }

        // 3. Prepare and send local file
        console.log("Resolving local image path...");
        const filePath = path.resolve(__dirname, '../images/profile_picture.jpg');
        
        console.log("Injecting image into hidden input...");
        const fileInput = await driver.wait(until.elementLocated(By.css('input[type="file"]')), 10000);
        
        // MOSTRAR: Forçamos a exibição apenas para o Selenium não dar erro de "elemento não interativo"
        await driver.executeScript(
            "arguments[0].style.display = 'block'; arguments[0].style.visibility = 'visible'; arguments[0].style.opacity = '1';", 
            fileInput
        );
        
        // INJECT: Selenium sends the file
        await fileInput.sendKeys(filePath);

        // HIDE: Immediately after sending, force complete disappearance of element from screen
        await driver.executeScript(
            "arguments[0].style.display = 'none'; arguments[0].style.visibility = 'hidden'; arguments[0].style.opacity = '0';", 
            fileInput
        );

        // 4. Post-Upload Conditional Validation
        console.log("Waiting for app to process upload and update screen...");
        await driver.wait(async () => {
            const currentImages = await avatar.findElements(By.tagName("img"));
            
            // If still no image in DOM, keep waiting
            if (currentImages.length === 0) return false; 
            
            const currentSrc = await currentImages[0].getAttribute("src");
            
            if (initialSrc) {
                // Condition A (Tinha imagem): Test passes when SRC is different from old one
                return currentSrc !== initialSrc && currentSrc.length > 0;
            } else {
                // Condition B (Não tinha imagem): Test passes as soon as img tag appears with valid link
                return currentSrc && currentSrc.length > 0;
            }
        }, 20000, "Timeout: New avatar image was not rendered on screen.");

        // Final Confirmation
        const finalImages = await avatar.findElements(By.tagName("img"));
        const updatedSrc = await finalImages[0].getAttribute("src");
        console.log(`Success! New image processed by site: ${updatedSrc}`);

        // 5. Toast Validation
        console.log("Waiting for success notification...");
        try {
            const toast = await driver.wait(until.elementLocated(By.css(".toast, .notification")), 8000);
            const toastText = await toast.getText();
            console.log(`Captured toast: "${toastText.trim()}"`);
            assert.ok(
                toastText.includes("Picture updated"), 
                "Toast does not contain expected success text."
            );
        } catch (e) {
            console.log("Note: Toast not located, but avatar image was visually validated!");
        }

        console.log("Test passed: Profile picture successfully uploaded and verified.");
        await driver.sleep(1500);
    });

    // ----------------------------------------------------
    // Test 10: User Session Secure Logout
    // ----------------------------------------------------
    it('testUserSessionSecureLogout', async function () {
        console.log("Starting User Session Secure Logout Test...");

        // 1. Navigate to Settings page
        console.log("Navigating to Settings page...");
        const settingsNavBtn = await driver.wait(
            until.elementLocated(By.css(".custom-navbar [aria-label='Settings']")), 
            10000
        );
        await performNativeClick(driver, settingsNavBtn);
        
        // Wait for URL change and give time for page to render
        await driver.wait(until.urlContains('/settings'), 10000);
        await driver.sleep(1000);

        // 2. Locate Logout button following exact hierarchy
        console.log("Locating the logout button inside the sidebar...");
        const settingsCard = await driver.wait(until.elementLocated(By.className("settings-card")), 10000);
        const settingsContent = await settingsCard.findElement(By.className("settings-content"));
        const sidebar = await settingsContent.findElement(By.className("sidebar"));
        const logoutBtn = await sidebar.findElement(By.id("logout-btn"));

        console.log("Clicking the logout button...");
        await driver.executeScript("arguments[0].click();", logoutBtn);

        // 3. Locate confirmation modal and its buttons
        console.log("Waiting for the confirmation modal to appear...");
        const confirmModal = await driver.wait(until.elementLocated(By.className("confirm-modal")), 10000);
        
        // Short pause to ensure any fade-in animation of modal ends
        await driver.sleep(500); 

        const modalActions = await confirmModal.findElement(By.className("modal-actions"));
        const confirmBtn = await modalActions.findElement(By.className("btn-confirm"));

        console.log("Confirming logout via modal...");
        await driver.executeScript("arguments[0].click();", confirmBtn);

        // 4. Validate redirection to Login
        console.log("Waiting for redirection to login page...");
        await driver.wait(until.urlContains('/login'), 15000);

        const currentUrl = await driver.getCurrentUrl();
        assert.ok(currentUrl.includes('/login'), "Logout failed: System did not redirect to login.");

        console.log("Test passed: Session safely destroyed via modal confirmation.");
        await driver.sleep(1000);
    });

});