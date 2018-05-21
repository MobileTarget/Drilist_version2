	app
		.service('myService', function () {
			var self = this;

			this.apiResult = {};

			this.getTemplateHtml = function (part) {
				if(part === "detail"){
					var apiResult = self.getApiResult();
					var temp_str = "apiResult.task.template." + part + ".html";
					var template_html = eval(temp_str);

					// console.log(">>>> inside getTempalteHtml fn...", template_html);
					return template_html;
				}else{

					var apiResult = self.getApiResult();
					var temp_str = "apiResult.task.template." + part + ".html";
					var template_html = eval(temp_str);
					
					// console.log(">>>> inside getTempalteHtml fn...", template_html);
					return template_html;
					
					// return "";
				}

			};

			this.getTemplateJs = function () {
				var apiResult = self.getApiResult();
				var template_js = "apiResult.task.template.header.js";
				template_js = eval(template_js);
				//console.log(template_js);
				return template_js;
			};
			this.getDetail = function () {
				var getDetailApiResult = self.getApiResult(),
					detailData = getDetailApiResult.detail;
				return detailData;
			};
			this.getApiResult = function () {
				return self.apiResult;
			};
		}).service('httpRequestHandler',function($http){
			this.getData = function(endPoint, method, params ,callback){
				var url="https://dev-platform2.mybluemix.net/api/"+endPoint;
			// console.log("INSERIVE==",parm); return'this';

			if(method==='get'){
				$http.get(url, params).then(function(res){

	                callback(null, res);
	                 
	           })
			}else{
				$http.post(url, params).then(function(res) {

	                callback(null, res);
	                 
	           })
			}
		 	
			}
		}).service('utilityService', function($ionicLoading, $ionicPopup, $loading) {
			var self = this;
			var appName = "Dri Lists";
			self.sortByKey = function(array, key, order) {
				return array.sort(function(a, b) {
					var x = a[key];
					var y = b[key];
					if (order == "asc")
						return ((x < y) ? -1 : ((x > y) ? 1 : 0));
					else
						return ((x > y) ? -1 : ((x < y) ? 1 : 0));
				});
			};
			self.showAlert = function(txt, title) {
				console.log("alert==",txt, title);
				if (title === void 0) {
					title = appName;
				}
				var alertPopup = $ionicPopup.alert({
					title: title,
					template: txt
				});
				return alertPopup;
			};
			self.showConfirm = function(title, message, cancelText, okText) {
				if (!title) {
					title = appName;
				}
				var confirmPopup = $ionicPopup.confirm({
					title: title,
					template: message,
					cancelText: cancelText,
					okText: okText
				});
				return confirmPopup;
			};
			self.busyState = false;
			self.setBusy = function(state, message, key) {
				if (state === this.busyState) {
					return;
				}
				key = key || "loading";
				this.busyState = state;
				if (this.busyState) {
					var text = message || 'Loading...';
					$loading.start(key);
					$loading.setDefaultOptions({
						active: true,
						text: text
					});
				} else {
					$loading.finish(key);
				}
			};
			self.loadingState = false;
			self.setLoading = function(state, message) {
				if (state === this.loadingState) {
					return;
				}
				this.loadingState = state;
				if (this.loadingState) {
					$ionicLoading.show({
						template: message || 'Loading...'
					});
				} else {
					$ionicLoading.hide();
				}
			};
			self.getJsonFromUrl = function(location) {
				var query = location.search.substr(1);
				var result = {};
				query.split("&").forEach(function(part) {
					var item = part.split("=");
					result[item[0]] = decodeURIComponent(item[1]);
				});
				return result;
			};
			self.isEmpty = function(obj) {
				if (Object.prototype.toString.call(obj) === "[object Object]") {
					if (Object.keys(obj).length) {
						return false;
					} else {
						return true;
					}
				} else if (Object.prototype.toString.call(obj) === "[object Array]") {
					if (obj.length) {
						return false;
					} else {
						return true;
					}
				} else {
					if (obj) {
						return false;
					} else {
						return true;
					}
				}
			};
			self.isExists = function(item, container) {
				if (Object.prototype.toString.call(container) === "[object Object]") {
					return (item in container);
				} else if (Object.prototype.toString.call(container) === "[object Array]") {
					return (container.indexOf(item) > -1);
				} else {
					return false;
				}
			};
			self.getUserGroups = function(obj) {
				if (self.isEmpty(obj.data)) {
					return [];
				} else {
					if (self.isEmpty(obj.data.groups)) {
						return [];
					} else {
						var group_ids = [];
						for (var itr in obj.data.groups) {
							if (itr) {
								group_ids.push(itr);
							}
						}
						return group_ids;
					}
				}
			};
		});
