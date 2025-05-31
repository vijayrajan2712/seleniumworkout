package pavanworkouts;

import java.time.Duration;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;

public class Pavanworkouts {
	
	public static void main(String[] args) {
		
	
	WebDriver driver = new ChromeDriver();
	driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
	driver.get("https://phppot.com/demo/jquery-dependent-dropdown-list-countries-and-states/");
	driver.manage().window().maximize();
	
	
	driver.findElement(By.xpath("//*[@id=\"country-list\"]")).click();
	List<WebElement> drpcountry = driver.findElements(By.xpath("//select[@id='country-list']//option"));
System.out.println(drpcountry.size());

//enchanced for loop
		for(WebElement op:drpcountry)
		{
			System.out.println(op.getText());
		
		
		}

}
}