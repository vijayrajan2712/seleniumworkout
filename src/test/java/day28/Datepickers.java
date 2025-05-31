package day28;

import java.time.Duration;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class Datepickers {

	public static void main(String[] args) {
		
	
	WebDriver driver = new ChromeDriver();
	driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
	driver.get("https://jqueryui.com/datepicker/");
	driver.manage().window().maximize(); 
	
	//switch to frame 
	driver.switchTo().frame(0);
	
	//1st method : using sendkeys
	//driver.findElement(By.xpath("//input[@id='datepicker']")).sendKeys("05/01/2025");
	
	//2nd method : using date picker
	//expected data
	String year="2025";
	String month="June";
	String date="20";
	
	driver.findElement(By.xpath("//input[@id='datepicker']")).click();//open the datepicker
	
	//select month and year
	
	while(true)
	{
		String currentmonth=driver.findElement(By.xpath("//span[@class='ui-datepicker-month']")).getText();
		String currentyear=driver.findElement(By.xpath("//span[@class='ui-datepicker-year']")).getText();
		
		if(currentmonth.equals(month) && currentyear.equals(year))
{
	break;	
}
	driver.findElement(By.xpath("//span[@class='ui-icon ui-icon-circle-triangle-e']")).click();//next
	//driver.findElement(By.xpath("//span[@class='ui-icon ui-icon-circle-triangle-w']")).click();//previous
	
	
	//select the date
	List<WebElement>alldates=driver.findElements(By.xpath("//table[@class='ui-datepicker-calendar']//tbody//td//a"));
	
	for(WebElement dt:alldates)
	{
		
		if(dt.getText().equals( date))
		{
			
			dt.click();
			break;
			
			
		}
		
		
		
		
	}
	
	
	
	
	
	
	}}}
		
		
	
	
	
	
	
	
	
	
	
	
	

