package day28;

import java.time.Duration;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class Handlecheckboxradialbutton {
	public static void main(String[] args) {

		WebDriver driver = new ChromeDriver();
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		driver.get("https://testautomationpractice.blogspot.com/");
		driver.manage().window().maximize();
		// 1)select check box
		// driver.findElement(By.xpath("//input[@id='sunday']")).click();

		// boolean checkbox =
		// driver.findElement(By.xpath("//input[@id='sunday']")).isSelected();

		// System.out.println(checkbox);

		// 2) how many check box there

		List<WebElement> checkbox1 = driver
				.findElements(By.xpath("//input[@class='form-check-input'and@type='checkbox']"));
		System.out.println(checkbox1.size());

	/*	// 3)selecting all checkbox
		for (int i = 0; i < checkbox1.size(); i++) {
			checkbox1.get(i).click();
		}
		for (WebElement checkbox : checkbox1) {
			checkbox.click();

		}

		// 4) select last 3 checkboxes
        //total no of checkboxes-how many check box do you want to select=starting index
        //7-3=4
		for(int i=4; i<checkbox1.size();i++)
		{
			checkbox1.get(i).click();
			
		}
		//5) select 1st 3 check boxes
		
for(int i=0;i<3;i++)
{
	checkboxes.get(i).click();
}
		
		//6) select/unselect checkboxes

for(WebElement chkbox:checkboxes)
{
	if(chkbox.isSelected())
	{
		chkbox.click();  //unselect
	}
	else
	{
		chkbox.click();  //select
	}
	//7)select/unselect checkboxes
	for(WebElement chkbox:checkboxes)
	{
		if(chkbox.isSelected())
		{
			chkbox.click();  //unselect
		}
		else
		{
			chkbox.click();  //select
		}*/
		//8) select specific check boxes 
      for(int i=0; i<checkbox1.size();i++)
      {
    	  if(i==1 || i==3 || i==6)
    	  {
    		  checkbox1.get(i).click();
    	  }
    		
    	  String weekname="sunday";
    	  
    	  switch(weekname)
    	  {
    	  case"sunday" : driver.findElement(By.xpath("//input[@id='sunday']")).click();
    	         break;  
    	  case "monday":
    		    driver.findElement(By.xpath("//input[@id='monday']")).click();
    		    break;
    		case "tuesday":
    		    driver.findElement(By.xpath("//input[@id='tuesday']")).click();
    		    break;
    		case "wednesday":
    		    driver.findElement(By.xpath("//input[@id='wednesday']")).click();
    		    break;
    		case "thursday":
    		    driver.findElement(By.xpath("//input[@id='thursday']")).click();
    		    break;
    		case "friday":
    		    driver.findElement(By.xpath("//input[@id='friday']")).click();
    		    break;
    		case "saturday":
    		    driver.findElement(By.xpath("//input[@id='saturday']")).click();
    		    break;
    		 default :System.out.println("invalid week name");
    			  
    			  
    			  
    			  
    			  
    			  
    			  
    			  
    			  
    			  
    			  
    			  
    			  
    			  
    			  
    			  
    	  }
    	  
      }

		
	}
}