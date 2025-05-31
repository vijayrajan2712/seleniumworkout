package testng;

import org.testng.annotations.AfterTest;
import org.testng.annotations.Test;

public class class2 {
	
	@Test
	void xyz()
	{
		System.out.println("this is abc from c2..");
		
	}

	@AfterTest
	void at()
	{
		System.out.println("this is aftertest method");
	}
	
	

}
