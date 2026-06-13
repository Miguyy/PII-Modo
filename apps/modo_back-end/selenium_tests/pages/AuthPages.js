const { By, until } = require('selenium-webdriver');

// Função exportada para poder ser usada também no user.test.js
async function performNativeClick(driver, element) {
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
    await driver.executeScript(`
        var el = arguments[0];
        el.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true, isPrimary: true}));
        el.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, cancelable: true, isPrimary: true}));
        el.click();
    `, element);
}

class HomePage {
    constructor(driver) { this.driver = driver; }

    async clickLoginNavbar() {
        const btn = await this.driver.wait(until.elementLocated(By.css(".login-btn")), 10000);
        await performNativeClick(this.driver, btn);
    }
}

class LoginPage {
    constructor(driver) { this.driver = driver; }

    async clickSignUpLink() {
        const btn = await this.driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Sign Up') or contains(text(), 'Sign up')]")), 
            10000
        );
        await performNativeClick(this.driver, btn);
    }

    async waitForLoginPageToLoad() {
        await this.driver.wait(until.urlContains("/login"), 10000);
    }

    async performLogin(email, password) {
        const emailInput = await this.driver.wait(until.elementLocated(By.id("login-email-user")), 10000);
        await emailInput.sendKeys(email);
        await this.driver.findElement(By.id("login-password-user")).sendKeys(password);
        
        const loginBtn = await this.driver.wait(until.elementLocated(By.id("login_btn")), 5000);
        
        // TRUQUE 1: Tira o foco do último input para o React/Vue validar que a senha foi escrita
        await this.driver.executeScript("document.activeElement.blur();");
        await this.driver.sleep(500); // Dá tempo à interface para acordar
        
        // TRUQUE 2: O nosso clique nativo
        await performNativeClick(this.driver, loginBtn);
        
        // TRUQUE 3: Plano de contingência imediato se o clique falhar
        await this.driver.sleep(500);
        const currentUrl = await this.driver.getCurrentUrl();
        // Se a URL ainda tiver "/login", significa que o botão não obedeceu
        if (currentUrl.includes("/login")) {
            console.log("Botão de Login ignorou o clique. Forçando submissão via JavaScript puro...");
            await this.driver.executeScript("arguments[0].click();", loginBtn);
        }
    }
}

class RegisterPage {
    constructor(driver) { this.driver = driver; }

    async fillRegistrationForm(name, email, password) {
        await this.driver.sleep(1000); // Espera animação da página
        const nameInput = await this.driver.wait(until.elementLocated(By.id("reg-name-user")), 10000);
        await nameInput.sendKeys(name);
        await this.driver.findElement(By.id("reg-email-user")).sendKeys(email);
        await this.driver.findElement(By.id("reg-password-user")).sendKeys(password);
    }

    async clickSignUpSubmit() {
        const btn = await this.driver.wait(until.elementLocated(By.id("signUp_btn")), 5000);
        
        // TRUQUE 1: Tira o foco do último input para forçar o React/Vue a validar o formulário
        await this.driver.executeScript("document.activeElement.blur();");
        await this.driver.sleep(500); // Dá tempo ao framework para ativar o botão
        
        // TRUQUE 2: Tenta o nosso clique nativo
        await performNativeClick(this.driver, btn);
        
        // TRUQUE 3: Plano B imediato se a página não mudar
        await this.driver.sleep(500);
        const currentUrl = await this.driver.getCurrentUrl();
        if (!currentUrl.includes("/login")) {
            console.log("O botão ignorou o evento. Forçando submissão via JavaScript puro...");
            await this.driver.executeScript("arguments[0].click();", btn);
        }
    }
}

module.exports = { HomePage, LoginPage, RegisterPage, performNativeClick };