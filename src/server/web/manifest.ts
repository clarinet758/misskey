import * as Router from 'koa-router';
import * as manifest from '../../client/assets/manifest.json';
import * as deepcopy from 'deepcopy';
import fetchMeta from '../../misc/fetch-meta';

module.exports = async (ctx: Router.IRouterContext) => {
	const json = deepcopy(manifest);

	const instance = await fetchMeta();

	json.short_name = instance.name || 'Misskey';
	json.name = instance.name || 'Misskey';

	ctx.set('Cache-Control', 'max-age=300');
	ctx.body = json;
};
