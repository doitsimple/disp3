package ^^=global.ns$$.^^=dir$$;

import java.io.File;

import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager.NameNotFoundException;
import android.graphics.Rect;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Environment;
import android.telephony.TelephonyManager;
import android.util.DisplayMetrics;

public class AndroidUtils {
	public final static String DIR = "^^=global.name$$";
	public final static String TMP_DIR = ".tmp";
	
	public static String getMac(Context context) {

		WifiManager manager = (WifiManager) context
			.getSystemService(Context.WIFI_SERVICE);
		WifiInfo info = manager.getConnectionInfo();
		String mac = info.getMacAddress();
		if (mac == null)
			mac = "";
		return mac;
	}

	public static String getIMSI(Context context) {
		TelephonyManager tm = (TelephonyManager) context
			.getSystemService(Context.TELEPHONY_SERVICE);
		String IMSI = tm.getSubscriberId();
		return IMSI;
	}

	public static int getAndroidSDKVersion() {
		int version = 0;
		try {
			version = Integer.valueOf(android.os.Build.VERSION.SDK_INT);
		} catch (NumberFormatException e) {
		}
		return version;
	}

	public static int getVersionCode(Context context) {
		int verCode = -1;
		try {
			verCode = context.getPackageManager().getPackageInfo(
				context.getPackageName(), 0).versionCode;
		} catch (NameNotFoundException e) {

		}
		return verCode;
	}

	public static File getTempDir() {
		File dir = getExternalDir();
		if (dir != null && dir.exists()) {
			File tempDir = new File(dir, AndroidUtils.TMP_DIR);
			if (!tempDir.exists()) {
				tempDir.mkdir();
			}
			return tempDir;
		} else {
			return null;
		}
	}

	public static File getExternalDir() {
		if (Environment.getExternalStorageDirectory().exists()) {
			File dir = new File(Environment.getExternalStorageDirectory(),
													AndroidUtils.DIR);
			if (!dir.exists()) {
				dir.mkdir();
			}
			return dir;
		} else {
			return null;
		}
	}

	/**
	 * 判断字符串里是否含有中文
	 */
	public static final boolean isChineseCharacter(String chineseStr) {
		char[] charArray = chineseStr.toCharArray();
		for (int i = 0; i < charArray.length; i++) {
			if ((charArray[i] >= 0x4e00) && (charArray[i] <= 0x9fbb)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 获得屏幕的宽
	 */
	public static int getScreenWidth(Context mContext) {
		DisplayMetrics dm = new DisplayMetrics();
		dm = mContext.getResources().getDisplayMetrics();
		return dm.widthPixels;
	}

	/**
	 * 获得屏幕的高
	 */
	public static int getScreenHeight(Context mContext) {
		DisplayMetrics dm = new DisplayMetrics();
		dm = mContext.getResources().getDisplayMetrics();
		return dm.heightPixels;
	}

	/**
	 * 获得状态栏高度
	 */
	public static int getStatusBarHeight(Context mContext) {
		Rect frame = new Rect();
		((Activity) mContext).getWindow().getDecorView()
			.getWindowVisibleDisplayFrame(frame);
		return frame.top;
	}

	/**
	 * 获得密度
	 */
	public static float getDensity(Context context) {
		return context.getResources().getDisplayMetrics().density;

	}

	/**
	 * 根据手机的分辨率从 dp 的单位 转成为 px(像素)
	  */
	public static int dip2px(Context context, float dpValue) {
		final float scale = context.getResources().getDisplayMetrics().density;
		return (int) (dpValue * scale + 0.5f);
	}

	/**
	 * 根据手机的分辨率从 px(像素) 的单位 转成为 dp
	 */
	public static int px2dip(Context context, float pxValue) {
		final float scale = context.getResources().getDisplayMetrics().density;
		return (int) (pxValue / scale + 0.5f);
	}

	/**
	 * 
	 * @param str
	 * @return
	 */
	public static String strRev(String str) {
		StringBuffer sb = new StringBuffer(str);
		String newstr = sb.reverse().toString();
		return newstr;
	}

}
