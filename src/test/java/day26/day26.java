package day26;

import java.util.Arrays;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class day26 {

	public static void main(String[] args) {

		WebDriver driver = new ChromeDriver();
	    System.setProperty("webdriver.chrome.driver","C:\\seleniumdrivers.exe");
	
	    
	    String[] itemsNeeded= {"Cucumber","Brocolli"};
	    driver.get("https://rahulshettyacademy.com/seleniumPractise/");
	    threadsleep(3000);
	    
	    List<WebElement> products=(List<WebElement>) driver.findElements(By.cssSelector("h4.product.name"));
	    
	    for(int i=0;i<products.size();i++)
	    	
	    {
	    	String[] name= products.get(i).getText().split("-");
	    String formattedName=name[0].trim(); 
	    	
	    	List itemsNeededList = Arrays.asList(itemsNeeded);
	    	int j=0;
	    	
	    	if(itemsNeededList.contains(formattedName))
	    	{
	    		j++;
	    		driver.findElements(By.xpath("//button[text()='ADD TO CART']")).get(i).click();
	    		
	    		if(j==3)
	    		{
	    			break;
	    		}
	    		
	    		
	    		
	    	}
	    }}

	private static void threadsleep(int i) {
		// TODO Auto-generated method stub
		
	}}
	