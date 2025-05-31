package Oraniumpratice;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

public class BaseClass {
		
		public static WebDriver browserSetUp(String browserName)
		{
			WebDriver driver = null;
		switch(browserName)
		{
		case "chrome":
			driver = new ChromeDriver();
			driver.get("https://ui.vision/demo/webtest/frames/");
			driver.manage().window().maximize();
			break;
		case "edge":
			
			driver = new EdgeDriver();
			driver.get("https://ui.vision/demo/webtest/frames/");
			driver.manage().window().maximize();
			break;
			
	case "Firefox":
			
			driver = new FirefoxDriver();
			driver.get("https://ui.vision/demo/webtest/frames/");
			driver.manage().window().maximize();
			break;
			
			default:
			{
				System.out.println("Provide a valid browserName");
			}
			
			
		}
		return driver;
		}

	}
