const { By, until } = require("selenium-webdriver");
const path = require("path");

// (Note: The ExplorePage code we wrote in the previous message goes here)

class DashboardPage {
  constructor(driver) {
    this.driver = driver;
  }

  async isAvatarVisible() {
    // Wait for the avatar element to be located
    const avatar = await this.driver.wait(
      until.elementLocated(By.id("user-avatar")),
      10000,
    );
    return await avatar.isDisplayed();
  }

  async completeTaskAndGetPoints(taskId) {
    // Find the specific task checkbox and click
    const taskCheckbox = await this.driver.wait(
      until.elementLocated(By.id(`task-checkbox-${taskId}`)),
      10000,
    );
    await taskCheckbox.click();

    // Wait for points to update (using regular expression for any number > 0)
    const pointsElement = await this.driver.wait(
      until.elementLocated(By.id("user-total-points")),
      10000,
    );
    await this.driver.wait(
      until.elementTextMatches(pointsElement, /^[1-9]\d*$/),
      10000,
    );
  }

  async clickLogout() {
    const logoutBtn = await this.driver.wait(
      until.elementLocated(By.id("btn-logout")),
      10000,
    );
    await logoutBtn.click();
  }
}

class ExplorePage {
  constructor(driver) {
    this.driver = driver;
  }
}

class SettingsPage {
  constructor(driver) {
    this.driver = driver;
  }

  async toggleTheme() {
    const themeToggleBtn = await this.driver.wait(
      until.elementLocated(By.id("theme-toggle-btn")),
      10000,
    );
    await themeToggleBtn.click();
  }

  async uploadProfileImage(fileName) {
    // Wait for the hidden file input
    const fileInput = await this.driver.wait(
      until.elementLocated(By.id("input-profile-image")),
      10000,
    );

    // Resolve absolute path exactly like teste06.js
    const absoluteFilePath = path.resolve(__dirname, fileName);
    await fileInput.sendKeys(absoluteFilePath);

    const saveBtn = await this.driver.findElement(By.id("btn-save-image"));
    await saveBtn.click();
  }

  async equipAvatarDecoration(decorationId) {
    const decorationItem = await this.driver.wait(
      until.elementLocated(By.id(`decoration-${decorationId}`)),
      10000,
    );
    await decorationItem.click();

    const applyBtn = await this.driver.findElement(
      By.id("btn-apply-decoration"),
    );
    await applyBtn.click();
  }
}

module.exports = { DashboardPage, SettingsPage, ExplorePage };
