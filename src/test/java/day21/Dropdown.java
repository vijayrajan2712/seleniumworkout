package day21;

import static org.testng.Assert.assertTrue;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;

public class Dropdown {
	
	public static void main(String[] args) throws InterruptedException {
		
	WebDriver driver = new ChromeDriver();
	System.setProperty("webdriver.chrome.driver", "C:\\seleniumdrivers.exe");
	
	driver.get("https://rahulshettyacademy.com/dropdownsPractise/");
	
	Assert.assertFalse(driver.findElement(By.cssSelector("input[id*='ctl00_mainContent_chk_SeniorCitizenDiscount']")).isSelected());
	//Assert.assertFalse(true);
	System.out.println(driver.findElement(By.cssSelector("input[id*='ctl00_mainContent_chk_SeniorCitizenDiscount']")).isSelected());

	driver.findElement(By.cssSelector("input[id*='ctl00_mainContent_chk_SeniorCitizenDiscount']")).click();
	
	Assert.assertTrue(driver.findElement(By.cssSelector("input[id*='ctl00_mainContent_chk_SeniorCitizenDiscount']")).isSelected());
	
	System.out.println(driver.findElement(By.cssSelector("input[id*='ctl00_mainContent_chk_SeniorCitizenDiscount']")).isSelected());
	
	System.out.println(driver.findElements(By.cssSelector("input[type='checkbox']")).size());
	
	
	
	
	
	// ctl00_mainContent_ddl_originStation1_CTXT
	
	//
	
	 driver.findElement(By.id("ctl00_mainContent_ddl_originStation1_CTXT")).click();
	
	 driver.findElement(By.xpath("//a[@value='BLR']")).click();
     Thread.sleep(2000);
     driver.findElement(By.xpath("//div[@id='glsctl00_mainContent_ddl_destinationStation1_CTNR'] //a[@value='MAA']")).click();
	 //driver.findElement(By.id("autosuggest")).sendKeys("new");
	 Thread.sleep(3000);
     
/*List<WebElement> options = driver.findElements(By.cssSelector("li[class='ui-menu-item'] a"));
	 
	 for (WebElement option: options)
	 {
		 if(option.getText().equalsIgnoreCase("New Zealand"))
		 {
			 option.click();
			 break;
		 }
		 
	 }
	 */
	 
    // driver.findElement(By.cssSelector(".ui-state-default.ui-state-active")).click();
     //System.out.println(driver.findElement(By.name("ctl00$mainContent$view_date2")).isEnabled());
    // System.out.println(driver.findElement(By.id("Div1")).getDomAttribute("style").contains(""));

    // driver.findElement(By.id("ctl00_mainContent_rbtnl_Trip_1")).click();
    // System.out.println(driver.findElement(By.name("ctl00$mainContent$view_date2")).isEnabled());
     
     System.out.println(driver.findElement(By.id("Div1")).getDomAttribute("style"));
     driver.findElement(By.id("ctl00_mainContent_rbtnl_Trip_1")).click();
     System.out.println(driver.findElement(By.id("Div1")).getDomAttribute("style"));
     
     
    if(driver.findElement(By.id("Div1")).getDomAttribute("style").contains("0.5"))
     {
    	 System.out.println("its enabled");
    	 Assert.assertTrue(true);	 
     }
     else
     {
    	 Assert.assertTrue(false);
     }
	
	}}

