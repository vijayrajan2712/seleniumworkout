package readingfromexcel;

import java.io.FileOutputStream;
import java.io.IOException;

import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class Ramdomfile {

	public static void main(String[] args) throws IOException {
		
		
	FileOutputStream file=new FileOutputStream(System.getProperty("user.dir")+"\\testdata\\mynewrandom.xlsx");
		
        XSSFWorkbook workbook=new XSSFWorkbook();
		
		XSSFSheet Sheet=workbook.createSheet("data");
		
		XSSFRow row1=Sheet.createRow(3);
		XSSFCell cell=row1.createCell(4);
		
		cell.setCellValue("welcome");
		
		workbook.write(file);
		workbook.close();
		file.close();
		
		System.out.println("file is created");
		
		
		
	}



}
