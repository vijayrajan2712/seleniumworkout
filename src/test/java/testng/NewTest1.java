package testng;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.Test;

public class NewTest1 {

	WebDriver driver;

	@Test(priority = 1)
	void openapp() {
		// driver=newChromeDriver();
		driver = new ChromeDriver();
		
		driver.get("https://demo.nopcommerce.com/");
		driver.manage().window().maximize();
	}

	@Test(priority = 2)
	void username() throws InterruptedException

	{
		Thread.sleep(5000);
		driver.findElement(By.xpath("//input[@id='small-searchterms']")).sendKeys("WELCOME");

	}
}