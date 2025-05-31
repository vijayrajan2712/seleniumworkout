package testng;

import org.testng.Assert;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

public class Softasseration {
	
	@Test
	void testsoftasserations() {
		System.out.println("testign..");

		System.out.println("testign..");

		SoftAssert sa=new SoftAssert();
		
		sa.assertEquals(1, 2);//softasseration

		System.out.println("testign..");

		System.out.println("testign..");
		
		sa.assertAll(); //always use this one is mandatory this is rule
		
	//not static method 
	
	
	
	

	}

}
