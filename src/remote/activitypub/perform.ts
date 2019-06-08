import { IActivity } from './type';
import { IRemoteUser } from '../../models/user';
import kernel from './kernel';

export default async (actor: IRemoteUser, activity: IActivity): Promise<void> => {
	await kernel(actor, activity);
};
