package day28;

import java.time.Duration;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class Staticwebtable {
	
	public static void main(String[] args) {
		
		WebDriver driver = new ChromeDriver();
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		driver.get("https://testautomationpractice.blogspot.com/");
		driver.manage().window().maximize();
		
		//find the total  no of rows in a table
		
		int rows=driver.findElements(By.xpath("//table[@name='BookTable']//tr")).size();//mutiple table
		//int rows=driver.findElements(By.tagName("tr")).size(); //single table
		
		//System.out.println(rows);
		
		//2)find the total no of column
		
		int cols=driver.findElements(By.xpath("//table[@name='BookTable']//th")).size();//mutiple table
		//int cols=driver.findElements(By.tagName("th")).size(); //single table
		
		//System.out.println(cols);
		
		//3)read data from spefic row and colm(5th row and 1st colm)
		
		//String bookname=driver.findElement(By.xpath("//*[@id=\"HTML1\"]/div[1]/table/tbody/tr[5]/td[1]")).getText();
		
		//System.out.println(bookname);//masterinselenium
		
	/*	//4(read data from the row and colm
		
		//1st row in th so we cant give simple write the header name
		
		String post=driver.findElement(By.xpath("//*[@id=\"HTML1\"]/div[1]/table/tbody/tr[1]")).getText();
		System.out.println(post);
		
		for(int r=2;r<=rows;r++)
		{
			for(int c=1;c<=cols;c++)
			{
				String value=driver.findElement(By.xpath("//table[@name='BookTable']//tr["+r+"]//td["+c+"]")).getText();
				System.out.println(value+"\t");
			}*/
		
			//5)print book name whose author is mukesh
			
			for(int r=2; r<=rows; r++)
			{
			    String authorname = driver.findElement(By.xpath("//table[@name='BookTable']//tr["+r+"]//td[2]")).getText();
			    
			    if(authorname.equals("Mukesh")) // No semicolon
			    { 
	String bookname=driver.findElement(By.xpath("//table[@name='BookTable']//tr["+r+"]//td[1]")).getText();
	System.out.println(bookname+"\t"+authorname);
	
			    }
			}}}
/*	//6) find total price of the books
int total=0;
	for(int r=2;r<=rows;r++)
	{
		String price=driver.findElement(By.xpath("//table[@name='BookTable']//tr["+r+"]//td[4]")).getText();
		System.out.println(price);
		
	total=total+Integer.parseInt(price);
	}
	System.out.println("total price of the book:"+total);*/
		
		
	
		
	
	

			
		




			
		
			
			
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	