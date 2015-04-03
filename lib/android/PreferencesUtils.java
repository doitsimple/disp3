package ^^=global.ns$$.^^=dir$$;

import java.util.Set;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;

public class PreferencesUtils {

	private static final String PREFERENCES_NAME = "^^=global.name$$Preferences";

	private SharedPreferences sharePreferences;
	private SharedPreferences.Editor editor;

	private static PreferencesUtils memoryDefaultUtil;

	private PreferencesUtils(Context context) {
		sharePreferences = context.getSharedPreferences(PREFERENCES_NAME,
																										Context.MODE_PRIVATE);
		editor = sharePreferences.edit();
	}

	public static PreferencesUtils getInstance(Context context) {
		if (null == memoryDefaultUtil)
			return (memoryDefaultUtil = new PreferencesUtils(context));
		else
			return memoryDefaultUtil;
	}

	public void put(String key, String value) {
		if (null != editor) {
			editor.putString(key, value);
			editor.commit();
		}
	}

	public void put(String key, float value) {
		if (null != editor) {
			editor.putFloat(key, value);
			editor.commit();
		}
	}

	public void put(String key, int value) {
		if (null != editor) {
			editor.putInt(key, value);
			editor.commit();
		}
	}

	public void put(String key, boolean value) {
		if (null != editor) {
			editor.putBoolean(key, value);
			editor.commit();
		}
	}

	public void put(String key, long value) {
		if (null != editor) {
			editor.putLong(key, value);
			editor.commit();
		}
	}

	public String getString(String key) {
		return sharePreferences.getString(key, "");
	}

	public int getInt(String key) {
		return sharePreferences.getInt(key, Integer.MIN_VALUE);
	}

	public float getFloat(String key) {
		return sharePreferences.getFloat(key, Float.MIN_VALUE);
	}

	public boolean getBoolean(String key) {
		return sharePreferences.getBoolean(key, false);
	}

	public long getLong(String key) {
		return sharePreferences.getLong(key, Long.MIN_VALUE);
	}

	@TargetApi(Build.VERSION_CODES.HONEYCOMB)
	public Set<String> getStrings(String key) {
		if (AndroidUtils.getAndroidSDKVersion() >= Build.VERSION_CODES.HONEYCOMB) {
			return sharePreferences.getStringSet(key, null);
		} else {
			return null;
		}
	}

	@TargetApi(Build.VERSION_CODES.HONEYCOMB)
	public void put(String key, Set<String> values) {
		if (null != editor) {
			if (AndroidUtils.getAndroidSDKVersion() >= Build.VERSION_CODES.HONEYCOMB) {
				editor.putStringSet(key, values);
				editor.commit();
			}
		}
	}

	public boolean hasKey(String key) {
		return sharePreferences.contains(key);
	}

	public void remove(String key) {
		if (null != editor) {
			editor.remove(key);
			editor.commit();
		}
	}

	public void clear() {
		if (null != editor) {
			editor.clear();
			editor.commit();
		}
	}

}
