package testng;

import org.testng.Assert;
import org.testng.annotations.Test;

public class Asseration {

    @Test
    void testtitle() {
        String expectedTitle = "openshop";  // Update if this is correct
        String actualTitle = "openshop";  // Ensure this is dynamically fetched

        // Directly use TestNG assertion
        Assert.assertEquals(actualTitle, expectedTitle, "Page title mismatch!");

        System.out.println("Test Passed: Titles match.");
    }
}
