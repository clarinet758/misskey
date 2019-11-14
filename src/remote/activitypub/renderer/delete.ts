import config from '../../../config';
import { ILocalUser } from '../../../models/user';

export const renderDelete = (object: any, user: ILocalUser) => ({
	type: 'Delete',
	actor: `${config.url}/users/${user._id}`,
	object
});
