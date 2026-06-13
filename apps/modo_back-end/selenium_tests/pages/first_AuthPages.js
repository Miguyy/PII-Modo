const { By, until } = require('selenium-webdriver');

class HomePage {
    constructor(driver) {
        this.driver = driver; // O segredo está aqui!
    }

    async clickLoginNavbar() {
        // Use 'this.driver' em vez de apenas 'driver'
        const loginBtn = await this.driver.wait(until.elementLocated(By.css(".login-btn")), 10000);
        await loginBtn.click();
    }
}

class LoginPage {
    constructor(driver) {
        this.driver = driver; 
    }

    async clickSignUpLink() {
        // Clica no link ou botão que contiver o texto "Sign Up"
        // O XPath //a[contains(text(), 'Sign Up')] procura um link (<a>)
        // O XPath //button[contains(text(), 'Sign Up')] procura um botão
        // Vamos tentar um seletor genérico que aceita ambos:
        const signUpBtn = await this.driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Sign Up')]")),
            10000
        );
        await signUpBtn.click();
    }

    async waitForLoginPageToLoad() {
        // Wait until the URL contains '/login'
        await this.driver.wait(until.urlContains("/login"), 10000);
    }

    async performLogin(email, password) {
        // 1. Preencher campos
        await this.driver.findElement(By.id("login-email-user")).sendKeys(email);
        await this.driver.findElement(By.id("login-password-user")).sendKeys(password);
        
        // 2. Localizar botão
        const loginBtn = await this.driver.findElement(By.xpath("//button[contains(text(), 'Login')]"));
        
        // 3. Preparação: Scroll para garantir visibilidade física
        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", loginBtn);
        
        // 4. Tentativa de clique nativo (o seu favorito que "seleciona")
        // Adicionamos um pequeno delay após o foco para garantir que o React processa o foco
        await loginBtn.click();
        
        // 5. SE o clique nativo falhou (ou seja, a URL não mudou), forçamos o clique via JS
        // Isto funciona como um "plano de contingência" instantâneo
        await this.driver.sleep(500); 
        const currentUrl = await this.driver.getCurrentUrl();
        if (currentUrl.includes("/login")) {
            console.log("Native click failed, forcing via JavaScript...");
            await this.driver.executeScript("arguments[0].click();", loginBtn);
        }
    }
}

class RegisterPage {
    constructor(driver) {
        this.driver = driver;
    }

    async fillRegistrationForm(name, email, password) {
        await this.driver.findElement(By.id("reg-name-user")).sendKeys(name);
        await this.driver.findElement(By.id("reg-email-user")).sendKeys(email);
        await this.driver.findElement(By.id("reg-password-user")).sendKeys(password);
    }

    async clickSignUpSubmit() {
        const btn = await this.driver.findElement(By.xpath("//button[contains(text(), 'Sign Up')]"));
        
        // 1. Garantee the element is in the center of the view.
        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
        
        // 2. Garantee focus on the element
        await btn.click();
        
        // 3. This mimics a real user interaction more closely by dispatching native pointer events.
        await this.driver.executeScript(`
            var el = arguments[0];
            // Complete sequence of modern interaction. This mimics what React/Vue would listen to.
            el.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true, isPrimary: true}));
            el.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, cancelable: true, isPrimary: true}));
            el.click();
        `, btn);
        
        console.log("Click dispared via native PointerEvent.");
    }
}

module.exports = { HomePage, LoginPage, RegisterPage };