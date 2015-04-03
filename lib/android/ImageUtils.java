package ^^=global.ns$$.^^=dir$$;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.PixelFormat;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;

public class ImageUtils{
/**
 * Drawable to Bitmap
 */
	public static Bitmap drawableToBitmap(Drawable drawable) {
		int width = drawable.getIntrinsicWidth();
		int height = drawable.getIntrinsicHeight();
		Bitmap bitmap = Bitmap.createBitmap(width, height, drawable.getOpacity() != PixelFormat.OPAQUE ? Bitmap.Config.ARGB_8888 : Bitmap.Config.RGB_565);
		Canvas canvas = new Canvas(bitmap);
		drawable.setBounds(0, 0, width, height);
		drawable.draw(canvas);
		return bitmap;

	}
/**
 * Bitmap to Drawable
 * @param bitmap
 * @param mcontext
 * @return
 */
	public static Drawable bitmapToDrawble(Bitmap bitmap,Context mcontext){
		Drawable drawable = new BitmapDrawable(mcontext.getResources(), bitmap);
		return drawable;
	}
}
