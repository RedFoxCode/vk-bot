var answers = ["Очевидно, что это ", "Конечно же ", "Он является ", "Это ", "Без сомнений, "];

module.exports = function(message, context) {
	if (!context.isChat)
		return;

	var users = message.chat_active;

	var user = users[Math.floor(Math.random() * users.length)];

	context.vkBot.api.users.get({
		user_id: user
	}, function(response) {
		var answer = answers[Math.floor(Math.random() * answers.length)];

		var user = response.response[0];

		message.send(answer + user.first_name + " " + user.last_name, {
			forward_messages: message.id
		});
	});
}