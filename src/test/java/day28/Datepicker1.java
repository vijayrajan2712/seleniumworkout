package day28;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class Datepicker1 {
	
	public static void main(String[] args) {
	
	WebDriver driver = new ChromeDriver();
	driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
	driver.get("https://demo.automationtesting.in/Datepicker.html");
	driver.manage().window().maximize(); 
	
	//input DOB
	String requiredyear = "2027";
    String requiredmonth = "May";
	String requireddate  = "25";
	
	driver.findElement(By.xpath("//img[@class='imgdp']")).click();

	
	//selectyear
	/*WebElement yeardropdown=driver.findElement(By.xpath("//div[@id='ui-datepicker-div']//td"));
	Select selectyear=new Select(yeardropdown);
	selectyear.selectByVisibleText(requiredyear);*/
	
	while(true)
	{
		String currentmonth=driver.findElement(By.xpath("//span[@class='ui-datepicker-month']")).getText();
		String currentyear=driver.findElement(By.xpath("//span[@class='ui-datepicker-year']")).getText();
		
		if(currentmonth.equals(requiredmonth) && currentyear.equals(requiredyear))
{
	break;	
}
	driver.findElement(By.xpath("//span[@class='ui-icon ui-icon-circle-triangle-e']")).click();//next
	//driver.findElement(By.xpath("//span[@class='ui-icon ui-icon-circle-triangle-w']")).click();//previous
	

}
}}