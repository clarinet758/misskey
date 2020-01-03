import * as fs from 'fs';
import * as crypto from 'crypto';
import * as fileType from 'file-type';
import isSvg from 'is-svg';
const probeImageSize = require('probe-image-size');
import * as sharp from 'sharp';

export type FileInfo = {
	size: number;
	md5: string;
	type: {
		mime: string;
		ext: string | null;
	};
	width?: number;
	height?: number;
	avgColor?: number[];
};

const TYPE_OCTET_STREAM = {
	mime: 'application/octet-stream',
	ext: null as string
};

const TYPE_SVG = {
	mime: 'image/svg+xml',
	ext: 'svg'
};

/**
 * Get file information
 */
export async function getFileInfo(path: string): Promise<FileInfo> {
	const size = await getFileSize(path);
	const md5 = await calcHash(path);

	let type = await detectType(path);

	// image dimensions
	let width = undefined as number;
	let height = undefined as number;

	if (['image/jpeg', 'image/gif', 'image/png', 'image/apng', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/vnd.adobe.photoshop'].includes(type.mime)) {
		const imageSize = await detectImageSize(path).catch(() => undefined);

		// うまく判定できない画像は octet-stream にする
		if (!imageSize) {
			type = TYPE_OCTET_STREAM;
		} else if (imageSize.wUnits === 'px') {
			width = imageSize.width;
			height = imageSize.height;

			// 制限を超えている画像は octet-stream にする
			if (imageSize.width > 16383 || imageSize.height > 16383) {
				type = TYPE_OCTET_STREAM;
			}
		}
	}

	// average color
	let avgColor = undefined as number[];

	if (['image/jpeg', 'image/gif', 'image/png', 'image/webp'].includes(type.mime)) {
		avgColor = await calcAvgColor(path).catch(() => undefined);
	}

	return {
		size,
		md5,
		type,
		width,
		height,
		avgColor,
	};
}

/**
 * Detect MIME Type and extension
 */
export async function detectType(path: string) {
	// Check 0 byte
	const fileSize = await getFileSize(path);
	if (fileSize === 0) {
		return TYPE_OCTET_STREAM;
	}

	const readable = fs.createReadStream(path);
	const type = (await fileType.stream(readable)).fileType;
	readable.destroy();

	if (type) {
		// XMLはSVGかもしれない
		if (type.mime === 'application/xml' && await checkSvg(path)) {
			return TYPE_SVG;
		}

		return {
			mime: type.mime,
			ext: type.ext
		};
	}

	// 種類が不明でもSVGかもしれない
	if (await checkSvg(path)) {
		return TYPE_SVG;
	}

	// それでも種類が不明なら application/octet-stream にする
	return TYPE_OCTET_STREAM;
}

/**
 * Check the file is SVG or not
 */
export async function checkSvg(path: string) {
	try {
		const size = await getFileSize(path);
		if (size > 1 * 1024 * 1024) return false;
		return isSvg(fs.readFileSync(path));
	} catch {
		return false;
	}
}

/**
 * Get file size
 */
export async function getFileSize(path: string): Promise<number> {
	return new Promise<number>((res, rej) => {
		fs.stat(path, (err, stats) => {
			if (err) return rej(err);
			res(stats.size);
		});
	});
}

/**
 * Calculate MD5 hash
 */
async function calcHash(path: string): Promise<string> {
	return new Promise<string>((res, rej) => {
		const readable = fs.createReadStream(path);
		const hash = crypto.createHash('md5');
		const chunks: Buffer[] = [];
		readable
			.on('error', rej)
			.pipe(hash)
			.on('error', rej)
			.on('data', chunk => chunks.push(chunk))
			.on('end', () => {
				const buffer = Buffer.concat(chunks);
				res(buffer.toString('hex'));
			});
	});
}

/**
 * Detect dimensions of image
 */
async function detectImageSize(path: string): Promise<{
	width: number;
	height: number;
	wUnits: string;
	hUnits: string;
}> {
	const readable = fs.createReadStream(path);
	const imageSize = await probeImageSize(readable);
	readable.destroy();
	return imageSize;
}

/**
 * Calculate average color of image
 */
async function calcAvgColor(path: string): Promise<number[]> {
	const img = sharp(path);

	const info = await (img as any).stats();

	const r = Math.round(info.channels[0].mean);
	const g = Math.round(info.channels[1].mean);
	const b = Math.round(info.channels[2].mean);

	return info.isOpaque ? [r, g, b] : [r, g, b, 255];
}
