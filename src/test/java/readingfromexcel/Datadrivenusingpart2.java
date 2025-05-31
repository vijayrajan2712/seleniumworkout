package readingfromexcel;

import java.io.IOException;
import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;

public class Datadrivenusingpart2 {
	
	public static void main(String[] args) throws IOException, InterruptedException {
		
		//fd calculator
		
		WebDriver driver=new ChromeDriver();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(20));
		driver.get("https://www.moneycontrol.com/fixed-income/calculator/state-bank-of-india-sbi/fixed-deposit-calculator-SBI-BSB001.html");
		driver.manage().window().maximize();
		driver.findElement(By.xpath("//*[@id=\"wzrk-cancel\"]")).click();
		String filepath=(System.getProperty("user.dif")+"\\caldata\\caldata.xlsx");
		
	int rows=Utils.getRowCount(filepath, "sheet1");
	
		for(int  i=1;i<=rows;
				i++)
		{
			String pric=Utils.getCellData(filepath, "sheet1", i, 0);
			String rateofinterest=Utils.getCellData(filepath, "sheet1", i, 1);
			String per1=Utils.getCellData(filepath, "sheet1", i, 2);
			String per2=Utils.getCellData(filepath, "sheet1", i, 3);
			String fre=Utils.getCellData(filepath, "sheet1", i, 4);
			String expmvalue=Utils.getCellData(filepath, "sheet1", i, 5);
			
		//2) pass above data into application
			
			driver.findElement(By.xpath("//input[@id='principal']")).sendKeys(pric);
			driver.findElement(By.xpath("//input[@id='interest']")).sendKeys(rateofinterest);
			driver.findElement(By.xpath("//input[@id='tenure']")).sendKeys(per1);
		
		//dropdown so we use select
			
			Select perdp=new Select(driver.findElement(By.xpath("//select[@id='tenurePeriod']")));
			perdp.selectByVisibleText(per2);
			
			Select fredp=new Select(driver.findElement(By.xpath("//select[@id='frequency']")));
			perdp.selectByVisibleText(fre);
			
			driver.findElement(By.xpath("//img[@src='https://images.moneycontrol.com/images/mf_revamp/btn_calcutate.gif']")).click();
			
			
			//validation
			String act_mvalue=driver.findElement(By.xpath("//span[@id='resp_matval']//strong")).getText();
			
			
			if(Double.parseDouble(expmvalue)==Double.parseDouble(act_mvalue))
			{
				
				System.out.println("testpassed");
				Utils.setCellData(filepath, "sheet1", i, 7, "passed");
				Utils.fillRedColor(filepath, "sheet1", i, 7);
			}
			else
			{
				System.out.println("testfailed");
				Utils.setCellData(filepath, "sheet1", i, 7, "failed");
				Utils.fillRedColor(filepath, "sheet1", i, 7);
			}
				Thread.sleep(3000);
				driver.findElement(By.xpath("//img[@class='PL5']")).click();
				
				
		}//ending of for loop
			
		driver.quit();
				
				
			}
	
	}

