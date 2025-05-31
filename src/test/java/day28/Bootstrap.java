package day28;

import java.time.Duration;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;


public class Bootstrap {

	public static void main(String[] args) {

		WebDriver driver = new ChromeDriver();
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		driver.get("https://www.jquery-az.com/boots/demo.php?ex=63.0_2");
		driver.manage().window().maximize();

		driver.findElement(By.xpath("//span[@class='multiselect-selected-text']")).click();

		driver.findElement(By.xpath("/html/body/div[3]/table/tbody/tr[2]/td[3]/div/span/div/ul/li[4]/a/label")).click();
		driver.findElement(By.xpath("//input[@value='CSS']")).click();

		 //1)select single options
		driver.findElement(By.xpath("//input[@value='Java']")).click();

		// 2) capture all the options and findout size

		//List <WebElement>options = driver.findElements(By.xpath("//ul[contains(@class,'multiselect')]//label"));
		//System.out.println(options.size());

		 List <WebElement> options= driver.findElements(By.xpath("//ul[contains(@class,'multiselect')]//label"));
		System.out.println(options.size());
		
		 //3) printing options from the dropdown

		 for (WebElement op:options)
		 {
			 System.out.println(op.getText());
		 }
	//4)select mutiple option

		 for (WebElement op:options)
		 {
			 String option=op.getText();
			 
			 if (option.equals("java") || option.equals("python") || option.equals("Mysql")) {
				    op.click();
				}
		 }

				 
	 }}


