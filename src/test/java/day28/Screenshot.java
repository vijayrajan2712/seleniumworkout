package day28;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class Screenshot {
	
	 
		public static void main(String[] args) throws IOException { 
		
		WebDriver driver = new ChromeDriver(); 
		driver.get("https://demo.nopcommerce.com/"); 
		//driver.findElement(By.xpath("//input[@id='small-searchterms']"));
		
		TakesScreenshot tk=(TakesScreenshot) driver; 
		File source= tk.getScreenshotAs(OutputType.FILE); 
		File des=new File("./snaps/img.png"); 
		FileUtils.copyFile(source,des ); 
		driver.quit();

}
}