package day24;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class Xpath_basic {

	public static void main(String[] args) {

		WebDriver driver = new ChromeDriver();
		driver.get("https://rahulshettyacademy.com/seleniumPractise/#/");
		driver.manage().window().maximize();

		// Xpath with single attribute

		// driver.findElement(By.xpath("//input[@placeholder='Search for Vegetables and
		// Fruits']")).sendKeys("carrot");

		// Xpath with mutiple attribute

		// driver.findElement(By.xpath("//input[@placeholder='Search for Vegetables and
		// Fruits'][@class='search-keyword']")).sendKeys("apple");

		// driver.findElement(By.xpath("))"

		// xpath with AND , OR operators

		// driver.findElement(By.xpath("//input[@placeholder='Search for Vegetables and
		// Fruits'and class='search-keyword']")).sendKeys("apple");
		// driver.findElement(By.xpath("//input[@placeholder='Search for Vegetables or
		// Fruits'and class='search-keyword']")).sendKeys("apple");

		// xpath with text()

		// driver.findElement(By.xpath("//*[text()='Flight Booking']")).click();

		/*boolean displaystatus = driver.findElement(By.xpath("//*[text()='Flight Booking']")).isDisplayed();
		System.out.println(displaystatus);

		String value = driver.findElement(By.xpath("//*[text()='Flight Booking']")).getText();
		System.out.println(value);*/
		
		//xpath with contains()
		
		//driver.findElement(By.xpath("//input[contains(@placeholder,'Sea')]")).sendKeys("beetroot");

		driver.findElement(By.xpath("//input[starts-with(@placeholder,'Sea')]")).sendKeys("beetroot");

		
		
	}

}
