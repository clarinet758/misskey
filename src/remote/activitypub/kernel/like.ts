import * as mongo from 'mongodb';
import Note, { INote } from '../../../models/note';
import { IRemoteUser } from '../../../models/user';
import { ILike, getApId } from '../type';
import create from '../../../services/note/reaction/create';
import { isSelfHost, extractApHost } from '../../../misc/convert-host';
import { fetchNote } from '../models/note';

export default async (actor: IRemoteUser, activity: ILike) => {
	const id = getApId(activity.object);

	let note: INote;

	if (isSelfHost(extractApHost(id))) {
		const noteId = new mongo.ObjectID(id.split('/').pop());
		note = await Note.findOne({ _id: noteId });
		if (note == null) return `skip: Like to unknown local post`;
	} else {
		note = await fetchNote(id);
		if (note == null) return `skip: Like to unreceived remote post`;
	}

	return await create(actor, note, activity._misskey_reaction);
};
