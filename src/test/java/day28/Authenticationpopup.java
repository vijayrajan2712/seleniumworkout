package day28;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class Authenticationpopup {
	
	public static void main(String[] args) {
		
		WebDriver driver = new ChromeDriver();
		//WebDriverWait mywait=new 	WebDriverWait(driver,Duration.ofSeconds(10));
		//driver.get("https://the-internet.herokuapp.com/basic_auth");
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		driver.get("https://ui.vision/demo/webtest/frames/");
		driver.manage().window().maximize();
		//frame1
		WebElement Frame1=driver.findElement(By.xpath("/html/frameset/frame[1]"));
		driver.switchTo().frame(Frame1);
		driver.findElement(By.xpath("//input[@name='mytext1']")).sendKeys("welcome");
		driver.switchTo().defaultContent();
		//frame2
		WebElement Frame2=driver.findElement(By.xpath("/html/frameset/frameset/frame[1]"));
		driver.switchTo().frame(Frame2);
		driver.findElement(By.xpath("//input[@name='mytext2']")).sendKeys("Automation");
		driver.switchTo().defaultContent();
		//frame3
		WebElement Frame3=driver.findElement(By.xpath("/html/frameset/frameset/frame[2]"));
		driver.switchTo().frame(Frame3);
		driver.findElement(By.xpath("//*[@id=\"id3\"]/div/input")).sendKeys("programming");
		driver.switchTo().defaultContent();
		//frame4
		WebElement Frame4=driver.findElement(By.xpath("/html/frameset/frameset/frame[3]"));
		driver.switchTo().frame(Frame4);
		driver.findElement(By.xpath("//*[@id=\"id4\"]/div/input")).sendKeys("values");
		driver.switchTo().defaultContent();
		
		//inner frame
		
		
		
		
		
	}

}
