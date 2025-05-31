package readingfromexcel;

import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Scanner;

import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class Dynamicdataexcel {
	
	public static void main(String[] args) throws IOException {
		
	FileOutputStream file=new FileOutputStream(System.getProperty("user.dir")+"\\testdata\\mynewdynamicfile1.xlsx");
		
        XSSFWorkbook workbook=new XSSFWorkbook();
		
		XSSFSheet Sheet=workbook.createSheet("dynamicdata");
		
		Scanner sc=new Scanner(System.in);
		
		System.out.println("enter how many rows");
		int noOfrows=sc.nextInt();
		
		System.out.println("enter how many cells");
		int noOcells=sc.nextInt();
		
		for(int r=0;r<=noOfrows;r++)
		{
			XSSFRow currentRow=Sheet.createRow(r);
			
			for(int c=0;c<noOcells;c++)
			{
				XSSFCell cell=currentRow.createCell(c);
				cell.setCellValue(sc.next());
			}
		}
		
		workbook.write(file);
		workbook.close();
		file.close();
		System.out.println("file is created");
		
		
		
		
		
		
		
		
		
		
		
		
	}

	}
