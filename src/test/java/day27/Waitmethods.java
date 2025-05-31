package day27;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class Waitmethods {
	public static void main(String[] args) throws InterruptedException {

		WebDriver driver = new ChromeDriver();
		
		//explicit wait declartion 
		
		WebDriverWait mywait = new WebDriverWait(driver,Duration.ofSeconds(10));
		
		
		//driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));

		driver.get("https://opensource-demo.orangehrmlive.com/web/index.php/auth/login");

		driver.manage().window().maximize();

		driver.findElement(By.xpath("//input[@placeholder='Username']")).sendKeys("Admin");
		
		//usage of explicit wait
		
		WebElement textusername = mywait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@placeholder='Username']")));
		textusername.sendKeys("admin");

		
		
		
	
		
		
		
		
		

	}

}
