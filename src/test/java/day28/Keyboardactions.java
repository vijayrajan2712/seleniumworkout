package day28;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;

public class Keyboardactions {

	public static void main(String[] args) {
		
		WebDriver driver = new ChromeDriver();
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		driver.get("https://demo.nopcommerce.com/");
		driver.manage().window().maximize();
		
		WebElement reglink=driver.findElement(By.xpath("//a[normalize-space()='Register']"));
		
		Actions act=new Actions(driver);
		
		//reglink.click();
		
		//control + reglink
		
				act.keyDown(Keys.CONTROL).click(reglink).keyUp(Keys.CONTROL).perform();
		
		//swtich to registration page
		
		List<String> ids=new ArrayList(driver.getWindowHandles());
		
		//registration page
		driver.switchTo().window(ids.get(1));
		driver.findElement(By.xpath("//input[@id='FirstName']")).sendKeys("JOHN KENEDY");
		
		//HOME PAGE
		
		driver.switchTo().window(ids.get(0));
		driver.findElement(By.xpath("//input[@id='small-searchterms']")).sendKeys("Tshirt");
		
		//selenium new version switch cmd
		
		WebDriver driver1=new ChromeDriver();
		driver.get("https://www.opencart.com/");
		
		driver.switchTo().newWindow(WindowType.TAB);
		driver.get("https://orangehrm.com/");
		
		
		
		
		
		
		
	}

}
