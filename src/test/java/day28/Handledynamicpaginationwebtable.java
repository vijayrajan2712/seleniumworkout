package day28;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class Handledynamicpaginationwebtable {
	
	
	public static void main(String[] args) {
		
		WebDriver driver = new ChromeDriver();
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		driver.get("https://demo3x.opencartreports.com/admin/");
		driver.manage().window().maximize();
		
		WebElement username=driver.findElement(By.xpath("//*[@id=\"input-username\"]"));
		username.clear();
		username.sendKeys("demo");
		
		WebElement password=driver.findElement(By.xpath("//*[@id=\"input-password\"]"));
		password.clear();
		password.sendKeys("demo");
		
		driver.findElement(By.xpath("//button[normalize-space()='Login']")).click();
		
		//close the window if its avaliable
		//if(driver.findElement(By.xpath("//button[@class='btn_close"]")).isdisplayed();
		//		{
		//			driver.findElement(By.xpath("//button[@class='btn_close"]")).click();
		//		}
		
		
		driver.findElement(By.xpath("//*[@id=\"menu-customer\"]/a")).click();
		driver.findElement(By.xpath("//*[@id=\"collapse5\"]/li[1]/a")).click();
		
		//Showing 1 to 7 of 7 (1 Pages)
		String text=driver.findElement(By.xpath("//div[@class='col-sm-6 text-right']")).getText();
		
		//s.substring(s.indexof("(")+1,s.indexof("Pages")-1
				
				//string=text
				
	int totalpages=Integer.parseInt(text.substring(text.indexOf("(")+1,text.indexOf("Pages")-1));
		
	/*	//repeating pages
	for(int p=1;p<=totalpages;p++)
	{
		
		if(p>1)
		{
			
			WebElement active_page=driver.findElement(By.xpath("//ul[@class='pagination']//*[text()="+p+"]");
					active_page.click();
		}*/
	
		//reading the data from the table)
		
	int noofrows=driver.findElements(By.xpath("//table[@class='table table-bordered table-hover']//tbody//tr[1]//td[2]")).size();
		for(int r=1;r<=noofrows;r++)
		{
			String customername=driver.findElement(By.xpath("//table[@class='table table-bordered table-hover']//tbody//tr["+r+"]//td[2]")).getText();
			String emailid=driver.findElement(By.xpath("//table[@class='table table-bordered table-hover']//tbody//tr["+r+"]//td[3]")).getText();
		}
		
	}
}	
		
		
		
		
		
		
		/*driver.findElement(By.xpath("//*[@id=\"content\"]/div/div/div/div/div[2]/form/div[3]/button")).click();
		driver.findElement(By.xpath("//*[@id=\"menu-customer\"]/a")).click();
		driver.findElement(By.xpath("//*[@id=\"collapse5\"]/li[1]/a")).click();*/
		
		
	
		
		
		
		
		
	

		
		
		
		
