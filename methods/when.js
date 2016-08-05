function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

module.exports = function(message, context) {
	var date = randomDate(new Date(), new Date(2105, 11, 1));

	var answer = (date.getMonth() + 1) + " месяца, " + (date.getDay() + 1) + " числа, " + date.getFullYear() + " года";

	message.send(answer, {
		forward_messages: message.id
	});
}