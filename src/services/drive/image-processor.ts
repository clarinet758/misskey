import * as sharp from 'sharp';

export type IImage = {
	data: Buffer;
	ext: string;
	type: string;
};

/**
 * Convert to JPEG
 *   with resize, remove metadata, resolve orientation, stop animation
 */
export async function ConvertToJpeg(path: string, width: number, height: number): Promise<IImage> {
	return ConvertSharpToJpeg(await sharp(path), width, height);
}

export async function ConvertSharpToJpeg(sharp: sharp.Sharp, width: number, height: number): Promise<IImage> {
	const data = await sharp
		.resize(width, height, {
			fit: 'inside',
			withoutEnlargement: true
		})
		.rotate()
		.jpeg({
			quality: 85,
			progressive: true
		})
		.toBuffer();

	return {
		data,
		ext: 'jpg',
		type: 'image/jpeg'
	};
}

/**
 * Convert to WebP
 *   with resize, remove metadata, resolve orientation, stop animation
 */
export async function ConvertToWebp(path: string, width: number, height: number): Promise<IImage> {
	return ConvertSharpToWebp(await sharp(path), width, height);
}

export async function ConvertSharpToWebp(sharp: sharp.Sharp, width: number, height: number): Promise<IImage> {
	const data = await sharp
		.resize(width, height, {
			fit: 'inside',
			withoutEnlargement: true
		})
		.rotate()
		.webp({
			quality: 85
		})
		.toBuffer();

	return {
		data,
		ext: 'webp',
		type: 'image/webp'
	};
}

/**
 * Convert to PNG
 *   with resize, remove metadata, resolve orientation, stop animation
 */
export async function ConvertToPng(path: string, width: number, height: number): Promise<IImage> {
	return ConvertSharpToPng(await sharp(path), width, height);
}

export async function ConvertSharpToPng(sharp: sharp.Sharp, width: number, height: number): Promise<IImage> {
	const data = await sharp
		.resize(width, height, {
			fit: 'inside',
			withoutEnlargement: true
		})
		.rotate()
		.png()
		.toBuffer();

	return {
		data,
		ext: 'png',
		type: 'image/png'
	};
}
