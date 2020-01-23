import * as fs from 'fs';
import * as Router from 'koa-router';
import { serverLogger } from '..';
import { IImage, ConvertToPng, ConvertToJpeg } from '../../services/drive/image-processor';
import { createTemp } from '../../misc/create-temp';
import { downloadUrl } from '../../misc/donwload-url';
import { detectType } from '../../misc/get-file-info';

export async function proxyMedia(ctx: Router.IRouterContext) {
	const url = 'url' in ctx.query ? ctx.query.url : 'https://' + ctx.params.url;

	// Create temp file
	const [path, cleanup] = await createTemp();

	try {
		await downloadUrl(url, path);

		const { mime, ext } = await detectType(path);

		if (!mime.startsWith('image/')) throw 403;

		let image: IImage;

		if ('static' in ctx.query && ['image/png', 'image/apng', 'image/gif'].includes(mime)) {
			image = await ConvertToPng(path, 498, 280);
		} else if ('preview' in ctx.query && ['image/jpeg', 'image/png', 'image/apng', 'image/gif', 'image/webp'].includes(mime)) {
			image = await ConvertToJpeg(path, 200, 200);
		} else {
			image = {
				data: fs.readFileSync(path),
				ext,
				type: mime,
			};
		}

		ctx.body = image.data;
		ctx.set('Content-Type', image.type);
		ctx.set('Cache-Control', 'max-age=31536000, immutable');
	} catch (e) {
		serverLogger.error(e);

		if (typeof e == 'number' && e >= 400 && e < 500) {
			ctx.status = e;
			ctx.set('Cache-Control', 'max-age=86400');
		} else {
			ctx.status = 500;
			ctx.set('Cache-Control', 'max-age=300');
		}
	} finally {
		cleanup();
	}
}
