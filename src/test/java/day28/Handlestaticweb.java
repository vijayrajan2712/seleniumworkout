package day28;

import java.time.Duration;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class Handlestaticweb {
    
    public static void main(String[] args) throws InterruptedException {
        
        WebDriver driver = new ChromeDriver();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        driver.get("https://www.google.com/");
        driver.manage().window().maximize();
        
        driver.findElement(By.xpath("//textarea[@id='APjFqb']")).sendKeys("selenium");
        Thread.sleep(5000);
        
        List<WebElement> list = driver.findElements(By.xpath("//div[@role='option']"));
        
        System.out.println("Total options: " + list.size());

        boolean found = false; // Flag to indicate when the correct option is clicked

        for (WebElement option : list) {
            System.out.println(option.getText());

            if (option.getText().equals("selenium")) {
                option.click();
                found = true;
                break; // Exit loop once the correct option is clicked
            }
        }

        if (!found) {
            System.out.println("Option 'selenium' not found in the suggestions.");
        }

        // Perform additional actions or close the driver if needed
        // driver.quit();
    }
}
