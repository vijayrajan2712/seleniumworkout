package day21;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class P1 {

	public static void main(String[] args) {
		
		WebDriver driver = new ChromeDriver();
		driver.get("https://demo.nopcommerce.com/");
		
		
		String actualtitle = driver.getTitle();
		
		if (actualtitle.equals("nopCommerce demo store"))
		{
			System.out.println("passed");
		}
		else			
		{
			System.out.println("failed");
	}
		driver.close();
}
}
   
