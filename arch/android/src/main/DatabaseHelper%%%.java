^^
	schemas = global.schemas,
	ucfirst = $.ucfirst
$$

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class DatabaseHelper extends SQLiteOpenHelper {
	public final static String DATABASE_NAME = "^^=name.toLowerCase()$$.db";
	public final static int DATABASE_VERSION = 3;

	public DatabaseHelper(Context context) {
		super(context, DATABASE_NAME, null, DATABASE_VERSION);
	}

	@Override
	public void onCreate(SQLiteDatabase db) {

 ^^
 for (var s in schemas){
 	var us = ucfirst(s);
 $$	
			db.execSQL("Create table " + DatabaseConstant.^^=us$$Constant.TABLE_NAME + " (" 
^^
 var i = 0; var len = Object.keys(schemas[s].fields).length
 for(var fname in schemas[s].fields){ i++; 
$$
 ^^if(i != len-1){$$
	+ DatabaseConstant.^^=us$$Constant.^^=fname.toUpperCase()$$ + " TEXT,"
 ^^}else{$$
  + DatabaseConstant.^^=us$$Constant.^^=fname.toUpperCase()$$ + " TEXT"
  ^^}$$
 ^^}$$
	+");");
^^}$$

	}
}
