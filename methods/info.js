module.exports = function(message, context) {
	var percent = Math.floor(Math.random() * 100);

	var string = "&#9889; Вероятность - " + percent + "%";

	message.send(string, {
		forward_messages: message.id
	});
}