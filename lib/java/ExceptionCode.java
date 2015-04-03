package ^^=global.ns$$.^^=dir$$;
import org.json.JSONObject;

public class ExceptionCode {

	public static ExceptionCode NullException = new ExceptionCode(0);
	public static int Null = 0;
	public static int UnclassifiedError = 10; //contain error message but not error code
	public static int UnAuthorized = 11; //401 status code
	public static int IgnoredStatusCode = 12; //status code other than 200, 401

	public static int IOException = 100;
	public static int ConnectException = 101;
	public static int SocketTimeoutException = 102;
	public static int DefaultException = 253; //throw exception without specified code
	public static int DefaultMessage = 254;//git message without specified code
	public static int Default = 255;

	public int code = 255;
	public Exception e;
	public String message;

	public JSONObject res;

	public static ExceptionCode withResult(JSONObject res){
		ExceptionCode e = new ExceptionCode(0);
		e.res = res;
		return e;
	}
	public ExceptionCode(Exception e){
		this.e = e;
		this.message = e.getMessage();
		this.code = ExceptionCode.DefaultException;
	}
	public ExceptionCode(int code, Exception e){
		this.e = e;
		this.message = e.getMessage();
		this.code = code;
	}
	public ExceptionCode(int code){
		this.code = code;
	}
	public ExceptionCode(int code, String message){
		this.message = message;
		this.code = code;
	}
	public ExceptionCode(String message){
		this.message = message;
		this.code = ExceptionCode.DefaultMessage;
	}
}
