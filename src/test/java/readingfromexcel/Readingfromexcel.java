package readingfromexcel;

import java.io.FileInputStream;
import java.io.IOException;

import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class Readingfromexcel {
	
	
	public static void main(String[] args) throws IOException {
		
		FileInputStream file=new FileInputStream(System.getProperty("user.dir")+"\\testdata\\data.xlsx");
		
		XSSFWorkbook workbook=new XSSFWorkbook(file);
		
		XSSFSheet Sheet=workbook.getSheet("Sheet1"); //or XSSFSheet Sheet=workbook.getsheetAt(0);
		
		int totalRows=Sheet.getLastRowNum();
		
		int totalCells=Sheet.getRow(1).getLastCellNum();
		
		
		System.out.println(totalRows);
		System.out.println(totalCells);
		
		for(int r=0;r<=totalRows;r++)
		{
			XSSFRow currentRow=Sheet.getRow(r);
			
			for(int c=0;c<totalCells;c++)
			{
				XSSFCell cell=currentRow.getCell(c);
				System.out.println(cell.toString()+ "\t" );
			}
			System.out.println();
			}
			
		workbook.close();
		file.close();
		
		

		
		
		
		
			
			
			
	}	
		
	}


