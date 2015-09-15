^^
	schemas = global.schemas,
	ucfirst = $.ucfirst;
$$

 ^^
 for (var s in schemas){
 	var us = ucfirst(s);
 $$	
import ^^=ns$$.provider.DatabaseConstant.^^=us$$Constant;
^^}$$
import android.content.ContentProvider;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.UriMatcher;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteQueryBuilder;
import android.net.Uri;

public class Provider extends ContentProvider {
	private DatabaseHelper dbHelper;
^^i=0;for (var s in schemas){i++;$$
	private static final int ^^=s.toUpperCase()$$_DATA = ^^=i$$;
^^}$$
	private static final UriMatcher URI_MATHER;
	static {
		URI_MATHER = new UriMatcher(UriMatcher.NO_MATCH);
^^
 for (var s in schemas){
 	var us = ucfirst(s);
 $$	
		URI_MATHER.addURI(DatabaseConstant.AUTHORITY, ^^=us$$Constant.TABLE_NAME, ^^=s.toUpperCase()$$_DATA);
^^}$$

	}

	@Override
	public boolean onCreate() {
		// TODO Auto-generated method stub
		dbHelper = new DatabaseHelper(getContext());
		return false;
	}
	@Override
	public String getType(Uri arg0) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Cursor query(Uri uri, String[] projection, String selection,
			String[] selectionArgs, String sortOrder) {
		SQLiteDatabase db = dbHelper.getReadableDatabase();
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		String groupBy = null;
		String having = null;
		switch (URI_MATHER.match(uri)) {
^^for (var smname in schemas){$$
		case ^^=smname.toUpperCase()$$_DATA:
			qb.setTables(^^=ucfirst(smname)$$Constant.TABLE_NAME);
			break;
^^}$$
		default:
			throw new IllegalArgumentException("unknown uri" + uri);
		}
		Cursor c = qb.query(db, projection, selection, selectionArgs, groupBy,
				having, sortOrder);
		return c;
	}

	@Override
	public Uri insert(Uri uri, ContentValues values) {
		SQLiteDatabase db = dbHelper.getWritableDatabase();
		long rId = -1;
		switch (URI_MATHER.match(uri)) {
^^for (var smname in schemas){$$
		case ^^=smname.toUpperCase()$$_DATA:
			rId = db.insert(^^=ucfirst(smname)$$Constant.TABLE_NAME, null, values);
			break;
^^}$$
		default:
			throw new IllegalArgumentException("unknown uri" + uri);
		}
		return ContentUris.withAppendedId(uri, rId);
	}
// when use contentResolver, first we try update, if failed, insert
	@Override
	public int update(Uri uri, ContentValues values, String selection,
			String[] selectionArgs) {
		SQLiteDatabase db = dbHelper.getWritableDatabase();
		int count = -1;
		switch (URI_MATHER.match(uri)) {
^^for (var smname in schemas){$$
		case ^^=smname.toUpperCase()$$_DATA:
			count = updateOrInsert(db, uri, values, selection, selectionArgs);
			break;
^^}$$
		default:
			throw new IllegalArgumentException("unknown uri" + uri);
		}
		return count;
	}

	private int updateOrInsert(SQLiteDatabase db, Uri uri,
			ContentValues values, String selection, String[] selectionArgs) {
		int count;
		switch (URI_MATHER.match(uri)) {
^^for (var smname in schemas){$$
		case ^^=smname.toUpperCase()$$_DATA:
			count = db.update(^^=ucfirst(smname)$$Constant.TABLE_NAME, values, selection,
					selectionArgs);
			if (count == 0) {
				count = Integer.parseInt(insert(uri, values)
						.getLastPathSegment());
			}
			break;
^^}$$
		default:
			throw new IllegalArgumentException("unknown uri" + uri);
		}
		return count;
	}
	@Override
	public int delete(Uri uri, String selection, String[] selectionArgs) {
		SQLiteDatabase db = dbHelper.getWritableDatabase();
		int count = 0;
		switch (URI_MATHER.match(uri)) {
^^for (var smname in schemas){$$
		case ^^=smname.toUpperCase()$$_DATA:
			count = db.delete(^^=ucfirst(smname)$$Constant.TABLE_NAME, selection, selectionArgs);
			break;
^^}$$
		default:
			throw new IllegalArgumentException("unknown uri" + uri);
		}
		return count;
	}


}
