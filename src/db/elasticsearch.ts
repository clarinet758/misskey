import * as elasticsearch from 'elasticsearch';
import config from '../config';

const index = {
	settings: {
		analysis: {
			analyzer: {
				bigram: {
					tokenizer: 'bigram_tokenizer'
				}
			},
			tokenizer: {
				bigram_tokenizer: {
					type: 'nGram',
					min_gram: 2,
					max_gram: 2
				}
			}
		}
	},
	mappings: {
		note: {
			properties: {
				text: {
					type: 'text',
					index: true,
					analyzer: 'bigram'
				}
			}
		}
	}
};

const index_nj = {
	settings: {
		analysis: {
			analyzer: {
				ngram_ja : {
					type: 'custom',
					tokenizer: 'ngram_ja_tokenizer',
					char_filter : ['html_strip'],
					filter: ['cjk_width', 'lowercase']
				}
			},
			tokenizer: {
				ngram_ja_tokenizer: {
					type: 'nGram',
					min_gram: 2,
					max_gram: 3,
					token_chars: ['letter', 'digit']
				}
			}
		}
	},
	mappings: {
		note: {
			properties: {
				text: {
					type: 'text',
					index: true,
					analyzer: 'ngram_ja'
				}
			}
		}
	}
};

// Init ElasticSearch connection
const client = config.elasticsearch ? new elasticsearch.Client({
	host: `${config.elasticsearch.host}:${config.elasticsearch.port}`
}) : null;

if (client) {
	// Send a HEAD request
	client.ping({
		// Ping usually has a 3000ms timeout
		requestTimeout: 30000
	}, error => {
		if (error) {
			console.error('elasticsearch is down!');
		} else {
			console.log('elasticsearch is available!');
		}
	});

	client.indices.exists({
		index: 'misskey'
	}).then(exist => {
		if (exist) return;

		client.indices.create({
			index: 'misskey',
			body: index_ngram_ja
		});
	});
}

export default client;
