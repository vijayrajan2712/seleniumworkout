package day26;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class Oraniumpractice {
	
	public static void main(String[] args) {
		WebDriver driver=new ChromeDriver();
		driver.get("https://testautomationpractice.blogspot.com/");
		driver.manage().window().maximize();
		
		driver.findElement(By.id("name")).sendKeys("vinothan");
		driver.findElement(By.xpath("//input[@id='email']")).sendKeys("vinothan@gmail.com");
		driver.findElement(By.xpath("//input[@id='phone']")).sendKeys("9445440000");
		driver.findElement(By.xpath("//input[@id='male']")).click();
		
		driver.findElement(By.xpath("//input[@id='monday']")).click();
		//driver.findElement(By.xpath("//select[@id='country']))
		
		driver.findElement(By.xpath("//select[@id='colors']//option[1]")).click();
		driver.findElement(By.xpath("//option[@value='dog']")).click();
		

		


		
		
		
		
		
	}

}
