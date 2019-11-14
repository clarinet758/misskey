import Resolver from '../../resolver';
import deleteNote from './note';
import { IRemoteUser } from '../../../../models/user';
import { IDelete, getApId, isNote, isTombstone } from '../../type';
import { apLogger } from '../../logger';

/**
 * 削除アクティビティを捌きます
 */
export default async (actor: IRemoteUser, activity: IDelete): Promise<void> => {
	if ('actor' in activity && actor.uri !== activity.actor) {
		throw new Error('invalid actor');
	}

	const resolver = new Resolver();

	// 4xxを返される可能性があるためエラーは無視する
	const object = await resolver.resolve(activity.object).catch(() => activity.object);

	const uri = getApId(object);

	// formerType取得
	let formarType: string | undefined;

	if (typeof object === 'string') {
		formarType = undefined;
	} else if (isNote(object)) {
		formarType = 'Note';
	} else if (isTombstone(object)) {
		formarType = object.formerType;
	} else {
		apLogger.warn(`Unknown object type '${object.type}' in Delete activity '${uri}'`);
		return;
	}

	// formerTypeで処理分岐
	if (formarType === 'Note' || formarType == null) {
		deleteNote(actor, uri);
	} else {
		apLogger.warn(`Unsupported target object type '${formarType}' in Delete activity '${uri}'`);
	}
};
