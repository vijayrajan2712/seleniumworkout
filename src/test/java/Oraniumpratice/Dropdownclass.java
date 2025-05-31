package Oraniumpratice;

import java.time.Duration;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;

public class Dropdownclass {
	public static void main(String[] args) {
	
	WebDriver driver = new ChromeDriver();
	driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
	driver.get("https://letcode.in/dropdowns");
	driver.manage().window().maximize(); 

	/*WebElement singleDropd =driver.findElement(By.id("fruits"));
	
	Select s=new Select(singleDropd);
	
	// three method to find out the value
	s.selectByIndex(3);
	s.selectByValue("2");
	s.selectByVisibleText("Orange");
	
	List<WebElement>options=s.getOptions();     //getoption return list of webelement
	System.out.println(options.size());
	
	//enchanced for loop
	for(WebElement opt:options)
	{
		//System.out.println(opt);
		System.out.println(opt.getText());
		
	}*/
	
	//mutiple dropdown
	
	WebElement mutliDrop=driver.findElement(By.id("superheros"));
	
	Select s=new Select(mutliDrop);
	// three method to find out the value
		s.selectByIndex(3);
		s.selectByValue("im");
		s.selectByVisibleText("Captain America");
	    s.selectByVisibleText("Spider-Man");
	    
	    s.deselectByIndex(6);
	    
		List<WebElement>allSelectedOptions=s.getAllSelectedOptions();     //getoption return list of webelement
	for(WebElement optsel:allSelectedOptions)
	{
		System.out.println(optsel.getText());
	}
	}
	
}	
	

