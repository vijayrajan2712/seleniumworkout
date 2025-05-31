package seleniumworkout;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class DAY21 {
    public static void main(String[] args) {

        WebDriver driver = new ChromeDriver();
        driver.get("https://rahulshettyacademy.com/");

        // Get and print actual title for debugging
        String act_title = driver.getTitle();
       // System.out.println("Actual Title: " + act_title);

        // Compare with expected title
        //if (act_title .trim().equals("Selenium, API Testing, Software Testing &amp; More QA Tutorials | Rahul Shetty Academy"))
        if (act_title.contains("Selenium, API Testing, Software Testing & More QA Tutorials | Rahul Shetty Academy")) {
            System.out.println("Passed");
        } else {
            System.out.println("Failed");
        }

        // Close browser
        driver.close();
    }
}




