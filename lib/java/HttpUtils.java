package ^^=global.ns$$.^^=dir$$;
import ^^=global.ns$$.^^=dir$$.HttpsTrustModifier.TrustModifier;


import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.Iterator;
import java.io.FileInputStream;
import javax.net.ssl.HttpsURLConnection;

import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;

import org.json.JSONException;
import org.json.JSONObject;
/* need 
System.setProperty("http.keepAlive", "false");
for long connection
*/
public class HttpUtils {
	public static int connectTimeout = 0;
	public static int readTimeout = 0;

	public static HttpURLConnection createConnection(String urlString)
		throws KeyManagementException, NoSuchAlgorithmException,
		KeyStoreException, MalformedURLException, IOException,
		JSONException {
		URL url = new URL(urlString);
		if (url.getProtocol() == "https") {
			HttpsURLConnection urlConnection = (HttpsURLConnection) url
				.openConnection();
			urlConnection.setConnectTimeout(connectTimeout);
			urlConnection.setReadTimeout(readTimeout);
			TrustModifier.relaxHostChecking(urlConnection);
			return urlConnection;
		} else {
			HttpURLConnection urlConnection = (HttpURLConnection) url
				.openConnection();
			urlConnection.setConnectTimeout(connectTimeout);
			urlConnection.setReadTimeout(readTimeout);
			return urlConnection;
		}
	}
	public static HttpURLConnection createConnection(String urlString, int connectTimeout, int readTimeout)
		throws KeyManagementException, NoSuchAlgorithmException,
		KeyStoreException, MalformedURLException, IOException,
		JSONException {
		URL url = new URL(urlString);
		if (url.getProtocol() == "https") {
			HttpsURLConnection urlConnection = (HttpsURLConnection) url
				.openConnection();
			urlConnection.setConnectTimeout(connectTimeout);
			urlConnection.setReadTimeout(readTimeout);
			TrustModifier.relaxHostChecking(urlConnection);
			return urlConnection;
		} else {
			HttpURLConnection urlConnection = (HttpURLConnection) url
				.openConnection();
			urlConnection.setConnectTimeout(connectTimeout);
			urlConnection.setReadTimeout(readTimeout);
			return urlConnection;
		}
	}

	public static HttpResult get(String urlString) throws IOException,
		JSONException, KeyManagementException, NoSuchAlgorithmException,
		KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setRequestMethod("GET");
		return new HttpResult(urlConnection);
	}

	public static HttpResult getBearer(String urlString, String token)
		throws IOException, JSONException, KeyManagementException,
		NoSuchAlgorithmException, KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setRequestMethod("GET");
		urlConnection.setRequestProperty("Authorization", "Bearer " + token);
		return new HttpResult(urlConnection);
	}

	public static HttpResult delete(String urlString) throws IOException,
		JSONException, KeyManagementException, NoSuchAlgorithmException,
		KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setRequestMethod("DELETE");
		return new HttpResult(urlConnection);
	}

	public static HttpResult deleteBearer(String urlString, String token)
		throws IOException, JSONException, KeyManagementException,
		NoSuchAlgorithmException, KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setRequestMethod("DELETE");
		urlConnection.setRequestProperty("Authorization", "Bearer " + token);
		return new HttpResult(urlConnection);
	}

	public static HttpResult putJSON(String urlString, JSONObject jo)
		throws IOException, JSONException, KeyManagementException,
		NoSuchAlgorithmException, KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setRequestMethod("PUT");
		urlConnection.setRequestProperty("Content-Type", "application/json");
		urlConnection.setDoOutput(true);
		byte[] outputInBytes = jo.toString().getBytes("UTF-8");
		OutputStream os = urlConnection.getOutputStream();
		os.write(outputInBytes);
		os.flush();
		os.close();
		return new HttpResult(urlConnection);
	}

	public static HttpResult putJSONBearer(String urlString, JSONObject jo, String token) throws IOException, JSONException,
		KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setRequestMethod("PUT");
		urlConnection.setRequestProperty("Content-Type", "application/json");
		urlConnection.setRequestProperty("Authorization", "Bearer " + token);
		urlConnection.setDoOutput(true);
		byte[] outputInBytes = jo.toString().getBytes("UTF-8");
		OutputStream os = urlConnection.getOutputStream();
		os.write(outputInBytes);
		os.flush();
		os.close();
		return new HttpResult(urlConnection);
	}
	
	public static HttpResult postJSON(String urlString, JSONObject jo)
		throws IOException, JSONException, KeyManagementException,
		NoSuchAlgorithmException, KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setRequestMethod("POST");
		urlConnection.setRequestProperty("Content-Type", "application/json");
		urlConnection.setDoOutput(true);
		byte[] outputInBytes = jo.toString().getBytes("UTF-8");
		OutputStream os = urlConnection.getOutputStream();
		os.write(outputInBytes);
		os.flush();
		os.close();
		return new HttpResult(urlConnection);
	}

	public static HttpResult postJSONBearer(String urlString, JSONObject jo, String token) throws IOException, JSONException,
		KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setRequestMethod("POST");
		urlConnection.setRequestProperty("Content-Type", "application/json");
		urlConnection.setRequestProperty("Authorization", "Bearer " + token);
		urlConnection.setDoOutput(true);
		byte[] outputInBytes = jo.toString().getBytes("UTF-8");
		OutputStream os = urlConnection.getOutputStream();
		os.write(outputInBytes);
		os.flush();
		os.close();
		return new HttpResult(urlConnection);
	}

	public static HttpResult postJSONBearer(String urlString, JSONObject jo, String token, int timeout) throws IOException, JSONException,
		KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString, timeout, timeout);
		urlConnection.setRequestMethod("POST");
		urlConnection.setRequestProperty("Content-Type", "application/json");
		urlConnection.setRequestProperty("Authorization", "Bearer " + token);
		urlConnection.setDoOutput(true);
		byte[] outputInBytes = jo.toString().getBytes("UTF-8");
		OutputStream os = urlConnection.getOutputStream();
		os.write(outputInBytes);
		os.flush();
		os.close();
		return new HttpResult(urlConnection);
	}

	public static HttpResult postPlain(String urlString, String text)
		throws IOException, JSONException, KeyManagementException,
		NoSuchAlgorithmException, KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);

		urlConnection.setRequestMethod("POST");
		urlConnection.setRequestProperty("Content-Type", "text/plain");
		urlConnection.setDoOutput(true);
		byte[] outputInBytes = text.getBytes("UTF-8");
		OutputStream os = urlConnection.getOutputStream();
		os.write(outputInBytes);
		os.flush();
		os.close();
		return new HttpResult(urlConnection);
	}

	public static HttpResult postPlainBearer(String urlString, String text, String token) throws IOException, JSONException,
		KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);

		urlConnection.setRequestMethod("POST");
		urlConnection.setRequestProperty("Content-Type", "text/plain");
		urlConnection.setRequestProperty("Authorization", "Bearer " + token);
		urlConnection.setDoOutput(true);
		byte[] outputInBytes = text.getBytes("UTF-8");
		OutputStream os = urlConnection.getOutputStream();
		os.write(outputInBytes);
		os.flush();
		os.close();
		return new HttpResult(urlConnection);
	}
	public static HttpResult postBitmap(String urlString,	String filename, Bitmap bitmap) throws IOException,
		JSONException, KeyManagementException, NoSuchAlgorithmException,
		KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setConnectTimeout(connectTimeout);
		urlConnection.setReadTimeout(readTimeout);
		urlConnection.setRequestMethod("POST");
		urlConnection.setDoOutput(true);
		HttpUtils.sendMultipartBitmap(urlConnection, filename, bitmap);
		return new HttpResult(urlConnection);
	}
	public static HttpResult postBitmapBearer(String urlString, String filename, Bitmap bitmap, String token) throws IOException,
		JSONException, KeyManagementException, NoSuchAlgorithmException,
		KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setConnectTimeout(connectTimeout);
		urlConnection.setReadTimeout(readTimeout);
		urlConnection.setRequestProperty("Authorization", "Bearer " + token);
		urlConnection.setRequestMethod("POST");
		urlConnection.setDoOutput(true);
		HttpUtils.sendMultipartBitmap(urlConnection, filename, bitmap);
		return new HttpResult(urlConnection);
	}
	public static HttpResult postFile(String urlString,	String filename) throws IOException, JSONException, KeyManagementException, NoSuchAlgorithmException,
		KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setConnectTimeout(connectTimeout);
		urlConnection.setReadTimeout(readTimeout);
		urlConnection.setRequestMethod("POST");
		urlConnection.setDoOutput(true);
		HttpUtils.sendMultipartFile(urlConnection, filename);
		return new HttpResult(urlConnection);
	}
	public static HttpResult postFileBearer(String urlString, String filename, String token) throws IOException, JSONException, KeyManagementException, NoSuchAlgorithmException,	KeyStoreException {
		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setConnectTimeout(connectTimeout);
		urlConnection.setReadTimeout(readTimeout);
		urlConnection.setRequestProperty("Authorization", "Bearer " + token);
		urlConnection.setRequestMethod("POST");
		urlConnection.setDoOutput(true);
		HttpUtils.sendMultipartFile(urlConnection, filename);
		return new HttpResult(urlConnection);
	}

	public static HttpResult postForm(String urlString, JSONObject jo)
		throws IOException, JSONException, KeyManagementException,
		NoSuchAlgorithmException, KeyStoreException {

		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setConnectTimeout(connectTimeout);
		urlConnection.setReadTimeout(readTimeout);

		TrustModifier.relaxHostChecking(urlConnection);

		urlConnection.setRequestMethod("POST");
		urlConnection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
		urlConnection.setDoOutput(true);
		byte[] outputInBytes = HttpUtils.encodeJson(jo).getBytes("UTF-8");
		OutputStream os = urlConnection.getOutputStream();
		os.write(outputInBytes);
		os.flush();
		os.close();
		return new HttpResult(urlConnection);

	}
	public static HttpResult postFormBearer(String urlString, JSONObject jo, String token)
		throws IOException, JSONException, KeyManagementException,
		NoSuchAlgorithmException, KeyStoreException {

		HttpURLConnection urlConnection = createConnection(urlString);
		urlConnection.setConnectTimeout(connectTimeout);
		urlConnection.setReadTimeout(readTimeout);

		TrustModifier.relaxHostChecking(urlConnection);

		urlConnection.setRequestMethod("POST");
		urlConnection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
		urlConnection.setRequestProperty("Authorization", "Bearer " + token);
		urlConnection.setDoOutput(true);
		byte[] outputInBytes = HttpUtils.encodeJson(jo).getBytes("UTF-8");
		OutputStream os = urlConnection.getOutputStream();
		os.write(outputInBytes);
		os.flush();
		os.close();
		return new HttpResult(urlConnection);

	}

	public static String encodeJson(JSONObject jo)
		throws UnsupportedEncodingException, JSONException {
		String data = "";
		Iterator<String> iterator = jo.keys();
		String key;
		while (iterator.hasNext()) {
			key = iterator.next();
			data += key;
			data += "=";
			data += URLEncoder.encode(jo.getString(key), "UTF-8");
			if (iterator.hasNext())
				data += "&";
		}
		return data;
	}

	public static void sendMultipartBitmap(HttpURLConnection urlConnection,
																				 String fileName, Bitmap bitmap) throws JSONException, IOException {
		String boundary = "----" + System.currentTimeMillis();
		String LINE_FEED = "\r\n";
		String charset = "UTF-8";
		String fieldName = "buffer";
		urlConnection.setRequestProperty("Content-Type",
																		 "multipart/form-data; boundary=" + boundary);

		OutputStream outputStream = urlConnection.getOutputStream();
		// OutputStream outputStream = new FileOutputStream(new
		// File(ClassUtil.getDir()+"/a.jpeg"));
		PrintWriter writer = new PrintWriter(new OutputStreamWriter(
																					 outputStream, charset), true);

		// append image
		writer.append("--" + boundary).append(LINE_FEED);
		writer.append(
			"Content-Disposition: form-data; name=\"" + fieldName
			+ "\"; filename=\"" + fileName + "\"")
			.append(LINE_FEED);
		writer.append(
			"Content-Type: "
			+ URLConnection.guessContentTypeFromName(fileName))
			.append(LINE_FEED);
		writer.append("Content-Transfer-Encoding: binary").append(LINE_FEED);
		writer.append(LINE_FEED);
		writer.flush();
		bitmap.compress(CompressFormat.JPEG, 50, outputStream);
		outputStream.flush();

		writer.append(LINE_FEED);

		// finish
		writer.append(LINE_FEED).flush();
		writer.append("--" + boundary + "--").append(LINE_FEED);
		writer.close();
		outputStream.close();
	}

	public static void sendMultipartFile(HttpURLConnection urlConnection,
																			 String fileName) throws JSONException, IOException {
		String boundary = "----" + System.currentTimeMillis();
		String LINE_FEED = "\r\n";
		String charset = "UTF-8";
		String fieldName = "buffer";
		urlConnection.setRequestProperty("Content-Type",
																		 "multipart/form-data; boundary=" + boundary);

		OutputStream outputStream = urlConnection.getOutputStream();
		// OutputStream outputStream = new FileOutputStream(new
		// File(ClassUtil.getDir()+"/a.jpeg"));
		PrintWriter writer = new PrintWriter(new OutputStreamWriter(
																					 outputStream, charset), true);

		// append image
		writer.append("--" + boundary).append(LINE_FEED);
		writer.append(
			"Content-Disposition: form-data; name=\"" + fieldName
			+ "\"; filename=\"" + fileName + "\"")
			.append(LINE_FEED);
		writer.append(
			"Content-Type: "
			+ URLConnection.guessContentTypeFromName(fileName))
			.append(LINE_FEED);
		writer.append("Content-Transfer-Encoding: binary").append(LINE_FEED);
		writer.append(LINE_FEED);
		writer.flush();
		FileInputStream in = new FileInputStream(fileName);
		int c;
		while ((c = in.read()) != -1) {
			outputStream.write(c);
		}
		in.close();
		// bitmap.compress(CompressFormat.JPEG, 100, outputStream);
		outputStream.flush();

		writer.append(LINE_FEED);

		// finish
		writer.append(LINE_FEED).flush();
		writer.append("--" + boundary + "--").append(LINE_FEED);
		writer.close();
		outputStream.close();
	}
}


