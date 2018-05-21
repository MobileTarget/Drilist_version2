	app
		.controller('applicationController', applicationControllerFn);

	applicationControllerFn.$inject = ['$scope', '$http', '$timeout', '$loading', 'myService', '$sce', '$compile', '$window', 'utilityService', '$localStorage','httpRequestHandler'];

	function applicationControllerFn($scope, $http, $timeout, $loading, myService, $sce, $compile, $window, utilityService, $localStorage, httpRequestHandler) {
		$scope.page_id = 1;
		$scope.title = "Drilist version 2";
          $scope.user = {
               country_code: "1"   
          };
          
          $scope.config = {
               page_id: $window.localStorage.access_token ? 2 : 1,
               from_page_id: 1,
               task_id: "2_0",
               edit_task_id: "",
               task_name: "Categories",
               child_task_id: "",
          };

          myService.apiResult = {
               task: {
                    template: {
                         header: {
                              html: ''
                         },
                         detail: {
                              html: ''
                         },
                         footer: {
                              html: ''
                         }
                    }
               }
          };
          console.log("$window.localStorage", $window.localStorage)
          utilityService.setLoading(true);

          // myService.apiResult.task.template.detail.html="<ion-content padding=\"true\"><div class=\"wbox\" style=\"padding:30px;\"><h1 style=\"text-align:center;\">Home Page</h1><div style=\"height: 40px;\" class=\"spacer\"></div><ul id=\"homelist\"></ul></div></ion-content>";
          // myService.apiResult.task.template.header.html="<ion-header-bar class=\"bar-stable\">\n\t<button class=\"button button-icon\" ng-click=\"logout()\">\n\t <i class=\"icon ion-log-out\"></i>\n\t</button>\n\t<h1 class=\"title\">{{title}}</h1>\n\t<div class=\"buttons\">\n\t\t<button class=\"button button-icon\" ng-click=\"editUser()\">\n\t\t <i class=\"icon ion-person\"></i>\n\t\t</button>\n\t</div>\n</ion-header-bar>";
          // myService.apiResult.task.template.footer.html="<ion-footer-bar class=\"bar-stable\">\n\t<button class=\"button button-icon\">\n\t <i class=\"icon ion-android-add-circle\"></i>\n\t</button>\n</ion-footer-bar>";
          
          // myService.apiResult.task.template.detail.html="<ion-content padding=\"true\"><div class=\"wbox\" style=\"padding:30px;\"><h1 style=\"text-align:center;\">Home Page</h1><div style=\"height: 40px;\" class=\"spacer\"></div><ul id=\"homelist\"><li>Demo data</li><li>Demo data1</li></ul></div></ion-content>";

          if($window.localStorage.access_token){
               var api_endPoint='list';
               httpRequestHandler.getData(api_endPoint,function(err, res){
                    if(err){

                    }
                    $scope.listData=res.data;  
                     res.data.forEach(function(val, key){
                         // $scope.value ="<li>"+res.data[key].details.value+"</li>";
                         myService.apiResult.task.template.header.html=res.data[key].meta_data.header;
                         myService.apiResult.task.template.footer.html=res.data[key].meta_data.footer;
                         myService.apiResult.task.template.detail.html=res.data[key].meta_data.details;
                         // $scope.detailsLog=res.data[key].meta_data.details;
                         
                         // $scope.detailsCom=res.data[0].meta_data.details;
                         // $scope.headerCon=res.data[0].meta_data.header;
                         // $scope.footerCon=res.data[0].meta_data.footer;

                         // $scope.headerHome="<ion-header-bar class=\"bar-stable\">\n\t<button class=\"button button-icon\" ng-click=\"logout()\">\n\t <i class=\"icon ion-log-out\"></i>\n\t</button>\n\t<h1 class=\"title\">{{title}}</h1>\n\t<div class=\"buttons\">\n\t\t<button class=\"button button-icon\" ng-click=\"editUser()\">\n\t\t <i class=\"icon ion-person\"></i>\n\t\t</button>\n\t</div>\n</ion-header-bar>";
                         
                         $scope.setPage();
                         utilityService.setLoading(false);

                    })

               });
                    

               // $http.get("https://dev-platform2.mybluemix.net/list").then(function(res){
               //      $scope.listData=res.data;
               //      console.log("List response==",res.data);
               //      utilityService.setLoading(false);

               //      res.data.forEach(function(val, key){
               //           $scope.value ="<li>"+res.data[key].details.value+"</li>";
               //           myService.apiResult.task.template.header.html=res.data[key].meta_data.header;
               //           myService.apiResult.task.template.footer.html=res.data[key].meta_data.footer;
               //           myService.apiResult.task.template.detail.html=res.data[key].meta_data.details;
               //           $scope.detailsLog=res.data[key].meta_data.details;
                         
               //           $scope.detailsCom=res.data[0].meta_data.details;
               //           $scope.headerCon=res.data[0].meta_data.header;
               //           $scope.footerCon=res.data[0].meta_data.footer;

               //           $scope.headerHome="<ion-header-bar class=\"bar-stable\">\n\t<button class=\"button button-icon\" ng-click=\"logout()\">\n\t <i class=\"icon ion-log-out\"></i>\n\t</button>\n\t<h1 class=\"title\">{{title}}</h1>\n\t<div class=\"buttons\">\n\t\t<button class=\"button button-icon\" ng-click=\"editUser()\">\n\t\t <i class=\"icon ion-person\"></i>\n\t\t</button>\n\t</div>\n</ion-header-bar>";
               //           // $scope.footerCon=res.data[0].meta_data.footer;
               //           console.log("LIST with LI==", $scope.value)

               //           // $timeout(function(){
               //           //      // alert()
               //           //      $("#homelist").html($scope.value);
               //           // }, 500);
               //           $scope.setPage();
               //      },function(err){
               //           console.log("error from API1",err);
               //      })  
               // })

               // myService.apiResult.task.template.detail.html = $scope.detailsHome;
               // myService.apiResult.task.template.header.html = $scope.headerHome;
               // myService.apiResult.task.template.footer.html = "";
          }else{
               $http.get("https://dev-platform2.mybluemix.net/loginscreen").then(function(res){
                    
                    // utilityService.loadingState=true;
                    res.data.forEach(function(val, key){
                         $scope.head=res.data[key].meta_data.header;
                         $scope.foot=res.data[key].meta_data.footer;
                         myService.apiResult.task.template.detail.html=res.data[key].meta_data.details;
                         // $scope.detailsLog=res.data[key].meta_data.details;
                         
                         // $scope.detailsCom=res.data[0].meta_data.details;
                         // $scope.headerCon=res.data[0].meta_data.header;
                         // $scope.footerCon=res.data[0].meta_data.footer;

                         // $scope.detailsHome="<ion-content padding=\"true\"><div class=\"wbox\" style=\"padding:30px;\"><h1 style=\"text-align:center;\">Home Page</h1><div style=\"height: 40px;\" class=\"spacer\"></div><ul><li>Demo data</li><li>Demo data1</li></ul></div></ion-content>";
                         // $scope.headerHome="<ion-header-bar class=\"bar-stable\">\n\t<button class=\"button button-icon\" ng-click=\"logout()\">\n\t <i class=\"icon ion-log-out\"></i>\n\t</button>\n\t<h1 class=\"title\">{{title}}</h1>\n\t<div class=\"buttons\">\n\t\t<button class=\"button button-icon\" ng-click=\"editUser()\">\n\t\t <i class=\"icon ion-person\"></i>\n\t\t</button>\n\t</div>\n</ion-header-bar>";
                         // $scope.footerCon=res.data[0].meta_data.footer;



                         // $loading.start('loading');    
                         // $timeout(function(){
                              

                              //If user logged in then show static home page
                             

                         $scope.setPage();
                         utilityService.setLoading(false);

                         // }, 400);
                    },function(err){
                         console.log("error from API1",err);
                    })  
               })

          }

          
               
          $scope.setPage = function () {
               $scope.header_html = myService.getTemplateHtml("header");
               $scope.detail_html = myService.getTemplateHtml("detail");
               $scope.footer_html = myService.getTemplateHtml("footer");

               $scope.$evalAsync(function () {
                    $scope.html = $sce.trustAsHtml($scope.header_html + $scope.detail_html + $scope.footer_html);
               });
          };

          $scope.login = function(user) {
               // return;
               var number = user?user.phone:'' ;
               if (!number) {
                    utilityService.showAlert("Please enter phone number").then(function(res) {
                         $timeout(function() { $("#phone").focus(); }, 100);
                    });
                    return false;
               }
               
               number = number.replace(/[- )(]/g,'').trim();
               var reg = new RegExp('^(0|[1-9][0-9]*)$');
               
               if(!reg.test(number)){
                    utilityService.showAlert("Please enter valid phone number").then(function(res) {
                         $timeout(function() { $("#phone").focus(); }, 100);
                    });
                    return false;
               }

               number= user.country_code + number ;
               $scope.number= number ;
               //number = number ;
               // console.log("number in login api",$scope.number, number);

               var endpoint = "https://dev-platform2.mybluemix.net/api/login";
               var parameters = {
                    phone:    number,
                    access_token:  $window.localStorage.access_token,
                    device_id : $window.localStorage.device_id ,
                    push_accepted: 1
               };
               utilityService.setLoading(true);

               if(number == $window.localStorage.logger_user_phone){
                    utilityService.setBusy(true);
                    $http.post(endpoint, parameters).then(function(res) {
                         var res_data = res.data;
                         console.log("login res_data>>>", res_data);
                         $window.localStorage.access_token = res_data.access_token;
                         myService.apiResult = res_data;
                         utilityService.setBusy(false);
                         if(res_data.page_id === 2){
                              $window.localStorage.logger_user_phone = number;
                         }
                         $scope.goPage(res_data.page_id);
                         utilityService.setLoading(false);

                    });
               }else{
                    utilityService.setBusy(true);
                    $http.post(endpoint, parameters).then(function(res) {
                         var res_data = res.data;
                         console.log("login res_data>>>", res_data);
                         $window.localStorage.access_token = res_data.access_token;
                         $scope.verificationCode = res_data.code;
                         // myService.apiResult = res_data;
                         utilityService.setBusy(false);
                         if(res_data.page_id === 2){
                              $window.localStorage.logger_user_phone = number;
                         }
                         myService.apiResult.task.template.detail.html = $scope.detailsCom;
                         myService.apiResult.task.template.header.html = $scope.headerCon;
                         myService.apiResult.task.template.footer.html = $scope.footerCon;
                         $scope.setPage();
                         utilityService.setLoading(false);

                         // $scope.goPage(res_data.page_id);
                    });
               }
          };
          

          $scope.verificationBox = function(event, box){
               utilityService.setLoading(false);
               var code=[];
               var box = $("#"+box).val();
               $(".verification-input").each(function(val, key){
                    if($(this).find("input").val()){
                        code.push($(this).find("input").val()); 
                    }
               })
               if(code.length==4){

               var endpoint = "https://dev-platform2.mybluemix.net/api/verify";
               var parameters = {
                   phone:    $scope.number,
                   code:  code.join(""),
                   device_id :  1, //$window.localStorage.device_id
                   push_accepted: 1
               };
               utilityService.setLoading(true);
               $http.get(endpoint, {params: parameters}).then(function(res) {
                    console.log("verify response==", res);
                    if(res.data.access_token){
                         $window.localStorage.access_token=res.data.access_token?res.data.access_token:'';
                         myService.apiResult.task.template.detail.html = $scope.detailsHome;
                         myService.apiResult.task.template.header.html = $scope.headerHome;
                         myService.apiResult.task.template.footer.html = "";
                         $scope.setPage();
                         utilityService.setLoading(false);
                    }
                    
               });
    
               }

          }

          $scope.logout = function(){
               $window.localStorage.access_token='';
               myService.apiResult.task.template.detail.html = $scope.detailsLog;
               myService.apiResult.task.template.header.html = "";
               myService.apiResult.task.template.footer.html = "";
               $scope.setPage();
          }
          $scope.goPage = function(page_id) {
               if (page_id !== 1 || page_id !== 11) {
                    $scope.html = $scope.header_html + $scope.footer_html;
               }
               utilityService.setBusy(true);
               $scope.config.page_id = page_id;
               $scope.details = [];
               $scope.data = {};

               if ($scope.is_test) {
                    for (ind = 0; ind < samplePages.length; ind++) {
                         if (samplePages[ind].page_id == page_id) {
                              myService.apiResult = samplePages[ind];
                              break;
                         }
                    }
                    $scope.setPage();
               } else {
                    var request_data = {
                         app: {
                              api: {
                                   "api_mode": "GET",
                                   "api_type": "get_page",
                                   "type": "get_page",
                                   "content": {
                                        "page_id": page_id,
                                        "access_token": $window.localStorage.access_token
                                   }
                              }
                         },
                         platform: {},
                         other_users: {}
                    };
                    // $scope.common_request_handler(request_data);
               }
          };

          $scope.common_request_handler = function(request_data) {
               //alert("inside common_request_handler"  + JSON.stringify(request_data));
               //return false;
               CommonRequestHandler.commonHandler($scope, request_data);
          };

          
	}
