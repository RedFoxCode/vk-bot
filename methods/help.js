module.exports = function(message, context) {
	var helpText = [
		"Версия бота unstable-0.1.0",
		"Написан на Node.js",
		"Автор модуля для бота: http://vk.com/flyink",
		"Автор бота: http://vk.com/redfoxcode"
	];

	message.send(helpText.join("\n"), {
		forward_messages: message.id
	});
}