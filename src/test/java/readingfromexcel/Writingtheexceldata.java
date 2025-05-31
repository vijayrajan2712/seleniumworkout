package readingfromexcel;

import java.io.FileOutputStream;
import java.io.IOException;

import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class Writingtheexceldata {
	
	public static void main(String[] args) throws IOException {
		
		FileOutputStream file=new FileOutputStream(System.getProperty("user.dir")+"\\testdata\\mynewfile.xlsx");
		
        XSSFWorkbook workbook=new XSSFWorkbook();
		
		XSSFSheet Sheet=workbook.createSheet("data");
		
		XSSFRow row1=Sheet.createRow(0);
		
		row1.createCell(0).setCellValue("java");
		row1.createCell(1).setCellValue("19");
		row1.createCell(2).setCellValue("Automation");
		
		XSSFRow row2=Sheet.createRow(1);
		
		row2.createCell(0).setCellValue("python");
		row2.createCell(1).setCellValue("3");
		row2.createCell(2).setCellValue("Automation");
		
		XSSFRow row3=Sheet.createRow(2);
		
		row3.createCell(0).setCellValue("c#");
		row3.createCell(1).setCellValue("5");
		row3.createCell(2).setCellValue("Automation");
		
		workbook.write(file);
		workbook.close();
		file.close();
		
		System.out.println("file is created");
		
		
	}
	
	
	

}
