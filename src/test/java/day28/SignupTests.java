package day28;

import org.testng.annotations.Test;

public class SignupTests {

	
	@Test(priority=1,groups= {"regression"})
	void  Signupbymail()
	{
		System.out.println("This is Signup by email");
	}
	
	@Test(priority=2,groups= {"regression"})
	void  Signupbyfacebook()
	{
		System.out.println("This is Signup byfacebook");
	}
	
	
	@Test(priority=3,groups= {"regression"})
    void  Signupbytwitter()
    
    {
		System.out.println("This is Signup by twitter");
    }
	
	
	
	
	
	
	
	
	

}
