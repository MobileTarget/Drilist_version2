	app
		.controller('applicationController', applicationControllerFn);

	applicationControllerFn.$inject = ['$scope', '$http', '$timeout', '$loading', 'myService', '$sce', '$compile', '$window', 'utilityService', '$localStorage','httpRequestHandler'];

	function applicationControllerFn($scope, $http, $timeout, $loading, myService, $sce, $compile, $window, utilityService, $localStorage, httpRequestHandler) {
		$scope.page_id = 1;
		$scope.title = "Drilist version 2";
          $scope.user = {
               country_code: "1"   
          };
          $scope.listData = {};
          
          $scope.config = {
               page_id: $window.localStorage.access_token ? 2 : 1,
               // from_page_id: 1,
               // task_id: "2_0",
               // edit_task_id: "",
               // task_name: "Categories",
               // child_task_id: "",
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

          //Get either login screen or home screen if logged in
          if($window.localStorage.access_token){
               var api_endPoint='homepage';
               var api_method='get';
               var api_params={};
               $scope.childData=[];
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");

                    }
                    if(res.data.success==false){
                         utilityService.showAlert("No child data available for this","Message");
                         utilityService.setLoading(false);
                         
                    }else{
                         $scope.listData = res.data.data; 
                         $scope.listData.currentPageId = res.data.data.header.from_page_id;
                         $scope.listData.new={recordType:''};
                    console.log("response from list API 2==",res.data);
                    // myService.apiResult.task.template.header.html=$scope.listData.header.html;
                    // myService.apiResult.task.template.footer.html=$scope.listData.footer.html;
                    // myService.apiResult.task.template.detail.html=$scope.listData.details.html.html;

                    myService.apiResult.task.template.header.html='<ion-header-bar class="bar-stable"><button class="button button-icon" ng-click="logout()"><i class="icon ion-log-out"></i>     </button>     <h1 class="title">{{title}}</h1>     <div class="buttons">          <button class="button button-icon" ng-click="editUser()">           <i class="icon ion-person"></i>          </button>     </div></ion-header-bar>';
                    myService.apiResult.task.template.footer.html='<p><ion-footer-bar class="bar-stable"> <button class="button button-icon" ng-click="addRecordModel()"> <i class="icon ion-android-add-circle"></i> </button></ion-footer-bar></p>';
                    myService.apiResult.task.template.detail.html='<ion-content padding="true"><div class="wbox" style="padding:30px;"><h1 style="text-align:center;">{{listData.details.html.from_page_name}}</h1><div style="height: 40px;" class="spacer"></div> <ion-list id="homelist"><ion-item ng-repeat="x in listData.details.content" ng-click="showChild(x.to_page_id, listData.header.from_page_id)" can-swipe="true">{{x.content.key==="v1"?"":x.content.key+": "}} {{x.content.value}} <ion-option-button class="ion-minus-circled button-negative" ng-click="deleteRecord(x.id)"></ion-option-button> <ion-option-button class="button-info" ng-click="editRecord(x, $index)"> Edit </ion-option-button> </ion-item></ion-list> </div></ion-content>';
                    
                    $scope.setPage();
                    utilityService.setLoading(false);
               }

               });
                 
          }else{
              
               var api_endPoint='loginscreen';
               var api_method='get';
               var api_params={};
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                     console.log("loginscreen---",res)
                    res.data.forEach(function(val, key){
                         if(val.details.type=='login'){
                              $scope.head=res.data[key].meta_data.header;
                              $scope.foot=res.data[key].meta_data.footer;
                              myService.apiResult.task.template.detail.html=res.data[key].meta_data.details;
                              $window.localStorage.loginDetails=res.data[key].meta_data.details;
                         }else{
                              $window.localStorage.detailsCom=val.meta_data.details;
                              $window.localStorage.headerCon=val.meta_data.header;
                              $window.localStorage.footerCon=val.meta_data.footer;
                         }
                    },function(err){
                         console.log("error from API1",err);
                    })  


                    $scope.setPage();
                    utilityService.setLoading(false);
               })

          }

          //render HTML 
          $scope.setPage = function () {
               $scope.header_html = myService.getTemplateHtml("header");
               $scope.detail_html = myService.getTemplateHtml("detail");
               $scope.footer_html = myService.getTemplateHtml("footer");

               $scope.$evalAsync(function () {
                    $scope.html = $sce.trustAsHtml($scope.header_html + $scope.detail_html + $scope.footer_html);
                    // console.log("Full html", $scope.header_html + $scope.detail_html + $scope.footer_html);
               });
          };

          // handle login button click
          $scope.login = function(user) {
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
               var api_endPoint = "login";
               var api_params = {
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
                         $scope.goPage(res_data.page_id);
                         utilityService.setLoading(false);

                    });
               }else{
                    var api_method='post';
                    httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");
                    }
                    var res_data = res.data;
                    console.log("login res_data1>>>", res_data, $scope.number);
                    $scope.verificationCode = res_data.code;
                    myService.apiResult.task.template.detail.html = $window.localStorage.detailsCom;
                    myService.apiResult.task.template.header.html = $window.localStorage.headerCon;
                    myService.apiResult.task.template.footer.html = $window.localStorage.footerCon;
                    $scope.setPage();
                    utilityService.setLoading(false);
                    });
               }
          };

          //handle verification screen
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

               var api_endPoint = "verify";
               var api_params = {params: {
                   phone:    $scope.number,
                   code:  code.join(""),
                   device_id :  1, //$window.localStorage.device_id
                   push_accepted: 1
               }};
               var api_method='get';
               utilityService.setLoading(true);
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");
                    }
                    console.log("verify response==", res);
                    if(res.data.access_token){
                         $window.localStorage.access_token=res.data.access_token?res.data.access_token:'';
                         $window.localStorage.user_id=res.data.user_id?res.data.user_id:'';
                         $scope.listAfterVerification();
                    }
                    
               });
    
               }

          }

          //Rander list on home page after verificaton
          $scope.listAfterVerification = function(){
               var api_endPoint='homepage';
               var api_method='get';
               var api_params={};
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");
                    }

                    $scope.listData=res.data.data;  
                    $scope.listData.currentPageId = res.data.data.header.from_page_id;
                    myService.apiResult.task.template.header.html=$scope.listData.header.html;
                    myService.apiResult.task.template.detail.html=$scope.listData.details.html.html;
                    myService.apiResult.task.template.footer.html=$scope.listData.footer.html;
                    $scope.setPage();
                    utilityService.setLoading(false);
               });
          }

          //When user logout
          $scope.logout = function(){
               console.log("coming in last function logout" , $window.localStorage.loginDetails)
               
               $window.localStorage.access_token='';
               myService.apiResult.task.template.detail.html = $window.localStorage.loginDetails;
               myService.apiResult.task.template.header.html = "";
               myService.apiResult.task.template.footer.html = "";
               $scope.setPage();
          }

          //run on clikcing of + icon from footer
          $scope.addRecordModel = function(){
               console.log("add record");
               $scope.recordType='abc';
               myService.apiResult.task.template.detail.html = '<ion-content padding="true"><div class="wbox" style="padding:30px;"><h1 style="text-align:center;">Add Record</h1><div style="height: 40px;" class="spacer"></div> <label class="item item-input item-select">    <div class="input-label">        &nbsp;    </div>    <select ng-model="listData.new.recordType">        <option selected>Select</option>        <option value="text">Text</option>        <option value="number" >Number</option>    </select></label> <button class="button button-stable button-block" id="login-button" ng-click="selectType(listData.new.recordType)">NEXT</button> </div></ion-content>';
               $scope.setPage();
               utilityService.setLoading(false);
          }

          //show template to select whcih type of record user want to create
          $scope.selectType = function(num){

               if($scope.listData.new.recordType=='number'){
                    myService.apiResult.task.template.detail.html = '<ion-content padding="true"><div class="wbox" style="padding:30px;"><h1 style="text-align:center;">Add Record</h1><div style="height: 40px;" class="spacer"></div>    <div class = "list">   <label class = "item item-input"> Key :    <input type = "text" ng-model="listData.new.key" />   </label>   <label class = "item item-input">Value:   <input type = "number" ng-model="listData.new.value" /> </label>   </div> <button class="button button-stable button-block" id="login-button" ng-click="createRecord()">Save</button> </div></ion-content>';
               }else{
                    myService.apiResult.task.template.detail.html = '<ion-content padding="true"><div class="wbox" style="padding:30px;"><h1 style="text-align:center;">Add Record</h1><div style="height: 40px;" class="spacer"></div>    <div class = "list">   <label class = "item item-input"> Key :    <input type = "text" ng-model="listData.new.key" />   </label>   <label class = "item item-input">Value:      <input type = "text" ng-model="listData.new.value" /> </label>   </div> <button class="button button-stable button-block" id="login-button" ng-click="createRecord()">Save</button> </div></ion-content>';
               }
               
               $scope.setPage();
               utilityService.setLoading(false);
          }

          //save record to DB
          $scope.createRecord = function(){
               console.log("saving data", $scope.listData);
               var api_endPoint = "update";
               var api_params = {params: {
                   record:    $scope.listData.new,
                   user_id: $window.localStorage.user_id,
                   page_id: $scope.listData.currentPageId,
                   action: 'create'
               }};
               console.log("After saving data rendering list==",$scope.listData);
               var api_method='post';
               utilityService.setLoading(true);
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){

                    if(err){
                         console.log("error from the API");
                    }

                    //render list after saving record
                    if($scope.listData.currentPageId=='page1'){
                         var api_endPoint='homepage';
                         var api_method='get';
                         var api_params={};
                         $scope.childData=[];
                    }else{
                         var api_endPoint = "getchild";
                         var api_params = {params: {
                             to_page_id:    $scope.listData.currentPageId,
                             from_page_id: $scope.listData.header.from_page_id,
                             // from_page_name: from_page_name,
                             user_id: $window.localStorage.user_id
                         }};   
                         var api_method='get';
                    }
                    

                    httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, list){
                         if(err){
                              console.log("error from the API");

                         }
                         console.log("response from list API==",$window.localStorage);
                         if(list.data.success==false){
                              utilityService.showAlert("No child data available for this","Message");
                              utilityService.setLoading(false);
                              
                         }else{
                              $scope.listData=list.data.data; 
                         
                         console.log("response from list API 2==",list.data);
                         myService.apiResult.task.template.detail.html = $scope.listData.details.html.html;
                         myService.apiResult.task.template.header.html=$scope.listData.header.html;
                         $scope.setPage();
                         utilityService.setLoading(false);

                         }
                    })
               });

          }

          //show list child
          $scope.showChild = function(pageId, from_page_id, from_page_name){
               utilityService.setLoading(true);
               console.log("page id",pageId, from_page_id, from_page_name);

               
               var api_endPoint = "getchild";
               var api_params = {params: {
                   to_page_id:    pageId,
                   from_page_id: from_page_id,
                   from_page_name: from_page_name,
                   user_id: $window.localStorage.user_id
               }};

               var api_method='get';

               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");
                    }
                    
                    console.log("child response==", res.data);
                    if(res.data.success==false){
                         utilityService.showAlert("No child data available for this","Message");
                         utilityService.setLoading(false);
                         
                    }else{
                         $scope.listData=res.data.data; 
                         $scope.listData.currentPageId = pageId;
                         // myService.apiResult.task.template.header.html=$scope.listData.header.html;
                         // myService.apiResult.task.template.detail.html=$scope.listData.details.html.html;

                         myService.apiResult.task.template.header.html='<ion-header-bar class="bar-stable"> <button class="button button-icon" ng-click="goPage(listData.header.from_page_id)"> <i class="icon ion-ios-arrow-back">Back</i> </button> <h1 class="title">{{title}}</h1> <div class="buttons"> <button class="button button-icon" ng-click="editUser()"> <i class="icon ion-person"></i> </button> <button class="button button-icon" ng-click="sortDetail()"> </button> </div></ion-header-bar>';
                         myService.apiResult.task.template.detail.html='<ion-content padding="true"><div class="wbox" style="padding:30px;"><h1 style="text-align:center;">{{listData.details.html.from_page_name}}</h1><div style="height: 40px;" class="spacer"></div> <ion-list id="homelist"><ion-item ng-repeat="x in listData.details.content" ng-click="showChild(x.to_page_id, listData.header.from_page_id)" can-swipe="true">{{x.content.key==="v1"?"":x.content.key+": "}} {{x.content.value}} <ion-option-button class="ion-minus-circled button-negative" ng-click="deleteRecord(x.id)"></ion-option-button> <ion-option-button class="button-info" ng-click="editRecord(x, $index)"> Edit </ion-option-button> </ion-item></ion-list> </div></ion-content>';
                         
                         $scope.setPage();
                         utilityService.setLoading(false);
                    }
               });

          }
          

          //delete record
          $scope.deleteRecord = function(item){
               console.log("delete child record",item);

               var api_endPoint = "deletechild";
               var api_params = {params: {
                   record_id:    item,
               }};
               var api_method='get';
               utilityService.setLoading(true);
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");
                    }
                    console.log("delete response==", $scope.listData, res.data[0].id);
                    console.log("index==",$scope.listData.details.content.findIndex(item=>item.id==res.data[0].id));
                    $scope.listData.details.content.splice($scope.listData.details.content.findIndex(item=> item.id == res.data[0].id),1)
                    myService.apiResult.task.template.detail.html = $scope.listData.details.html.html;   
                    myService.apiResult.task.template.header.html = $scope.listData.header.html;
                    $scope.setPage();
                    utilityService.setLoading(false);
                    
                    
               });

          }

          //render template to edit record
          $scope.editRecord = function(item, index){
               item.index=index;
               $scope.fromEditPage='edit';
               console.log("edit record", item, $scope.listData);  

               $scope.editValue=item;
               // $scope.editValueIndex=index;

               //Header template for edit screen
               myService.apiResult.task.template.header.html = '<ion-header-bar class="bar-stable"> <button class="button button-icon" ng-click="goPage(fromEditPage)"> <i class="icon ion-ios-arrow-back">Back</i> </button> <h1 class="title">{{title}}</h1> <div class="buttons"> <button class="button button-icon" ng-click="editUser()"> <i class="icon ion-person"></i> </button> <button class="button button-icon" ng-click="sortDetail()"> </button> </div></ion-header-bar>'; 

               if(item.type=='number'){
                    //detail template for edit screen
                    myService.apiResult.task.template.detail.html = '<ion-content padding="true"><div class="wbox" style="padding:30px;"><h1 style="text-align:center;">Home Page</h1><div style="height: 40px;" class="spacer"></div> <div class = "list"> <label class = "item item-input"> <input type = "number" ng-model="editValue.content.value" /> </label> </div> <button class="button button-stable button-block" id="login-button" ng-click="updateRecord(editValue)">Save</button></div></ion-content>';  
               }else{
                    //detail template for edit screen
                    myService.apiResult.task.template.detail.html = '<ion-content padding="true"><div class="wbox" style="padding:30px;"><h1 style="text-align:center;">Home Page</h1><div style="height: 40px;" class="spacer"></div> <div class = "list"> <label class = "item item-input"> <input type = "text" placeholder = "Placeholder 1" ng-model="editValue.content.value" /> </label> </div> <button class="button button-stable button-block" id="login-button" ng-click="updateRecord(editValue)">Save</button></div></ion-content>';  
               }

               // if(item.edit_template){
               //      myService.apiResult.task.template.detail.html = item.edit_template.details;  
               //      myService.apiResult.task.template.header.html = item.edit_template.header; 
               // }
               
               $scope.setPage();
               utilityService.setLoading(false);
          }

          //save user edited data into DB
          $scope.updateRecord = function(item){
               console.log("updating records",item);
               var api_endPoint = "update";
               var api_params = {params: {
                   record:    item,
                   user_id: $window.localStorage.user_id,
                   action: 'update'
               }};
               var api_method='post';
               // utilityService.setLoading(true);
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");
                    }
                    myService.apiResult.task.template.detail.html = $scope.listData.details.html.html;
                    myService.apiResult.task.template.header.html=$scope.listData.header.html;
                    $scope.setPage();
                    utilityService.setLoading(false);
                    
               });
          }
          
          //using to go to previous page
          $scope.goPage = function(page_id) {
               utilityService.setLoading(true);

               console.log("gopage pageid",page_id);

               if(page_id==="edit"){
                    myService.apiResult.task.template.header.html=$scope.listData.header.html;
                    myService.apiResult.task.template.detail.html=$scope.listData.details.html.html;
                    $scope.setPage();
                    utilityService.setLoading(false);
               }else{

               
                    var api_endPoint = "back";
                    var api_params = {params: {
                        back_page_id:    page_id
                    }};

                    var api_method='get';

                    httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                         if(err){
                              console.log("error from the API");
                         }

                         $scope.listData=res.data; 
                         console.log("child response==", $scope.listData);
                         
                    myService.apiResult.task.template.header.html=$scope.listData.header.html;
                    myService.apiResult.task.template.detail.html=$scope.listData.details.html.html;
                    $scope.setPage();
                    utilityService.setLoading(false);
                    })
               }
               

          };


          
	}
