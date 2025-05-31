package day28;

import java.time.Duration;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;

public class Handledifferentdropdown {

	public static void main(String[] args) {

		WebDriver driver = new ChromeDriver();
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		driver.get("https://testautomationpractice.blogspot.com/");
		driver.manage().window().maximize();

		WebElement drpcountry = driver.findElement(By.xpath("//*[@id=\"country\"]"));
		Select drpcountry1 = new Select(drpcountry);

		// select option from the drop down

		// drpcountry1.selectByVisibleText("canada");
		// or
	//	drpcountry1.selectByValue("japan");
		// or
//capture the options from the dropdown
		
		List<WebElement>options=drpcountry1.getOptions();
		System.out.println(options.size());

		//printing the options
		/*for(int i=0;i<options.size();i++)
		{
		
			System.out.println(options.get(i).getText());
		}*/
		
		//enchanced for loop
		for(WebElement op:options)
		{
			System.out.println(op.getText());
		
		
		}
		
	}
}
