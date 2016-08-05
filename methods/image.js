module.exports = function(message, context) {
	var api = context.vkBot.api;

	api.photos.search({
		q: context.searchString,
		offset: 1,
		count: 100
	}, function(response) {
		var items = response.response.items;
		var item = items[Math.floor(Math.random() * items.length)];

		var attachment = "photo" + item.owner_id + "_" + item.id;

		message.send("&#128121;", {
			attachment: attachment,
			forward_messages: message.id
		});
	});
}