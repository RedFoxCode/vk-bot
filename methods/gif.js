module.exports = function(message, context) {
	var api = context.vkBot.api;

	api.docs.search({
		q: context.searchString + " .gif",
		offset: 1,
		count: 1
	}, function(response) {
		var gif = response.response.items[0];

		var attachment = "doc" + gif.owner_id + "_" + gif.id;

		message.send("&#128121;", {
			attachment: attachment,
			forward_messages: message.id
		});
	});
}