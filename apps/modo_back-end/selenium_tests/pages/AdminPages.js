const { By, until } = require('selenium-webdriver');
const path = require('path');

class AdminDashboardPage {
    constructor(driver) {
        this.driver = driver;
    }

    async attemptDirectAccess() {
        // Force the browser to navigate directly to the admin route
        await this.driver.get("http://localhost:3000/admin");
    }

    async navigateToUsersManagement() {
        const usersMenu = await this.driver.wait(
            until.elementLocated(By.id("admin-menu-users")),
            10000
        );
        await usersMenu.click();
    }

    async clickAdminLogout() {
        const logoutBtn = await this.driver.wait(
            until.elementLocated(By.id("admin-btn-logout")),
            10000
        );
        await logoutBtn.click();
    }
}

class AdminUsersPage {
    constructor(driver) {
        this.driver = driver;
    }

    async searchUser(email) {
        const searchInput = await this.driver.wait(
            until.elementLocated(By.id("admin-search-user")),
            10000
        );
        await searchInput.sendKeys(email);
        
        const searchBtn = await this.driver.findElement(By.id("btn-execute-search"));
        await searchBtn.click();
    }

    async banUser(userId) {
        const banBtn = await this.driver.wait(
            until.elementLocated(By.id(`btn-ban-${userId}`)),
            10000
        );
        await banBtn.click();
        
        // Wait for the confirmation modal button to appear
        const confirmBtn = await this.driver.wait(
            until.elementLocated(By.id("btn-confirm-ban")),
            10000
        );
        await confirmBtn.click();
    }
}

class AdminTasksPage {
    constructor(driver) {
        this.driver = driver;
    }

    async createGlobalHabit(title, description, points) {
        const newHabitBtn = await this.driver.wait(
            until.elementLocated(By.id("btn-new-global-habit")),
            10000
        );
        await newHabitBtn.click();

        const titleInput = await this.driver.wait(
            until.elementLocated(By.id("input-habit-title")),
            10000
        );
        const descInput = await this.driver.findElement(By.id("input-habit-desc"));
        const pointsInput = await this.driver.findElement(By.id("input-habit-points"));
        const saveBtn = await this.driver.findElement(By.id("btn-save-habit"));

        await titleInput.sendKeys(title);
        await descInput.sendKeys(description);
        await pointsInput.sendKeys(points);
        await saveBtn.click();
    }
}

class AdminDecorationsPage {
    constructor(driver) {
        this.driver = driver;
    }

    async uploadNewDecoration(name, requiredLevel, fileName) {
        const newDecorationBtn = await this.driver.wait(
            until.elementLocated(By.id("btn-new-decoration")),
            10000
        );
        await newDecorationBtn.click();

        const nameInput = await this.driver.wait(
            until.elementLocated(By.id("input-decoration-name")),
            10000
        );
        const levelInput = await this.driver.findElement(By.id("input-decoration-level"));
        
        // Find the hidden file input element
        const fileInput = await this.driver.findElement(By.id("input-decoration-file"));
        
        // Resolve absolute path exactly like teste06.js
        const absoluteFilePath = path.resolve(__dirname, fileName);
        await fileInput.sendKeys(absoluteFilePath);
        
        const saveBtn = await this.driver.findElement(By.id("btn-save-decoration"));
        
        await nameInput.sendKeys(name);
        await levelInput.sendKeys(requiredLevel);
        await saveBtn.click();
    }
}

module.exports = { 
    AdminDashboardPage, 
    AdminUsersPage, 
    AdminTasksPage, 
    AdminDecorationsPage 
};