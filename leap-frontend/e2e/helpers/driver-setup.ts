import { Builder, WebDriver, logging } from 'selenium-webdriver';
import { Options, ServiceBuilder } from 'selenium-webdriver/chrome';
import { HEADLESS } from '../config/test-config';

let sharedDriver: WebDriver | null = null;

/** Get or create the shared Chrome WebDriver instance. */
export async function getDriver(): Promise<WebDriver> {
  if (!sharedDriver) {
    const options = new Options();
    if (HEADLESS) {
      options.addArguments('--headless=new');
    }
    options.addArguments(
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1366,768',
      '--disable-features=MediaRouter',
      '--log-level=3'
    );
    options.excludeSwitches('enable-logging');

    const service = new ServiceBuilder().addArguments('--log-level=OFF');

    sharedDriver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();
  }
  return sharedDriver;
}

/** Quit the shared driver (call in afterAll of the last spec). */
export async function quitDriver(): Promise<void> {
  if (sharedDriver) {
    await sharedDriver.quit();
    sharedDriver = null;
  }
}
