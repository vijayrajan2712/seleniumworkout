package day22;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import java.time.Duration;

public class Locatorsdemo {
    
    public static void main(String[] args) {
       
        WebDriver driver = new ChromeDriver();
        driver.get("https://rahulshettyacademy.com/");
        driver.findElement(By.linkText("")).click();
        driver.quit();
    }
}
