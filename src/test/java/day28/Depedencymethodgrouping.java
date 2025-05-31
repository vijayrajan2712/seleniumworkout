package day28;

import org.testng.Assert;
import org.testng.annotations.Test;

public class Depedencymethodgrouping {

	@Test(priority = 1)
	void openapp() {
		Assert.assertTrue(true);
	}

	@Test(priority = 2, dependsOnMethods = { "openapp" })
	void login() {
		Assert.assertTrue(true);
	}

	@Test(priority = 3)
	void search() {

		Assert.assertTrue(false);

	}

	@Test(priority = 4, dependsOnMethods = { "login", "search" })
	void advsearch() {

	}

	@Test(priority = 5)
	void logout() {

	}
}
