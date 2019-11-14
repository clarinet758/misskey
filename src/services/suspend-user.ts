import { renderActivity } from '../remote/activitypub/renderer';
import { renderDelete } from '../remote/activitypub/renderer/delete';
import { renderTombstone } from '../remote/activitypub/renderer/tombstone';
import { deliver } from '../queue';
import config from '../config';
import User, { IUser, isLocalUser } from '../models/user';
import Following from '../models/following';
import deleteFollowing from '../services/following/delete';

export async function doPostSuspend(user: IUser) {
	await sendDeleteActivity(user).catch(() => {});
	await unFollowAll(user).catch(() => {});
}

export async function sendDeleteActivity(user: IUser) {
	if (isLocalUser(user)) {
		// 知り得る全SharedInboxにDelete配信
		const formarType = user.isBot ? 'Service' : 'Person';
		const content = renderActivity(renderDelete(renderTombstone(`${config.url}/users/${user._id}`, formarType), user));

		const queue: string[] = [];

		const followings = await Following.find({
			$or: [
				{ '_follower.sharedInbox': { $ne: null } },
				{ '_followee.sharedInbox': { $ne: null } },
			]
		}, {
			'_follower.sharedInbox': 1,
			'_followee.sharedInbox': 1,
		});

		const inboxes = followings.map(x => x._follower.sharedInbox || x._followee.sharedInbox);

		for (const inbox of inboxes) {
			if (inbox != null && !queue.includes(inbox)) queue.push(inbox);
		}

		for (const inbox of queue) {
			deliver(user as any, content, inbox);
		}
	}
}

async function unFollowAll(follower: IUser) {
	const followings = await Following.find({
		followerId: follower._id
	});

	for (const following of followings) {
		const followee = await User.findOne({
			_id: following.followeeId
		});

		if (followee == null) {
			continue;
		}

		await deleteFollowing(follower, followee, true);
	}
}
