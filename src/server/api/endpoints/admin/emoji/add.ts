import $ from 'cafy';
import Emoji from '../../../../../models/emoji';
import define from '../../../define';
import { detectUrlMime } from '../../../../../misc/detect-url-mime';

export const meta = {
	desc: {
		'ja-JP': 'カスタム絵文字を追加します。'
	},

	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	params: {
		name: {
			validator: $.str.min(1)
		},

		category: {
			validator: $.optional.str
		},

		url: {
			validator: $.str.min(1)
		},

		aliases: {
			validator: $.optional.arr($.str.min(1)),
			default: [] as string[]
		}
	}
};

export default define(meta, async (ps) => {
	const type = await detectUrlMime(ps.url);

	const emoji = await Emoji.insert({
		updatedAt: new Date(),
		name: ps.name,
		category: ps.category,
		host: null,
		aliases: ps.aliases,
		url: ps.url,
		type,
	});

	return {
		id: emoji._id
	};
});
