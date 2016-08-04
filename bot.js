/*
	Инструкция для настройки бота:
	1. Вам надо получать токен доступа 
		и заменить его в конфиге
	2. Вам надо подправить id
		 создателя бота в конфиге

	* Ссылка на получение токена - oauth.vk.com/authorize?client_id=3682744&scope=messages,audio,video,docs&response_type=token
	** Когда перейдете по ссылке нажмите "Разрешить", после скопируйте текст из адрессной строки
		который идет после #access_token= до следующег &

	*** Файл конфига - config.json все писать в ковычках, id не буквенный а цифровой
*/

var config = require("./config.json");

/*
	Загружаем методы бота
	Свои методы можно добавить путем
	добавления файла в папку methods
	и добавления свойств в methods.json

	Метод принимает параметр сообщения
	Подробнее о модуле для написания
	бота тут: http://vkscripts.ru/s/p

	Так же принимает второй параметр - контекст
*/
var methods = require("./methods.json"); // Подключаем словарь методов бота

var methodsKeys = Object.keys(methods); // Названия методов

methodsKeys.forEach(function(item) {
	// Переопределяем методы функциями, которые им принадлежат
	methods[item] = require("./methods/" + methods[item]); 
});

/*
	Подключаем необходимые
	модули для работы бота
*/
var vkModule = require("vk.js"); 
var vkBot = vkModule(config.access_token); 

/*
	Создаем обработчик
	входящих сообщений
*/
vkBot.addListener.messages(function(message) {
	var text = message.body.replace("\n", " "); 

	var structure = text.split(" "); // Структура сообщения

	var method = text.split(" ")[0].toLowerCase(); // Название метода который вызывают

	/* 
		Проверяем, существует ли
		такой метод, если нет
		то завершаем функцию,
		если все нормально то 
		продолжаем
	*/
	if (!methods[method]) 
		return;

	// Создаем контекст
	var context = {
		isChat: !!message.chat_active, // Проверяем, беседе ли это
		isBanned: false, // В будущем будет добавлена функция бана
		isBotOwner: message.user_info.id == config.bot_owner_id, // Проверяем, отправил ли сообщение владелец бота
		arguments: structure.slice(1), // Аргументы вызоыва метода
		searchString: structure.slice(1).join(" "), // Поисковая строка
		vkBot: vkBot // Объект бота
	}

	// Вызываем обработчик метода
	methods[method](message, context);
});

/*
	P.S. Комментариев в методах нет
*/