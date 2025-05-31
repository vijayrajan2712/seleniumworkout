package day28;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class Radiobutton {

	public static void main(String[] args) {

		WebDriver driver = new ChromeDriver();
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		driver.get("https://testautomationpractice.blogspot.com/");
		driver.manage().window().maximize();

		// WebElement
		// male_rd=driver.findElement(By.xpath("//input[@id='male']")).isSelected();
		// WeBElement
		// female_rd=driver.findElement(By.xpath("///input[@id='female']")).isSelected();

		boolean male_rb = driver.findElement(By.xpath("//input[@id='male']")).isSelected();

		System.out.println(male_rb);

		driver.findElement(By.xpath("//input[@id='male']")).click();
		
		boolean male_rb1 = driver.findElement(By.xpath("//input[@id='male']")).isSelected();
		
		System.out.println(male_rb1);

	}
}