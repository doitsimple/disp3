^^
	schemas = global.schemas,
	ucfirst = $.ucfirst;
$$

import android.net.Uri;

public class DatabaseConstant {
	public static final String AUTHORITY = "^^=ns$$.provider";
 ^^for (var s in schemas){
 	var us = ucfirst(s);
 $$
	public static final class ^^=us$$Constant {
		public final static String TABLE_NAME = "^^=s$$";
		public final static Uri CONTENT_URI = Uri.parse("content://" + AUTHORITY + "/" + ^^=us$$Constant.TABLE_NAME);
 ^^for (var name in schemas[s].fields){$$
		public final static String ^^=name.toUpperCase()$$ = "^^=name$$";
 ^^}$$
	}
^^}$$

}
