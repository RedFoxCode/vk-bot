var commands = require("../methods.json");
commands = Object.keys(commands);

module.exports = function(message, context) {
	var helpText = [
		"Версия бота unstable-0.1.0",
		"Написан на Node.js",
		"Автор модуля для бота: http://vk.com/flyink",
		"Автор бота: http://vk.com/redfoxcode",
		"Репозиторий на гитхаб: https://github.com/RedFoxCode/vk-bot",
		"Список команд: " + commands.join(", ")
	];

	message.send(helpText.join("\n"), {
		forward_messages: message.id
	});
}