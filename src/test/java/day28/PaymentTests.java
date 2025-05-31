package day28;

import org.testng.annotations.Test;

public class PaymentTests {

	
	@Test(priority=1,groups= {"sanity","regression","functional"})
	void paymentinrupee()
	{
		System.out.println("payment in rupees...");
	}
	
	
	@Test(priority=2,groups= {"sanity","regression","functional"})
	void paymentindollars()
	{
		System.out.println("payment in dollars...");
	}
	
	
	
	
}
