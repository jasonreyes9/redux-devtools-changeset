import { join } from 'path';
import webdriver from 'selenium-webdriver';
import electronPath from 'electron';
import chromedriver from 'chromedriver';
import { switchMonitorTests, delay } from '../utils/e2e';

const port = 9515;
const devPanelPath =
  'chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd/window.html';

describe('DevTools panel for Electron', function () {
  beforeAll(async () => {
    chromedriver.start();
    await delay(1000);
    this.driver = new webdriver.Builder()
      .usingServer(`http://localhost:${port}`)
      .withCapabilities({
        chromeOptions: {
          binary: electronPath,
          args: [`app=${join(__dirname, 'fixture')}`],
        },
      })
      .forBrowser('electron')
      .build();
    await this.driver.manage().timeouts().setScriptTimeout(10000);
  });

  afterAll(async () => {
    await this.driver.quit();
    chromedriver.stop();
  });

  it('should open Redux DevTools tab', async () => {
    if (!(await this.driver.getCurrentUrl()).startsWith('devtools')) {
      const originalWindow = await this.driver.getWindowHandle();
      const windows = await this.driver.getAllWindowHandles();
      for (const window of windows) {
        if (window === originalWindow) continue;
        await this.driver.switchTo().window(window);
        if ((await this.driver.getCurrentUrl()).startsWith('devtools')) {
          break;
        }
      }
    }
    expect(await this.driver.getCurrentUrl()).toMatch(
      /devtools:\/\/devtools\/bundled\/devtools_app.html/
    );

    await this.driver.manage().timeouts().pageLoadTimeout(5000);

    const id = await this.driver.executeAsyncScript(function (callback) {
      let attempts = 5;
      function showReduxPanel() {
        if (attempts === 0) {
          return callback('Redux panel not found');
        }
        if (UI.inspectorView) {
          const tabs = UI.inspectorView._tabbedPane._tabs;
          const idList = tabs.map((tab) => tab.id);
          const reduxPanelId =
            'chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljdRedux';
          if (idList.indexOf(reduxPanelId) !== -1) {
            UI.inspectorView.showPanel(reduxPanelId);
            return callback(reduxPanelId);
          }
        }
        attempts--;
        setTimeout(showReduxPanel, 500);
      }
      showReduxPanel();
    });
    expect(id).toBe('chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljdRedux');

    const className = await this.driver
      .findElement(webdriver.By.className(id))
      .getAttribute('class');
    expect(className).not.toMatch(/hidden/); // not hidden
  });

  it('should have Redux DevTools UI on current tab', async () => {
    await this.driver
      .switchTo()
      .frame(
        this.driver.findElement(
          webdriver.By.xpath(`//iframe[@src='${devPanelPath}']`)
        )
      );
    await delay(1000);
  });

  it('should contain INIT action', async () => {
    const element = await this.driver.wait(
      webdriver.until.elementLocated(
        webdriver.By.xpath('//div[contains(@class, "actionListRows-")]')
      ),
      5000,
      'Element not found'
    );
    const val = await element.getText();
    expect(val).toMatch(/@@INIT/);
  });

  it("should contain Inspector monitor's component", async () => {
    const val = await this.driver
      .findElement(webdriver.By.xpath('//div[contains(@class, "inspector-")]'))
      .getText();
    expect(val).toBeDefined();
  });

  Object.keys(switchMonitorTests).forEach((description) =>
    it(description, switchMonitorTests[description].bind(this))
  );

  /*  it('should be no logs in console of main window', async () => {
    const handles = await this.driver.getAllWindowHandles();
    await this.driver.switchTo().window(handles[1]); // Change to main window

    expect(await this.driver.getTitle()).toBe('Electron Test');

    const logs = await this.driver.manage().logs().get(webdriver.logging.Type.BROWSER);
    expect(logs).toEqual([]);
  });
*/
});
