package day21;

import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.WebDriver;

public class Firsttestcase {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		
		//ChromeDriver driver = new ChromeDriver();
		WebDriver driver =  new ChromeDriver();
		driver.get("https://demo.opencart.com/");

		String act_title = driver.getTitle();
		
		if(act_title.equals("OpenCart - Open Source Shopping Cart Solution"))
		{
			System.out.println("Passed");
		}
		else
		{
			System.out.println("failed");
		}
		driver.close();
				
	}	
	}
// day 22







