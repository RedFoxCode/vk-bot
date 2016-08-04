var module_vk = function(access_token){
if(typeof require == "function"){
	var request = require('request');
	var requestSync = require('sync-request');
	var browser = false;
}else{
	console.info("I am in browser");
	var browser = true;
}
var vk = {
request_prompt:0,
inbrowser:browser,
request:request,
requestSync:requestSync,
api_url:"https://api.vk.com/method/",
default_version:"5.45",
access_token:access_token || "",
debag:1,
uid:{me:61351294,bot:302799706},
default_callback:function(a){if(vk.debag)console.log(a);},
upload:function(first_method,save_method,data,cb){
	//ядро загрузки файлов
	//first_method - метод для получения сервера
	//save_method - метод для сохранения файла
	//data - данные:
	//data["files"] должен содержать файлы для загрузки
	if(vk.debag)console.log("Получаем сервер для загрузки файлов...");
	var _data = vk.other.collect(data,{files:""});
	first_method(_data,function(s){
		if(vk.debag){
			console.log("Результаты получения сервера для загрузки...",s);
			console.log("Загрузка файлов...");
		}
		vk.sreq.post(s.response.upload_url,data["files"],function(a){
				if(vk.debag)console.log("Файлы загружены, сохраняю их...",a);
				var save_data = vk.other.collect(s.response,_data,a);
				save_method(save_data,function(r){
					cb(r,a,s,data);
				});
		})
	});
},
other:{
	collect: function() {
	var ret = {};
	var len = arguments.length;
	for (var i=0; i<len; i++) {
	 for (p in arguments[i]) {
		if (arguments[i].hasOwnProperty(p)) {
		  ret[p] = arguments[i][p];
		}
	 }
	}
	return ret;
	}
},
sreq:{
		get:function(u,c,e){//get для node.js
			if(typeof request == "undefined")return console.error("request is not defined");
			if(!e)e = function(b){console.log(b)};
			if(!c)c = function(b){console.log(b)};
			return  request.get(u, function optionalCallback(err, httpResponse, body) {
				if(err)return e(err);
				if(global.gc)global.gc();
				try{
					return c(JSON.parse(body));
				}catch(e){
					return c(body);
				}
			});	
		},
		getSync:function(u){//getSync для node.js
			if(typeof requestSync == "undefined")return console.error("requestSync is not defined");
			var res = requestSync('GET', u);
			if(global.gc)global.gc();
			try{
				return JSON.parse(res.getBody('utf8'));
			}catch(e){
				return res.getBody('utf8');
			}
		},
		postSync:function(u,d){//postSync для node.js
			if(typeof requestSync == "undefined")return console.error("requestSync is not defined");
			if(!d)d = {};
			var res = requestSync('POST', u, {qs: d});
			if(global.gc)global.gc();
			try{
				return JSON.parse(res.getBody('utf8'));
			}catch(e){
				return res.getBody('utf8');
			}
		},
		post:function(u,d,c,e){//post для node.js
			if(typeof request == "undefined")return console.error("request is not defined");
			if(!e)e = function(b){console.log(b)};
			if(!c)c = function(b){console.log(b)};
			for(var i in d){
				if(typeof d[i] == "undefined")delete d[i];
			}
			return request.post({url:u, formData: d}, function optionalCallback(err, httpResponse, body) {
			if(err)return e(err);
			if(global.gc)global.gc();
			try{
				return c(JSON.parse(body));
			}catch(e){
				return c(body);
			}
			
			});
		},
		jsonp:function(url,d, onSuccess, onError){ //Стандартный метод запросов на другой домен для браузера
			if(!onError)onError = function(a){console.log(a)};
			if(!onSuccess)onSuccess = function(a){console.log(a)};
			var scriptOk = false;
			var callbackName = 'f'+String(Math.random()).slice(2);
			url += ~url.indexOf('?') ? '&' : '?';
			url += 'callback=CallbackRegistry.'+callbackName;
			for(var n in d)url += '&'+n+'='+encodeURIComponent(d[n]);
			CallbackRegistry[callbackName] = function(data) {       
			scriptOk = true;
			try{
				document.getElementById(callbackName).remove();
			}catch(e){}
				delete CallbackRegistry[callbackName];
				onSuccess(data);
			};
			function checkCallback() {      
				if (scriptOk) return;
				delete CallbackRegistry[callbackName]; 
				delete document.getElementById(callbackName).remove();
				onError(url);
			}
			var script = document.createElement('script');
			script.onreadystatechange = function(){  
				if (this.readyState == 'complete' || this.readyState == 'loaded'){   
					this.onreadystatechange = null;
					setTimeout(checkCallback, 0);
				}
			}
			script.onload = script.onerror = checkCallback;
			script.src = url;
			script.id = callbackName;
			document.body.appendChild(script);
			},
		//Далее идут методы для браузера с установленным расширением
		// https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?utm_source=chrome-ntp-icon
		ext:{
			get: function(u,d,c,e){
			if(!e)e = function(b){console.log(b)};
			if(!c)c = function(b){console.log(b)};
			var xhr = new XMLHttpRequest();
			u += ~u.indexOf('?') ? '&' : '?';
			for(var n in d)u += '&'+n+'='+encodeURIComponent(d[n]);
			xhr.open('GET', u, true);
			xhr.onerror = e;
			xhr.onload = function(x){
				if (this.status == 200){
					try{
						data = JSON.parse(this.responseText);
					}catch(e){
						data = (this.responseText);
					}
					return c(data);
				}else{
					return xhr.onerror(this);
				}
			};
			xhr.send();
			},
			post: function(u,d,c,e){
				if(!e)e = function(b){console.log(b)};
				if(!c)c = function(b){console.log(b)};
				var xhr = new XMLHttpRequest();
				var formData = new FormData();
				for(var n in d)formData.append(n, d[n]);
				xhr.open('POST', u, true);
				xhr.onerror = e;
				xhr.onload = function(x){
					if (this.status == 200){
						try{
							data = JSON.parse(this.responseText);
						}catch(e){
							data = (this.responseText);
						}
						return c(data);
					}else{
						return xhr.onerror(this);
					}
				};
				xhr.send(formData);
			},
			getFile:function(url,name,cb){
				var xhr = new XMLHttpRequest();
				xhr.open('GET', url, true);
				xhr.responseType = 'arraybuffer';
				xhr.onload = function(){
					//url.split("/").splice(-1)[0]
					cb(new File([(new Uint8Array(xhr.response))],name));
				}
				xhr.send(null);
			}
		}
	},
permissions:[
	["notify",1,"Пользователь разрешил отправлять ему уведомления (для flash/iframe-приложений)."],
	["friends",2,"Доступ к друзьям."],
	["photos",4,"Доступ к фотографиям."],
	["audio",8,"Доступ к аудиозаписям."],
	["video",16,"Доступ к видеозаписям."],
	["docs",131072,"Доступ к документам."],
	["notes",2048,"Доступ к заметкам пользователя."],
	["pages",128,"Доступ к wiki-страницам."],
	["left_menu",256,"Добавление ссылки на приложение в меню слева."],
	["status",1024,"Доступ к статусу пользователя."],
	["offers",32,"Доступ к предложениям (устаревшие методы)."],
	["questions",64,"Доступ к вопросам (устаревшие методы)."],
	["wall",8192,"Доступ к обычным и расширенным методам работы со стеной. "],
	["groups",262144,"Доступ к группам пользователя."],
	["messages",4096,"Доступ к расширенным методам работы с сообщениями."],
	["email",4194304,"Доступ к email пользователя."],
	["notifications",524288,"Доступ к оповещениям об ответах пользователю."],
	["stats",1048576,"Доступ к статистике групп и приложений пользователя, администратором которых он является."],
	["ads",32768,"Доступ к расширенным методам работы с рекламным API."],
	["market",134217728,"Доступ к товарам."],
	["offline",65536,"Доступ к API в любое время"]
],
methods:[
"users.get","users.search","users.getSubscriptions","users.getFollowers","users.report","users.getNearby","users.isAppUser","getUserBalance","status.get","status.set","friends.get","friends.search","friends.areFriends","friends.getOnline","friends.getMutual","friends.getRecent","friends.getAppUsers","friends.getSuggestions","friends.getRequests","friends.add","friends.edit","friends.delete","friends.getLists","friends.addList","friends.editList","friends.deleteList","friends.deleteAllRequests","friends.getByPhones","friends.getAvailableForCall","photos.get","photos.search","photos.getAll","photos.getProfile","photos.getNewTags","photos.getUserPhotos","photos.getById","photos.copy","photos.edit","photos.delete","photos.restore","photos.getAlbums","photos.getAlbumsCount","photos.reorderAlbums","photos.createAlbum","photos.reorderPhotos","photos.editAlbum","photos.makeCover","photos.deleteAlbum","photos.move","photos.getUploadServer","photos.save","photos.getOwnerPhotoUploadServer","photos.saveOwnerPhoto","photos.getWallUploadServer","photos.saveWallPhoto","photos.getMessagesUploadServer","photos.saveMessagesPhoto","photos.getChatUploadServer","photos.getMarketUploadServer","photos.getMarketAlbumUploadServer","photos.saveMarketPhoto","photos.saveMarketAlbumPhoto","photos.getTags","photos.putTag","photos.confirmTag","photos.removeTag","photos.getAllComments","photos.getComments","photos.createComment","photos.editComment","photos.deleteComment","photos.restoreComment","photos.report","photos.reportComment","video.get","video.search","video.getAlbumsByVideo","video.getNewTags","video.getUserVideos","video.add","video.save","video.edit","video.moveToAlbum","video.delete","video.restore","video.getAlbums","video.addAlbum","video.editAlbum","video.deleteAlbum","video.addToAlbum","video.removeFromAlbum","video.getAlbumById","video.reorderAlbums","video.getComments","video.createComment","video.editComment","video.deleteComment","video.restoreComment","video.getCatalog","video.getCatalogSection","video.hideCatalogSection","video.getTags","video.putTag","video.removeTag","video.report","video.reportComment","video.reorderVideos","video.playStarted","audio.get","audio.getCount","audio.search","audio.getRecommendations","audio.getPopular","audio.getBroadcastList","audio.getById","audio.getLyrics","audio.getUploadServer","audio.save","audio.add","audio.edit","audio.moveToAlbum","audio.reorder","audio.delete","audio.restore","audio.getAlbums","audio.addAlbum","audio.editAlbum","audio.deleteAlbum","audio.getBroadcast","audio.setBroadcast","docs.get","docs.search","docs.getById","docs.getUploadServer","docs.getWallUploadServer","docs.save","docs.add","docs.delete","docs.getTypes","groups.get","groups.getById","groups.search","groups.create","groups.getInvites","groups.getMembers","groups.getRequests","groups.join","groups.leave","groups.invite","groups.editManager","groups.getBanned","groups.banUser","groups.unbanUser","groups.getSettings","groups.edit","groups.getInvitedUsers","groups.editPlace","groups.addLink","groups.editLink","groups.deleteLink","groups.reorderLink","groups.removeUser","groups.approveRequest","groups.getCatalog","groups.isMember","pages.get","pages.getTitles","pages.save","pages.saveAccess","pages.getHistory","pages.getVersion","pages.clearCache","pages.parseWiki","board.getTopics","board.getComments","board.addTopic","board.editTopic","board.deleteTopic","board.addComment","board.editComment","board.deleteComment","board.restoreComment","board.openTopic","board.closeTopic","board.fixTopic","board.unfixTopic","stats.get","stats.getPostReach","stats.getPostStats","stats.viewUser","stats.viewGroup","stats.viewPosts","stats.trackEvents","stats.trackVisitor","newsfeed.get","newsfeed.search","newsfeed.getLists","newsfeed.saveList","newsfeed.deleteList","newsfeed.getRecommended","newsfeed.getSuggestedSources","newsfeed.getMentions","newsfeed.getComments","newsfeed.unsubscribe","newsfeed.getBanned","newsfeed.addBan","newsfeed.deleteBan","newsfeed.ignoreItem","newsfeed.unignoreItem","notifications.get","notifications.markAsViewed","wall.get","wall.search","wall.getById","wall.post","wall.repost","wall.edit","wall.delete","wall.restore","wall.getComments","wall.addComment","wall.editComment","wall.deleteComment","wall.restoreComment","wall.pin","wall.unpin","wall.getReposts","wall.reportPost","wall.reportComment","polls.getById","polls.getVoters","polls.addVote","polls.deleteVote","polls.create","polls.edit","likes.getList","likes.add","likes.delete","likes.isLiked","messages.get","messages.search","messages.getDialogs","messages.searchDialogs","messages.getHistory","messages.deleteDialog","messages.getById","messages.send","messages.sendSticker","messages.delete","messages.restore","messages.markAsNew","messages.markAsRead","messages.markAsImportant","messages.getLongPollServer","messages.getLongPollHistory","messages.getChat","messages.createChat","messages.editChat","messages.getChatUsers","messages.setActivity","messages.addChatUser","messages.removeChatUser","messages.getLastActivity","messages.setChatPhoto","messages.deleteChatPhoto","messages.getRecentStickers","messages.markAsAnsweredDialog","messages.markAsImportantDialog","getMessages","sendMessage","fave.getLinks","fave.getUsers","fave.getPosts","fave.getPhotos","fave.getVideos","fave.addLink","fave.removeLink","fave.addUser","fave.removeUser","fave.addGroup","fave.removeGroup","notes.get","notes.getById","notes.getFriendsNotes","notes.add","notes.edit","notes.delete","notes.getComments","notes.createComment","notes.editComment","notes.deleteComment","notes.restoreComment","places.getById","places.search","places.add","places.checkin","places.getCheckins","places.getTypes","search.getHints","apps.get","apps.getCatalog","apps.getActivity","apps.remove","apps.getRequests","apps.sendRequest","apps.deleteRequest","apps.restoreRequest","apps.banRequest","apps.getFriendsList","apps.deleteAppRequests","apps.getLeaderboard","apps.getScore","apps.firstRun","apps.toggleRequests","gifts.get","gifts.getCatalog","gifts.send","gifts.delete","gifts.restore","market.get","market.getById","market.search","market.getAlbums","market.getAlbumById","market.createComment","market.getComments","market.deleteComment","market.restoreComment","market.editComment","market.reportComment","market.getCategories","market.report","market.add","market.edit","market.delete","market.restore","market.reorderItems","market.reorderAlbums","market.addAlbum","market.editAlbum","market.deleteAlbum","market.removeFromAlbum","market.addToAlbum","store.getProducts","store.buyProduct","store.reorderProducts","store.activateProduct","store.deactivateProduct","store.getStockItems","store.getStockItemByName","store.purchase","store.getCatalog","store.getFriendsList","database.getCountries","database.getCountriesById","database.getCities","database.getCitiesById","database.getRegions","database.getStreetsById","database.getUniversities","database.getFaculties","database.getChairs","database.getSchools","database.getSchoolClasses","account.getCounters","account.getInfo","account.setInfo","account.getAppPermissions","account.setOnline","account.setOffline","account.getBanned","account.banUser","account.unbanUser","account.getProfileInfo","account.saveProfileInfo","account.changePassword","account.getBalance","account.getActiveOffers","account.importContacts","account.lookupContacts","account.getPushSettings","account.setPushSettings","account.registerDevice","account.setSilenceMode","account.unregisterDevice","account.setNameInMenu","account.validateAction","account.testValidation","auth.checkPhone","auth.signup","auth.confirm","auth.restore","auth.validatePhone","auth.externalConfirm","auth.externalSignUp","auth.externalValidate","auth.externalCheckAuth","ads.getAccounts","ads.getClients","ads.createClients","ads.updateClients","ads.deleteClients","ads.getCampaigns","ads.createCampaigns","ads.updateCampaigns","ads.deleteCampaigns","ads.getAds","ads.getAdsLayout","ads.getAdsTargeting","ads.createAds","ads.updateAds","ads.deleteAds","ads.getStatistics","ads.getDemographics","ads.getBudget","ads.getOfficeUsers","ads.addOfficeUsers","ads.removeOfficeUsers","ads.getTargetingStats","ads.getSuggestions","ads.getCategories","ads.getUploadURL","ads.getVideoUploadURL","ads.getFloodStats","ads.getRejectionReason","ads.createTargetGroup","ads.updateTargetGroup","ads.deleteTargetGroup","ads.getTargetGroups","ads.importTargetContacts","getAds","orders.get","orders.getById","orders.changeState","leads.complete","leads.start","leads.getStats","leads.getUsers","adsweb.getSites","adsweb.createSite","adsweb.deleteSite","adsweb.checkSiteDomain","adsweb.updateSiteDomains","adsweb.changeSiteStatus","adsweb.getAdUnits","adsweb.createAdUnit","adsweb.deleteAdUnit","adsweb.updateAdUnit","adsweb.updateAdUnitParams","adsweb.getAdUnitCode","adsweb.getAds","adsweb.getAdCategories","adsweb.getStatistics","adsweb.getFraudHistory","adsint.reportAd","adsint.registerAdEvents","adsint.hideAd","offers.edit","offers.open","offers.close","offers.get","offers.search","offers.getInboundResponses","offers.getOutboundResponses","offers.accept","offers.refuse","offers.setResponseViewed","offers.deleteResponses","questions.get","questions.edit","questions.add","questions.delete","questions.search","questions.getTypes","questions.getOutbound","questions.getAnswers","questions.addAnswer","questions.deleteAnswer","questions.joinAnswer","questions.getAnswerVotes","questions.markAsViewed","utils.checkLink","utils.resolveScreenName","utils.getServerTime","secure.getAppBalance","secure.getTransactionsHistory","secure.getSMSHistory","secure.sendSMSNotification","secure.sendNotification","secure.setCounter","secure.setUserLevel","secure.getUserLevel","secure.checkToken","secure.saveAppStatus","secure.getAppStatus","secure.getBalance","secure.withdrawVotes","secure.addRating","secure.setLanguageValue","secure.deleteLanguageValue","widgets.getComments","widgets.getPages","storage.getKeys","storage.get","storage.set","execute","language.getValues","getVariable","getVariables","putVariable","getHighScores","setUserScore","voip.getCallInfo","voip.init","voip.start","voip.received","voip.reply","voip.hangup","voip.setDevices","voip.ping","chronicle.addPreset","chronicle.banUser","chronicle.clearCounters","chronicle.createRoom","chronicle.deleteRoomCoverPhoto","chronicle.deleteRoomPhoto","chronicle.generateInviteKey","chronicle.getAutoFeed","chronicle.getBanned","chronicle.getCounters","chronicle.getExploreSection","chronicle.getFeedback","chronicle.getInvites","chronicle.getPhotosById","chronicle.getPlaces","chronicle.getPopularRooms","chronicle.getPreset","chronicle.getPresets","chronicle.getProfile","chronicle.getRoomById","chronicle.getRoomFeed","chronicle.getRoomUsers","chronicle.getRooms","chronicle.getUploadServer","chronicle.inviteUser","chronicle.rejectInvite","chronicle.removeRoomUser","chronicle.addRoomUsers","chronicle.revokeInvite","chronicle.save","chronicle.searchRooms","chronicle.setPlaces","chronicle.setRoomAccess","chronicle.setRoomPhoto","chronicle.setRoomSettings","chronicle.unbanUser","chronicle.usersSearch","chronicle.getMessages"],
cart:{
		default_place:1,
		list:[],
		pause:0,
		timer:setInterval(function(){
			if(vk.cart.list.length > 0){
				if(vk.cart.pause == 0){
					vk.cart.list[0][1][3] = 0;
					vk.cart.list[0][0].apply(null,vk.cart.list[0][1]);
					vk.cart.list.shift();
				}
			}
		},335),
	},
_api:function(method,data,callback,place){
	//если нету callback'а
	if(typeof data !== "object")data = {};
	if(typeof callback !== "function")callback = vk.default_callback;
	if(vk.cart && typeof place == "undefined")place = vk.cart.default_place;
	//очередь
	if(!vk.cart || !place){//если не требуется очередь
	}else if(place == -1){//в начало очереди
		return vk.cart.list.unshift([vk._api,[method,data,callback]]);
	}else if(place == 1){//в конец очереди
		return vk.cart.list.push([vk._api,[method,data,callback]]);
	}
	//сбор url
	var url = vk.api_url + method + "?random=" + Math.random();
	if(vk.access_token && !data["access_token"])data["access_token"] = vk.access_token;
	if(!data["v"])data["v"] = vk.default_version;
	//for(var a in data)data[a] = encodeURIComponent(data[a]);
	vk.default_method(url,data,function(body){
		if(typeof body.response !== "undefined"){
			callback(body);
		}else if(body.error){
			if(data["error"] === 1 || (typeof data["error"] == "object" && data["error"].indexOf(body.error.error_code) > -1)){
				callback(body);
			}else{
				vk.on.error(body.error,method,data,callback)
			};
		}
	},function(){
		if(data["error"])callback({error:{error_code:404,error_msg:"Нет соединения с интернетом"}});
		else vk.on.error({error_code:404,error_msg:"Нет соединения с интернетом"},method,data,callback);
	});
},
_apiSync:function(method,data){
	if(vk.inbrowser)return console.error("The synchronous method is disabled in your browser");
	if(typeof data !== "object")data = {};//если нету data
	//сбор url
	var url = vk.api_url + method + "?random=" + Math.random();
	if(vk.access_token && !data["access_token"])data["access_token"] = vk.access_token;
	if(!data["v"])data["v"] = vk.default_version;
	//for(var a in data)data[a] = encodeURIComponent(data[a]);
	return vk.default_syncMethod(url,data);
},
addListener:{
	messages:function(_cb,data){
		if(!data)data = {};
		if(!data.access_token)data.access_token = vk.access_token;
		if(!_cb)return false;
		var pts,last_msg_id,users_info = {};
		if(vk.debag)console.log("Получаю сервер...");
		vk.api.messages.getLongPollServer({use_ssl:0,need_pts:1,access_token:data.access_token},function(res){
			pts = res.response.pts;
			if(vk.debag)console.log("Сервер успешно получен.");
			setInterval(function(){
				vk.api.messages.getLongPollHistory({pts:pts,access_token:data.access_token,fields:data.fields},function(res){
					//if(vk.debag)console.log("Сервер успешно ответил...");
					if( !pts || pts < res.response.new_pts)pts = res.response.new_pts;
					delete res.response.profiles.map(function(profile){users_info[profile.id] = profile;});
					delete res.response.messages.items.map(function(msg){
						if(typeof msg == "number" || last_msg_id >= msg.id)return;
							last_msg_id = msg.id;
							msg.users_info = users_info;
							msg.user_info = (users_info[msg.user_id] || {});
							msg.peer_id = (msg.chat_id?msg.chat_id + 2000000000:msg.user_id);
							msg.reply = function(text,other,__cb,place){
								if(typeof other !== "object")other = {}
								other.peer_id = msg.peer_id;
								other.forward_messages = msg.id;
								other.access_token = data.access_token;
								other.message = ((typeof text == "string")?text:JSON.stringify(text));
								vk.api.messages.send(other,__cb || function(){},place || 0);
							};
							msg.send = function(text,other,__cb,place){
								if(typeof other !== "object")other = {}
								other.peer_id = msg.peer_id;
								other.access_token = data.access_token;
								other.message = ((typeof text == "string")?text:JSON.stringify(text));
								vk.api.messages.send(other,__cb || function(){},place || 0);
							};
							_cb(msg);
						});
				},0);
			},data.interval || 500);
		});
	}
},
on:{
	captcha:function(_error,_m,_q,_cb){
		if(vk.debag)console.info("Был запрошен защитный код, игнорируем...",_error);
		},
	captchaSubmit:function(v){
		vk.cart.list[0][1][1].captcha_key = v;
		vk.cart.pause = 0;
		},
	error:function(_error,_m,_q,_cb){
			if(_error.error_code == 6){//Too many requests per second
				vk._api(_m,_q,_cb,-1);
			}else if(_error.error_code == 14){//captcha
				vk.on.captcha(_error,_m,_q,_cb);
			}else{
				vk.on.otherError(_error,_m,_q,_cb);
			}
		},
	otherError:function(_error,_m,_q,_cb){
		if(vk.debag)console.log("on.error",arguments);
	}
}
}

vk.default_method = browser?vk.sreq.jsonp:vk.sreq.post;//стандартный метод для запросов
vk.default_syncMethod = browser?vk.sreq.ePostSync:vk.sreq.postSync;//стандартный метод для синхронных запросов
//заполняем секции vk.api и vk.apiSync методами
vk.apiSync = {};
vk.api = {};

for(var m in vk.methods){
	m = vk.methods[m];
	if(!vk.api[m.split(".")[0]])vk.api[m.split(".")[0]] = {};
	if(!vk.apiSync[m.split(".")[0]])vk.apiSync[m.split(".")[0]] = {};
	vk.api[m.split(".")[0]][m.split(".")[1]] = (function(method){
		return function(data,callback,place){
			return vk._api(method,data,callback,place);
		}
	}
	)(m);
	vk.apiSync[m.split(".")[0]][m.split(".")[1]] = (function(method){
		return function(data){
			return vk._apiSync(method,data);
		}
	}
	)(m);
}

return vk;
};

if(typeof module == "undefined"){
	var vk = module_vk();
	
	
	var CallbackRegistry = {}; // реестр для jsonp
	var cb = vk.default_callback;
	function getXmlHttp(){
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
}

function loadScript(url){
    var xhrObj = getXmlHttp();
    // open and send a synchronous request
    xhrObj.open('GET', url, false);
    xhrObj.send('');
    // add the returned content to a newly created script tag
    var se = document.createElement('script');
    se.type = "text/javascript";
    se.text = xhrObj.responseText;
    document.getElementsByTagName('head')[0].appendChild(se);
}
	
}else{
	module.exports = module_vk;
}