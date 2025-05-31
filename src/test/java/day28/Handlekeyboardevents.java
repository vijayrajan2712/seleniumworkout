package day28;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;

public class Handlekeyboardevents {
	public static void main(String[] args) {
		WebDriver driver = new ChromeDriver();
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		driver.get("https://www.jqueryscript.net/demo/Price-Range-Slider-jQuery-UI/");
		driver.manage().window().maximize();
		
		//minimum side
		
		Actions act=new Actions(driver);
		
		WebElement minslide=driver.findElement(By.xpath("//div[@id='slider-range']//span[1]"));
		
		System.out.println("location min slide before moving:"+minslide.getLocation());
		
		act.dragAndDropBy(minslide,100, 249).perform();
		
		System.out.println("location of emin after moving:"+minslide.getLocation());
		
		//max slide
			
		WebElement maxslide=driver.findElement(By.cssSelector("ui-slider-handle ui-corner-all ui-state-default"));
		
        System.out.println("location max slide before moving:"+maxslide.getLocation());
		
		act.dragAndDropBy(maxslide,-100, 249).perform();
		
		System.out.println("location of max after moving:"+maxslide.getLocation());
		
		
		
		
		
		
		
		
	}
	

}
