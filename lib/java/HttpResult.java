package ^^=global.ns$$.^^=dir$$;
import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class HttpResult {

	public int statusCode;
	public String message;
	public String value;
	public JSONObject response;
//	public JSONArray responses;

	public HttpResult(String message) {
		this.message = message;
	}

	public HttpResult(HttpURLConnection urlConnection) throws IOException,
		JSONException {
		try {
			this.statusCode = urlConnection.getResponseCode();
			if(this.statusCode == 200){
				InputStream is = new BufferedInputStream(urlConnection.getInputStream());
				String str = StreamUtils.getStringFromInputStream(is);
				is.close();
				this.value = str;

				if (str.charAt(0) == '{') {
					JSONObject jo = new JSONObject(str);
					this.response = jo;
				} else if (str.charAt(0) == '[') {
					JSONObject jo = new JSONObject();
					jo.put("data", new JSONArray(str));
					this.response = jo;
				}
			}
			urlConnection.disconnect();
		}catch(Exception e){
			this.statusCode = 0;
		}
	}

}

