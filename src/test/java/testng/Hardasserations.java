package testng;

import static org.testng.Assert.fail;

import org.testng.Assert;
import org.testng.annotations.Test;

public class Hardasserations {
	
	@Test
	void test()
	{
	
		Assert.assertEquals("xyz", "xyz");  // only the value should be same otherwise result failed
		Assert.assertEquals("abc", "abc1");
		Assert.assertEquals("123", "abc");
		Assert.assertEquals("123", 123); //double quote is string without is number,
		
		Assert.assertNotEquals("123", "456");
		
		Assert.assertTrue(true); //pass
		
		Assert.assertTrue(false); //failed
		
		Assert.assertTrue(1==2); //failed
		
		Assert.assertTrue(1==1); //pass
		
		Assert.assertFalse(1==2); //pass
		
		Assert.fail();  // we intensely want to fail
		
		
		
		
	}
	

}
