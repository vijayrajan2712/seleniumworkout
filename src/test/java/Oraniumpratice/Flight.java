package Oraniumpratice;



import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
public class Flight {
	
	    public static void main(String[] args) {
	        // Set the path to the chromedriver executable
	      //  System.setProperty("webdriver.chrome.driver", "path/to/chromedriver");

	        // Initialize the WebDriver
	        WebDriver driver = new ChromeDriver();
			driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
			driver.get("https://www.blazedemo.com/reserve.php");
			driver.manage().window().maximize();
			

	        // Navigate to the webpage containing the flight table
	      //  driver.get("https://www.blazedemo.com/reserve.php");

	        // Find the button for the lowest-priced flight and click it
	        WebElement chooseFlight= driver.findElement(By.xpath("/html/body/div[2]/table/tbody/tr[3]/td[6]"));
	        driver.findElement(By.xpath("/html/body/div[2]/table/tbody/tr[3]/td[1]/input")).click();

	        // Close the browser
	        //driver.quit();
	    }
	}



