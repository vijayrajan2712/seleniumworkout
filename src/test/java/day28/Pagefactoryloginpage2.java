package day28;

import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class Pagefactoryloginpage2 {
	
	 WebDriver driver;
	 
		//constructor
		 
	 Pagefactoryloginpage2(WebDriver driver)
		 {
			 this.driver=driver;
			 PageFactory.initElements(driver, this);
			 }

	 
	//locators
	 
	 
		@FindBy(xpath="//input[@placeholder='Username']")
		WebElement usernameloc;
		
		@FindBy(xpath="//input[@placeholder='Password']")
		 WebElement   passwordloc;
		
		@FindBy(xpath="//button[normalize-space()='Login']")
		WebElement btnlogin;
		
		
		@FindBy(tagName="a")
		List<WebElement> links;
	    
	    //action method
		  public void setusername(String user) {
				
		    	usernameloc.sendKeys(user);
		    	
			}
		 public void setpassword(String pwd) {
				
		    	passwordloc.sendKeys(pwd);
		    	
			}
			
		 public void clicklogin() {
				
		         btnlogin.click();
		 	
			}    
	    
}
