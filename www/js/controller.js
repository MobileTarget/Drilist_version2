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
          $scope.record = false;
          $scope.sortingType = "default"; //for sorting the items
          $scope.showDeleted = true; //for sorting the items
          
          $scope.config = {
               page_id: $window.localStorage.access_token ? 2 : 1,
               
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
               var api_endPoint='master_api_handler';
               // var api_name='homepage';
               var api_method='get';
               var api_params = {params: {
                   user_id: $window.localStorage.user_id,
                   api_name: 'homepage'
               }};
               $scope.childData=[];
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");

                    }
                    console.log("homepage data", res);
                    if(!res.data.success){
                         utilityService.showAlert("No child data available for this","Message");
                         utilityService.setLoading(false);
                         
                    }else{
                         $scope.listData = res.data.data; 
                         $scope.listData.currentPageId = res.data.data.header.current_page_id;
                         $scope.listData.new={recordType:''};
                         $scope.sortingClass = $scope.sortingType=='default'?'ion-toggle':'ion-toggle-filled';
                         myService.apiResult.task.template.header.html=$scope.listData.header.html;
                         myService.apiResult.task.template.footer.html=$scope.listData.footer.html;
                         myService.apiResult.task.template.detail.html=$scope.listData.details.html.html;
                         $scope.setPage();
                         utilityService.setLoading(false);
                    }

               });
                 
          }else{
              
               var api_endPoint='loginscreen';
               var api_method='get';
               var api_params={};
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
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
               var api_endPoint='master_api_handler';
               var api_method='get';
               var api_params = {params: {
                   user_id: $window.localStorage.user_id,
                   api_name: 'homepage'
               }};
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");
                    }
                    console.log("listAfterVerification", res);

                    $scope.listData=res.data.data;  
                    $scope.listData.currentPageId = res.data.data.header.current_page_id;
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


          //switch between deleted records and normal records
          $scope.showdeletedRecords = function(){
               var api_endPoint = "master_api_handler";
               var api_params = {params: {
                    user_id: $window.localStorage.user_id,
                    pageId: $scope.listData.currentPageId,
                    from_page_name: $scope.listData.header.from_page_name,
                    show_deleted: $scope.showDeleted,
                    current_page_id: $scope.listData.currentPageId,
                    api_name: 'showdeletedRecords'
               }}
               var api_method='get';
               utilityService.setLoading(true);

               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");
                         utilityService.showAlert("Error from the API").then(function(res) {
                              // $timeout(function() { $("#phone").focus(); }, 100);
                         });
                         utilityService.setLoading(false);
                         return false;
                    }

                    console.log("response from delete API", res);
                    $scope.showDeleted = $scope.showDeleted===true?false:true;

                    if(res.data.success==false){
                         utilityService.showAlert("No child data available for this","Message");
                         utilityService.setLoading(false);
                         
                    }else{
                         res.data.data.footer = $scope.listData.footer;
                         $scope.listData = res.data.data; 
                         $scope.listData.currentPageId = res.data.data.header.current_page_id;
                         myService.apiResult.task.template.detail.html = $scope.listData.details.html.html;
                         myService.apiResult.task.template.header.html=$scope.listData.header.html;
                         $scope.setPage();
                    }
                    utilityService.setLoading(false);


               })
          }

          //update the record in the DB when click on undo deleted record.
          $scope.undoDeleted = function(item){
               utilityService.showConfirm("Undo Deleted","Are you sure you want to undo this item?","Cancel","Ok").then(function(res) {
                    if(res){
                         var api_endPoint = "update";
                         var api_params = {params: {
                             record:    item,
                             user_id: $window.localStorage.user_id,
                             action: 'update',
                             undo_deleted: true
                         }};
                         var api_method='post';
                         console.log("undo deleted record", item);
                         utilityService.setLoading(true);
                         httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                              if(err){
                                   console.log("error from the API");
                              }
                              var indx = $scope.listData.details.content.findIndex(list=> list.id == item.id);
                              $scope.listData.details.content.splice(indx,1);
                              utilityService.setLoading(false);
                              
                         });
                    }
               });
          }
          //switch between user and default sort order
          $scope.sorting = () => {
               var api_endPoint = "master_api_handler";
               var api_params = {params: {
                   user_id: $window.localStorage.user_id,
                   sorting: $scope.sortingType,
                   pageId: $scope.listData.currentPageId,
                   from_page_name: $scope.listData.header.from_page_name,
                   api_name: "sorting"
               }};
               var api_method='get';
               utilityService.setLoading(true);
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");
                         utilityService.showAlert("Error from the API").then(function(res) {
                              // $timeout(function() { $("#phone").focus(); }, 100);
                         });
                         utilityService.setLoading(false);
                         return false;
                    }
                    console.log("response from sorting API", res);
                    $scope.sortingType = $scope.sortingType==='default'?'user':'default';

                    if(res.data.success==false){
                         utilityService.showAlert("No child data available for this","Message");
                         utilityService.setLoading(false);
                         
                    }else{
                         $scope.listData = res.data.data; 
                         $scope.listData.currentPageId = res.data.data.header.from_page_id;
                         $scope.sortingClass = $scope.sortingType=='default'?'ion-toggle':'ion-toggle-filled';
                         myService.apiResult.task.template.detail.html = $scope.listData.details.html.html;
                         myService.apiResult.task.template.header.html=$scope.listData.header.html;
                         // $scope.setPage();
                    }
                    utilityService.setLoading(false);
                    
               });


          }

          //runs when drag items up and down
          $scope.reorderItem = function (item, from, to) {

               $scope.listData.details.content.splice(from, 1);
               $scope.listData.details.content.splice(to, 0, item);
               var beforeItem=0;
               var diff=0;
               $scope.renumberAll = false;
               if(to==0){
                    if(!$scope.listData.details.content[to+1].seq){
                         var pos = 0;
                         $scope.listData.details.content.forEach(function(val, key){
                              pos = pos+1000;
                              val.seq = pos;
                              $scope.renumberAll=true;
                         })
                    }else{
                         diff = $scope.listData.details.content[to+1].seq/2;
                         $scope.listData.details.content[to].seq=diff;  
                    }
               }else if(Object.keys($scope.listData.details.content).length-1==to){

                    if(!$scope.listData.details.content[to-1].seq){
                         var pos = 0;
                         $scope.listData.details.content.forEach(function(val, key){
                              pos = pos+1000;
                              console.log("draggedtolast", val);
                              val.seq = pos;
                              $scope.renumberAll=true;
                         })
                    }else{
                         beforeItem = $scope.listData.details.content[to-1].seq+1000;
                         console.log("when dragged to last", $scope.listData.details.content[to-1].seq);
                         $scope.listData.details.content[to].seq=beforeItem;
                    }
               }else{
                    if(!$scope.listData.details.content[to-1].seq || !$scope.listData.details.content[to+1].seq){
                         var pos = 0;
                         $scope.listData.details.content.forEach(function(val, key){
                              pos = pos+1000;
                              console.log("draggedtomiddel", val);
                              val.seq = pos;
                              $scope.renumberAll=true;
                         })
                    }else{
                         beforeItem = $scope.listData.details.content[to-1].seq;
                         diff = ($scope.listData.details.content[to+1].seq - $scope.listData.details.content[to-1].seq)/2;
                         $scope.listData.details.content[to].seq=beforeItem+diff;  
                    }
                    
               }
               console.log("after sec change",$scope.listData.details.content)

               //updating the orders of items after reordering
               var api_endPoint = "update";
               var api_params = {params: {
                   record:     $scope.renumberAll?$scope.listData.details.content:$scope.listData.details.content[to],
                   user_id: $window.localStorage.user_id,
                   action: 'update',
                   updateField: 'seq',
                   renumberAll: $scope.renumberAll
               }};
               var api_method='post';
               utilityService.setLoading(true);

               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");
                    }
                    utilityService.setLoading(false);
                    
               });

               

          }
          

          //run on clikcing of + icon from footer, it display the template with pulldown with different types such as text, number, list, boolean etc
          $scope.addRecordModel = function(){
               console.log("add record");
               myService.apiResult.task.template.detail.html=$scope.listData.footer.add_record_page_template;
               $scope.setPage();
               utilityService.setLoading(false);
          }

          //add key and values to dropdown type record
          $scope.Add = function() {
               console.log("add to dropdown");
               if(document.getElementById("txtValue").value){
                    var ddl = document.getElementById("typeDropdown");
                    var option = document.createElement("OPTION");
                    option.innerHTML = document.getElementById("txtText").value;
                    // option.innerHTML = document.getElementById("txtValue").value;
                    option.value = document.getElementById("txtValue").value;
                    ddl.options.add(option);
               }
               
          }

          //save record to DB
          $scope.createRecord = function(){

               //get dropdown all values so we can save it in DB
               if($scope.listData.new.recordType=='boolean'){
                    $scope.listData.new.value = [];
                    $("#typeDropdown > option").each(function(){
                         console.log("select values",$(this).val(), $(this).text());
                         if($(this).text()){
                              $scope.listData.new.value.push($(this).text())
                         }
                         if(!$scope.listData.new.default){
                              $scope.listData.new.default=$(this).text()
                         }
                         

                    })
               }


               $scope.listData.new.seq = $scope.listData.details.content.length?$scope.listData.details.content[$scope.listData.details.content.length-1].seq+1000:1000;
               var api_endPoint = "update";
               var api_params = {params: {
                   record:    $scope.listData.new,
                   user_id: $window.localStorage.user_id,
                   page_id: $scope.listData.currentPageId,
                   action: 'create',
                   from_page_id: $scope.listData.header.from_page_id
               }};

               
               
               var api_method='post';
               utilityService.setLoading(true);

               //creating new record
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){

                    if(err){
                         console.log("error from the API");
                    }
                   console.log("After saving data rendering list==",res);
                    //render list after saving record
                    if($scope.listData.currentPageId=='page1'){
                         var api_endPoint='master_api_handler';
                         var api_method='get';
                         var api_params = {params: {
                             user_id: $window.localStorage.user_id,
                             api_name: "homepage"
                         }};
                         $scope.childData=[];
                    }else{
                         var api_endPoint = "master_api_handler";
                         var api_params = {params: {
                             to_page_id:    $scope.listData.currentPageId,
                             from_page_id: $scope.listData.header.from_page_id,
                             // from_page_name: from_page_name,
                             user_id: $window.localStorage.user_id,
                             current_page_id: $scope.listData.currentPageId,
                             api_name: "getchild"
                         }};   
                         var api_method='get';
                    }
                    

                    //after creating the new record get the updated list
                    httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, list){
                         if(err){
                              console.log("error from the API");

                         }
                         if(list.data.success==false){
                              utilityService.showAlert("No child data available for this","Message");
                              utilityService.setLoading(false);
                              
                         }else{
                              $scope.listData=list.data.data; 
                              console.log("response from list API 2==",list.data);
                              $scope.listData.currentPageId = list.data.data.header.current_page_id;
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
               console.log("CHILDPAGES",pageId, from_page_id, from_page_name);

               
               var api_endPoint = "master_api_handler";
               var api_params = {params: {
                   to_page_id:    pageId,
                   from_page_id: $scope.listData.header.current_page_id,
                   from_page_name: from_page_name,
                   user_id: $window.localStorage.user_id,
                   current_page_id: pageId,
                   api_name: 'getchild'
               }};

               var api_method='get';

               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");
                    }
                    
                    console.log("child response==", $scope.listData, res);
                    res.data.data.footer = $scope.listData.footer;
                    if(res.data.success==false){
                         
                         utilityService.setLoading(false);
                         $scope.listData=res.data.data; 
                         $scope.listData.currentPageId = pageId;
                         myService.apiResult.task.template.header.html=$scope.listData.header.html;
                         console.log("No Data Founs",$scope.listData);
                         myService.apiResult.task.template.detail.html=$scope.listData.details.html.html;
                    }else{
                         $scope.listData=res.data.data; 
                         $scope.listData.currentPageId = pageId;
                         myService.apiResult.task.template.header.html=$scope.listData.header.html;
                         myService.apiResult.task.template.detail.html=$scope.listData.details.html.html;

                    }
                    $scope.setPage();
                    utilityService.setLoading(false);
               });

          }
          
          
          //delete record
          $scope.deleteRecord = function(item){
               console.log("delete child record",item);

               //employee can not be deleted
               if(item=='663ffed9a8b3e19d062dfcfac4a639a1'){
                    return;
               }
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
                    // console.log("index==",$scope.listData.details.content.findIndex(item=>item.id==res.data[0].id));
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
               $scope.noApiHit='noApiHit';
               console.log("edit record", item, $scope.listData);  

               $scope.editValue=item;
               if(item.edit_template){
                    myService.apiResult.task.template.detail.html = item.edit_template.details;  
                    myService.apiResult.task.template.header.html = item.edit_template.header; 
               }
               
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

               console.log("editing data", item);
               utilityService.setLoading(true);
               httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                    if(err){
                         console.log("error from the API");
                    }
                    console.log("after Update", res, res.data[0].id); 
                    var indx = $scope.listData.details.content.findIndex(list=> list.id == item.id);
                    $scope.listData.details.content[indx].id = res.data[0].id;
                    console.log("after Update2", $scope.listData); 
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
               $scope.record = false;
               $scope.showDeleted = true; //this variable is used to show deleted records.

               if(page_id==="noApiHit"){
                    myService.apiResult.task.template.header.html=$scope.listData.header.html;
                    myService.apiResult.task.template.detail.html=$scope.listData.details.html.html;
                    $scope.setPage();
                    utilityService.setLoading(false);
               }else{

               
                    var api_endPoint = "master_api_handler";
                    var api_params = {params: {
                        back_page_id:    page_id,
                        user_id: $window.localStorage.user_id,
                        api_name: "back"
                    }};

                    var api_method='get';

                    httpRequestHandler.getData(api_endPoint, api_method, api_params, function(err, res){
                         if(err){
                              console.log("error from the API");
                         }

                         $scope.listData=res.data; 
                         $scope.listData.currentPageId=page_id;
                         console.log("go page response==", $scope.listData, res);
                         
                    myService.apiResult.task.template.header.html=$scope.listData.header.html;
                    myService.apiResult.task.template.detail.html=$scope.listData.details.html.html;
                    $scope.setPage();
                    utilityService.setLoading(false);
                    })
               }
               

          };


          
	}
