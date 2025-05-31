package day28;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class Handleuploadscroll {
	
	
	public static void main(String[] args) {
		
		WebDriver driver=new ChromeDriver();
		//ChromeDriver driver =new ChromeDriver();    //alternative for sendkeys 
		
		driver.get("https://demo.nopcommerce.com/");
		driver.manage().window().maximize();
		
		//WebElement inputbox=driver.findElement(By.xpath("//input[@id='name']"));
		
		
		JavascriptExecutor js=(JavascriptExecutor)driver;
		//JavascriptExecutor js=driver;
		
	//	js.executeScript("arguments[0].setAttribute('value','john')",inputbox);
		
		
		//clicking on element alternative of click()
		//WebElement radiobtn=driver.findElement(By.xpath("//input[@id='male']"));
	//	js.executeScript("arguments[0].click()",radiobtn);
		
		
		//1) scroll down page by pixel number

         js.executeScript("window.scrollBy(0,1500)","");
         System.out.println(js.executeScript("return window.pageYOffset;"));
         
         //2)scroll the page till element is visible
         
         
         WebElement comm=driver.findElement(By.xpath("//strong[normalize-space()='Community poll']"));
         js.executeScript("arguments[0].scrollIntoView();",comm);
		System.out.println(js.executeScript("return window.pageYOffset;"));
		
		//3) scroll page till end of the page 
		
		js.executeScript("window.scrollby(0,document.body.scrollheight)");
		
		System.out.println(js.executeScript("return window.pageYOffset;"));
		
		//scrolling upto initial position
		js.executeScript("window.scrollby(0,-document.body.scrollHeight)");
		
		
		
		
		
		
		
		
		
		
		
		
		
	}

}
