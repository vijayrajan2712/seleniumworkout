package day28;

import java.net.MalformedURLException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class day28 {
	public static void main(String[] args) throws MalformedURLException {
		WebDriver driver = new ChromeDriver();
		//driver.get("https://rahulshettyacademy.com/seleniumPractise/#/");
		
		driver.navigate().to("https://rahulshettyacademy.com/seleniumPractise/#/");
	
		driver.navigate().to("https://rahulshettyacademy.com/practice-project");
		
		driver.navigate().back();
		System.out.println(driver.getCurrentUrl());
		
		driver.navigate().forward();
		System.out.println(driver.getCurrentUrl());
		
		driver.navigate().refresh();
		
		
	}

}
