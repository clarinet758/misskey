import { toArray, toSingle } from '../../prelude/array';

export type obj = { [x: string]: any };

export type ApObject = IObject | string | (IObject | string)[];

export interface IObject {
	'@context': string | obj | obj[];
	type: string;
	id?: string;
	summary?: string;
	published?: string;
	cc?: ApObject;
	to?: ApObject;
	attributedTo: ApObject;
	attachment?: IObject | IObject[];
	inReplyTo?: ApObject;
	replies?: ICollection;
	content: string;
	name?: string;
	startTime?: Date;
	endTime?: Date;
	icon?: IApImage | IApImage[];
	image?: IApImage | IApImage[];
	url?: string;
	tag?: IObject | IObject[];
	sensitive?: boolean;
	movedTo?: ApObject;
	alsoKnownAs?: ApObject;
}

/**
 * Get array of ActivityStreams Objects id
 */
export function getApIds(value: ApObject | undefined): string[] {
	if (value == null) return [];
	const array = toArray(value);
	return array.map(x => getApId(x));
}

/**
 * Get first ActivityStreams Object id
 */
export function getOneApId(value: ApObject): string {
	const firstOne = toSingle(value);
	return getApId(firstOne);
}

/**
 * Get ActivityStreams Object id
 */
export function getApId(value: string | IObject): string {
	if (typeof value === 'string') return value;
	if (typeof value.id === 'string') return value.id;
	throw new Error(`cannot detemine id`);
}

export interface IActivity extends IObject {
	//type: 'Activity';
	actor: IObject | string;
	object: IObject | string;
	target?: IObject | string;
	signature?: {};
}

export interface ICollection extends IObject {
	type: 'Collection';
	totalItems: number;
	items?: ApObject;
	current?: ICollectionPage;
	first?: ICollectionPage;
	last?: ICollectionPage;
}

export interface ICollectionPage extends IObject {
	type: 'CollectionPage';
	totalItems: number;
	items?: ApObject;
	current?: ICollectionPage;
	first?: ICollectionPage;
	last?: ICollectionPage;	partOf: string;
	next?: ICollectionPage;
	prev?: ICollectionPage;
}

export interface IOrderedCollection extends IObject {
	type: 'OrderedCollection';
	totalItems: number;
	orderedItems?: ApObject;
	current?: IOrderedCollectionPage;
	first?: IOrderedCollectionPage;
	last?: IOrderedCollectionPage;
}

export interface IOrderedCollectionPage extends IObject {
	type: 'OrderedCollectionPage';
	totalItems: number;
	orderedItems?: ApObject;
	current?: IOrderedCollectionPage;
	first?: IOrderedCollectionPage;
	last?: IOrderedCollectionPage;
	partOf: string;
	next?: IOrderedCollectionPage;
	prev?: IOrderedCollectionPage;
	startIndex?: number;
}

export interface IApNote extends IObject {
	type: 'Note' | 'Question' | 'Article' | 'Audio' | 'Document' | 'Image' | 'Page' | 'Video';
	_misskey_content: string;
	_misskey_quote: string;
	_misskey_talk: boolean;
}

export const isNote = (object: IObject): object is IApNote =>
	['Note', 'Question', 'Article', 'Audio', 'Document', 'Image', 'Page', 'Video'].includes(object.type);

export interface ITombstone extends IObject {
	type: 'Tombstone';
	formerType?: string;
	deleted?: Date;
}

export const isTombstone = (object: IObject): object is ITombstone =>
	object.type === 'Tombstone';

export interface IQuestion extends IObject {
	type: 'Note' | 'Question';
	_misskey_content: string;
	_misskey_quote: string;
	oneOf?: IQuestionChoice[];
	anyOf?: IQuestionChoice[];
	endTime?: Date;
	closed?: Date;
}

export const isQuestion = (object: IObject): object is IQuestion =>
	object.type === 'Note' || object.type === 'Question';

interface IQuestionChoice {
	name?: string;
	replies?: ICollection;
	_misskey_votes?: number;
}

export interface IApDocument extends IObject {
	type: 'Audio' | 'Document' | 'Image' | 'Page' | 'Video';
}

export const isDocument = (object: IObject): object is IApDocument =>
	['Audio', 'Document', 'Image', 'Page', 'Video'].includes(object.type);

export interface IApImage extends IObject {
	type: 'Image';
}

export const isImage = (object: IObject): object is IApImage =>
	object.type === 'Image';

export interface IApPropertyValue extends IObject {
	type: 'PropertyValue';
	identifier: IApPropertyValue;
	value: string;
}

export const isPropertyValue = (object: IObject): object is IApPropertyValue =>
	object &&
	object.type === 'PropertyValue' &&
	typeof object.name === 'string' &&
	typeof (object as any).value === 'string';

export interface IApHashtag extends IObject {
	type: 'Hashtag';
}

export const isHashtag = (object: IObject): object is IApHashtag =>
	object.type === 'Hashtag' &&
	typeof object.name === 'string';

export interface IApPerson extends IObject {
	type: 'Person' | 'Service';
	name: string;
	preferredUsername: string;
	manuallyApprovesFollowers: boolean;
	inbox: string;
	sharedInbox?: string;
	publicKey: any;
	followers: any;
	following: any;
	featured?: any;
	outbox: any;
	endpoints: any;
}

export const isPerson = (object: IObject): object is IApPerson =>
	['Person', 'Service'].includes(object.type);

export interface IApEmoji extends IObject {
	type: 'Emoji';
	name: string;
	updated: Date;
}

export const isEmoji = (object: IObject): object is IApEmoji =>
	object.type === 'Emoji' && !Array.isArray(object.icon) && object.icon.url != null;

export const isCollection = (object: IObject): object is ICollection =>
	object.type === 'Collection';

export const isOrderedCollection = (object: IObject): object is IOrderedCollection =>
	object.type === 'OrderedCollection';

export const isCollectionPage = (object: IObject): object is ICollectionPage =>
	object.type === 'CollectionPage';

export const isOrderedCollectionPage = (object: IObject): object is IOrderedCollectionPage =>
	object.type === 'OrderedCollectionPage';

export const isCollectionOrOrderedCollection = (object: IObject): object is ICollection | IOrderedCollection =>
	isCollection(object) || isOrderedCollection(object);

export interface ICreate extends IActivity {
	type: 'Create';
}

export interface IDelete extends IActivity {
	type: 'Delete';
}

export interface IUpdate extends IActivity {
	type: 'Update';
}

export interface IUndo extends IActivity {
	type: 'Undo';
}

export interface IFollow extends IActivity {
	type: 'Follow';
}

export interface IAccept extends IActivity {
	type: 'Accept';
}

export interface IReject extends IActivity {
	type: 'Reject';
}

export interface IAdd extends IActivity {
	type: 'Add';
}

export interface IRemove extends IActivity {
	type: 'Remove';
}

export interface ILike extends IActivity {
	type: 'Like';
	_misskey_reaction: string;
}

export interface IAnnounce extends IActivity {
	type: 'Announce';
}

export interface IBlock extends IActivity {
	type: 'Block';
}

export const isCreate = (object: IObject): object is ICreate => object.type === 'Create';
export const isDelete = (object: IObject): object is IDelete => object.type === 'Delete';
export const isUpdate = (object: IObject): object is IUpdate => object.type === 'Update';
export const isUndo = (object: IObject): object is IUndo => object.type === 'Undo';
export const isFollow = (object: IObject): object is IFollow => object.type === 'Follow';
export const isAccept = (object: IObject): object is IAccept => object.type === 'Accept';
export const isReject = (object: IObject): object is IReject => object.type === 'Reject';
export const isAdd = (object: IObject): object is IAdd => object.type === 'Add';
export const isRemove = (object: IObject): object is IRemove => object.type === 'Remove';
export const isLike = (object: IObject): object is ILike => object.type === 'Like';
export const isAnnounce = (object: IObject): object is IAnnounce => object.type === 'Announce';
export const isBlock = (object: IObject): object is IBlock => object.type === 'Block';
