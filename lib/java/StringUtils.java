package ^^=global.ns$$.^^=dir$$;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;

public class StringUtils {
	public static String getString(List<String> li)  throws JSONException{
		JSONArray ja = new JSONArray();
		for (int i=0; i<li.size(); i++){
			ja.put(li.get(i));
		}
		return ja.toString();
	}
	public static List<String> getList(JSONArray ja)  throws JSONException{
		List<String> li = new ArrayList<String>();
		for (int i=0; i<ja.length(); i++){
			li.add(ja.getString(i));
		}
		return li;
	}
	public static List<String> getList(String str)  throws JSONException{
		JSONArray ja = new JSONArray(str);
		List<String> li = new ArrayList<String>();
		for (int i=0; i<ja.length(); i++){
			li.add(ja.getString(i));
		}
		return li;
	}
}

