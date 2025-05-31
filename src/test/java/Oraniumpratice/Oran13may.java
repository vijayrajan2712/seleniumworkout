package Oraniumpratice;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class Oran13may {
	
	public static void main(String[] args) {
		
		WebDriver driver =new ChromeDriver();
		driver.get("https://testautomationpractice.blogspot.com/");
		driver.get("https://rahulshettyacademy.com/");
		driver.manage().window().maximize();

		
		/*String url = driver.getCurrentUrl();
		 * 
		System.out.println(url);
		
		String title = driver.getTitle();
		System.out.println(title);
		
		String Source = driver.getPageSource();
		System.out.println(Source);*/
		
		
		/*//isDisplayed
		
		boolean name = driver.findElement(By.xpath("//input[@id='name']")).isDisplayed();
		System.out.println(name);
		
		//isEnabled
		
		boolean phone =driver.findElement(By.xpath("//input[@id='phone']")).isEnabled();
		System.out.println(phone);
		
		//isSelected
		
		driver.findElement(By.xpath("//input[@id='male']")).click();
		boolean male = driver.findElement(By.xpath("//input[@id='male']")).isSelected();
		System.out.println(male);
		*/
		
		driver.close();
		driver.quit();
		
		
	}

}
