package day28;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class Loginpage__POM {
	
	
	//constructor
	//locators
	//action methods
	
	 WebDriver driver;
	 
	//constructor
	 
	 Loginpage__POM(WebDriver driver)
	 {
		 this.driver=driver;	 
		 }
	//locators
	 
	 
	By usernameloc= By.xpath("//input[@placeholder='Username']");
    By passwordloc=By.xpath("//input[@placeholder='Password']");
    By btnlogin=By.xpath("//button[normalize-space()='Login']");

	//action method
    public void setusername(String user) {
		
    	driver.findElement(usernameloc).sendKeys(user);
    	
	}
 public void setpassword(String pwd) {
		
    	driver.findElement(passwordloc).sendKeys(pwd);
    	
	}
	
 public void clicklogin() {
		
 	driver.findElement(btnlogin).click();
 	
	}

}
