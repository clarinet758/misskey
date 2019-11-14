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

	// objectがuriの場合可能ならば解決を試みる
	const object = await resolver.resolve(activity.object).catch(() => activity.object);

	const uri = getApId(object);

	let formarType: string | undefined;

	if (typeof activity.object === 'string') {
		formarType = undefined;
	} else if (isNote(activity.object)) {
		formarType = 'Note';
	} else if (isTombstone(activity.object)) {
		formarType = activity.object.formerType;
	} else {
		apLogger.warn(`Unknown object type '${activity.type}' in Delete activity '${uri}'`);
		return;
	}

	if (formarType === 'Note' || formarType == null) {
		deleteNote(actor, uri);
	} else {
		apLogger.warn(`Unsupported object type '${formarType}' in Delete activity '${uri}'`);
	}
};
