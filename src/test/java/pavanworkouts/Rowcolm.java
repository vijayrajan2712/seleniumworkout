package pavanworkouts;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class Rowcolm {
	
	public static void main(String[] args) {
		
		WebDriver driver = new ChromeDriver();
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		driver.get("https://practice.expandtesting.com/tables");
		driver.manage().window().maximize();
		
		//total no rows
		int rows=driver.findElements(By.xpath("//table[@id='table1']//tbody//tr")).size();
		
		System.out.println("total no of rows:"+rows);
		
		//total no of colmn
       int cols=driver.findElements(By.xpath("//table[@id='table1']//th")).size();
		
		System.out.println("total no of columns:"+cols);
		
		//select particular table data
		
		String name=driver.findElement(By.xpath("//table[@id='table1']//tr[2]//td[2]")).getText();
		
		System.out.println(name);
		
		//retrive all data
		
		for(int r=1;r<rows;r++)
		{
			for(int c=1;c<cols;c++) {
				String data=driver.findElement(By.xpath("//table[@id='table1']//tr["+r+"]//td["+c+"]")).getText();
				System.out.print(data);
			//print release date and version of java
				
				
				
				for(r=1;r<=rows;r++)
				{
					String lang=driver.findElement(By.xpath("//table[@id='table1']//tr["+r+"]//td[1]")).getText();
					if (lang.equals("conway"));
					{
						String version=driver.findElement(By.xpath("//table[@id='table1']//tr["+r+"]//td[2]")).getText();
						String mail=driver.findElement(By.xpath("//table[@id='table1']//tr["+r+"]//td[3]")).getText();
						System.out.println(version+"    "+mail);
						
						
					}
				}
				//convay mail id   //table[@id='table1']//tr[4]//td[3]
		
				//table[@id='table1']//tr[4]//td[2]
		
	}
	}
	}
}


