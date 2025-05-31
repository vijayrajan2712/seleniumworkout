package day23;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class Day23 {

	
	     //CSS LOCATORS
	public static void main(String[] args) {
		// TODO Auto-generated method stub

		WebDriver driver = new ChromeDriver();
		
		driver.get("https://demo.nopcommerce.com/");
		driver.manage().window().maximize();
		
		
		//Tag_id
		//driver.findElement(By.cssSelector("input#small-searchterms")).sendKeys("T-shirt");
		
		//driver.findElement(By.cssSelector("#small-searchterms")).sendKeys("T-shirt");
		
		//Tag_classname  tag.classname
		
		//driver.findElement(By.cssSelector("input.search-box-text ")).sendKeys("T-shirt");
		
		
		//tag attribute tag[attribute="value"]
		//driver.findElement(By.cssSelector("input[placeholder='Search store']")).sendKeys("T-shirt");
		
		//tag class attribute tag.classname[attribute="value"]
		
		driver.findElement(By.cssSelector("input.search-box-text[name='q']")).sendKeys("T-shirt");
		
		
		
	}

}
