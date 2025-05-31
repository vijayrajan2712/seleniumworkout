package day28;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class Fileupload {

	public static void main(String[] args) {

		WebDriver driver = new ChromeDriver();
		driver.get("https://davidwalsh.name/demo/multiple-file-upload.php");
		driver.manage().window().maximize();
		// driver.manage().window().minimize();

		// single file upload

		driver.findElement(By.xpath("//input[@id='filesToUpload']")).sendKeys("C:\\vj\\data");

		if (driver.findElement(By.xpath("//li[normalize-space()='data.xlsx']")).getText().equals("data"))

		{
			System.out.println("file is sucessfully uploaded");

		} else {

			System.out.println(" upload fail");

		}

	}
}