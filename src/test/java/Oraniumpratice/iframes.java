package Oraniumpratice;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class iframes {
		public static void main(String[] args) {
			WebDriver driver = BaseClass.browserSetUp("chrome");
			
			//switch using frame index
            driver.switchTo().frame(0);
			
			//switch using frame id
		//driver.switchTo().frame("frame_1.html");
			

			
			driver.findElement(By.xpath("//input[@name='mytext1']")).sendKeys("Automation");
		}

	}


