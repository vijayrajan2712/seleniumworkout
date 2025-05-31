package day26;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class Condition {

	public static void main(String[] args) {

		WebDriver driver = new ChromeDriver();
		//driver.get("https://demo.nopcommerce.com/");
		driver.get("https://demo.nopcommerce.com/register?returnUrl=%2F");
		driver.manage().window().maximize();

		// isdisplayed

		//WebElement logo = driver.findElement(By.xpath("//img[@alt='nopCommerce demo store']"));

		//System.out.println(logo.isDisplayed());

		//boolean status = driver.findElement(By.xpath("//img[@alt='nopCommerce demo store']")).isDisplayed();
		//System.out.println(status);

		//isEnabled
		
		//boolean status1 = driver.findElement(By.xpath("//input[@id='FirstName']")).isEnabled();
		//System.out.println(status1);
		
		
		//isSelected
		
		//boolean status=driver.findElement(By.xpath("//input[@id='Newsletter']")).isSelected();
		//System.out.println(status);
		
		
		boolean male = driver.findElement(By.xpath("//input[@id='gender-male']")).isSelected();
		System.out.println(male);
		
		driver.findElement(By.xpath("//input[@id='gender-male']")).click();
		
		
		boolean male1 = driver.findElement(By.xpath("//input[@id='gender-male']")).isSelected();
		System.out.println(male1);
		
		
		
		
	}

}
