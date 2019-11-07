import { isRemoteUser, ILocalUser, IRemoteUser, IUser, isLocalUser } from '../../models/user';
import Following from '../../models/following';
import { deliver } from '../../queue';

export interface IQueue {
	type: string;
}

export interface IFollowersQueue extends IQueue {
	type: 'Followers';
}

export interface IDirectQueue extends IQueue {
	type: 'Direct';
	to: IRemoteUser;
}

const isFollowers = (queue: any): queue is IFollowersQueue =>
	queue.type === 'Followers';

const isDirect = (queue: any): queue is IDirectQueue =>
	queue.type === 'Direct';

/**
 * Queue activities to followers
 * @param activity Activity
 * @param from Followee
 */
export async function deliverToFollowers(actor: ILocalUser, activity: any) {
	const deliverer = new Deliverer(actor, activity);
	deliverer.addFollowersQueue();
	await deliverer.execute();
}

/**
 * Queue activities to user
 * @param activity Activity
 * @param to Target user
 */
export async function deliverToUser(actor: ILocalUser, activity: any, to: IRemoteUser) {
	const deliverer = new Deliverer(actor, activity);
	deliverer.addDirectQueue(to);
	await deliverer.execute();
}

export default class Deliverer {
	private actor: ILocalUser;
	private activity: any;
	private queues: IQueue[] = [];

	constructor(actor: ILocalUser, activity: any) {
		this.actor = actor;
		this.activity = activity;
	}

	public addFollowersQueue() {
		const deliver = {
			type: 'Followers'
		} as IFollowersQueue;

		this.addQueue(deliver);
	}

	public addDirectQueue(to: IRemoteUser) {
		const queue = {
			type: 'Direct',
			to
		} as IDirectQueue;

		this.addQueue(queue);
	}

	public addQueue(queue: IQueue) {
		this.queues.push(queue);
	}

	/**
	 * Execute delivers
	 */
	public async execute() {
		const inboxes: string[] = [];

		// build inbox list
		for (const queue of this.queues) {
			if (isFollowers(queue)) {
				const followers = await Following.find({
					followeeId: this.actor._id
				});

				for (const following of followers) {
					const follower = following._follower;

					if (isRemoteUser(follower)) {
						const inbox = follower.sharedInbox || follower.inbox;
						if (!inboxes.includes(inbox)) inboxes.push(inbox);
					}
				}
			} else if (isDirect(queue)) {
				const inbox = queue.to.inbox;
				if (!inboxes.includes(inbox)) inboxes.push(inbox);
			}
		}

		if (inboxes.length > 0) {
			for (const inbox of inboxes) {
				deliver(this.actor, this.activity, inbox);
			}
		}
	}
}
