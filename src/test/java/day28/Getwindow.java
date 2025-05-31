package day28;

import java.time.Duration;
import java.util.Set;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class Getwindow {

    public static void main(String[] args) {
        
        WebDriver driver = new ChromeDriver();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        
        driver.get("https://testautomationpractice.blogspot.com/");
        driver.manage().window().maximize();
        
        // Get all window handles
        Set<String> windowIds = driver.getWindowHandles();

        for (String winID : windowIds) {
            String title = driver.switchTo().window(winID).getTitle();

            // Compare with actual page title, not URL
            if (title.equals("Selenium - Wikipedia")) { 
                System.out.println("Current URL: " + driver.getCurrentUrl());
                break;  // Exit loop after finding the correct window
            }
        } 

        // Cleanup actions
        driver.quit();
    }
}
