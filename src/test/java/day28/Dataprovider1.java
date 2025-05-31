package day28;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.*;

public class Dataprovider1 {

	WebDriver driver;

	@BeforeTest
	void setup() {
		driver = new ChromeDriver();
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		driver.manage().window().maximize();
	}

	@Test(dataProvider = "dp")
	void testlogin(String email, String pwd) throws InterruptedException {
		driver.get("https://tutorialsninja.com/demo/index.php?route=account/login");

		driver.findElement(By.xpath("//input[@id='input-email']")).sendKeys(email);
		driver.findElement(By.xpath("//input[@id='input-password']")).sendKeys(pwd);
		driver.findElement(By.xpath("//input[@value='Login']")).click();

		boolean status = driver.findElement(By.xpath("//h2[normalize-space()='My Account']")).isDisplayed();

		if (status) {
			driver.findElement(By.xpath("//a[@class='list-group-item'][normalize-space()='Logout']")).click();
			Assert.assertTrue(true);
		} else {
			Assert.fail();
		}
	}

	@AfterClass
	void teardown() {
		driver.quit();
	}

	@DataProvider(name = "dp", indices = { 0, 1 })
	Object[][] loginData() {
		return new Object[][] { { "abc@gmail.com", "test123" }, { "xyz@gmail.com", "test012" },
				{ "john@gmail.com", "test@123" }, { "pavanol123@gmail.com", "test@123" },
				{ "johncanedy@gmail.com", "test" } };
	}
}
