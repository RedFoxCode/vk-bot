var answers = [
	"Определенно да",
	"Никаких сомнений",
	"Да",
	"Возможно",
	"Не стоит",
	"Спроси позже",
	"Нет",
	"Ни в коем случае"
];

module.exports = function(message, context) {
	var answer = answers[Math.floor(Math.random() * answers.length)];

	message.send(answer + " &#9888;", {
		forward_messages: message.id
	});
}