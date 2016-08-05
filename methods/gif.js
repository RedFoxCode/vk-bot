module.exports = function(message, context) {
	var api = context.vkBot.api;

	api.docs.search({
		q: context.searchString + " .gif",
		offset: 1,
		count: 100
	}, function(response) {
		var items = response.response.items;
		var item = items[Math.floor(Math.random() * items.length)];

		var attachment = "doc" + item.owner_id + "_" + item.id;

		message.send("&#128121;", {
			attachment: attachment,
			forward_messages: message.id
		});
	});
}