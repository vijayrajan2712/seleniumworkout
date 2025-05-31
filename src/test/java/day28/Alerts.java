package day28;

import java.time.Duration;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class Alerts {
	
	public static void main(String[] args) throws InterruptedException {
		
		WebDriver driver = new ChromeDriver();
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		driver.get("https://the-internet.herokuapp.com/javascript_alerts");
		driver.manage().window().maximize();
		
		//1)normal alert with ok button
		
		//driver.findElement(By.xpath("//button[normalize-space()='Click for JS Alert']")).click();
		//Thread.sleep(5000);
		
		//Alert myalert=driver.switchTo().alert();
		//myalert.accept();
		
		//or
		
		//driver.switchTo().alert().accept();
		
		//2) confirmation alert -ok or cancel
		//driver.findElement(By.xpath("//button[normalize-space()='Click for JS Confirm']")).click();
		//Thread.sleep(5000);
		
		//driver.switchTo().alert().accept(); //close alert
		//driver.switchTo().alert().dismiss();
		
		//3) promt alert -input box
		
		driver.findElement(By.xpath("//button[normalize-space()='Click for JS Prompt']")).click();
		Thread.sleep(5000);
		
		Alert myalert=driver.switchTo().alert();
		
		System.out.println("Text msg on alert:"+myalert.getText());
		myalert.sendKeys("john");
		myalert.accept();
		
		String res=driver.findElement(By.xpath("//p[@id='result']")).getText();
		
		if(res.contains("john"))
		{
			System.out.println("testpassed");
		}
		else
		{
			System.out.println("testfailed");
		}
		
		
		
		
		
		
		
	}

}
