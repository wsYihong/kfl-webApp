/**
 * Created by bjwsl-001 on 2017/7/10.
 */
var app=angular.module('kaifanla',['ionic']);
app.config(function($ionicConfigProvider,$stateProvider, $urlRouterProvider){
    //$ionicConfigProvider

    $stateProvider
        .state('start',{
            url:'/start',
            templateUrl:'tpl/start.html'
        })
        .state('main',{
            url:'/main',
            templateUrl:'tpl/main.html',
            controller:'mainCtrl'
        })
        .state('order',{
            url:'/order/:sum',
            templateUrl:'tpl/order.html',
            controller:'orderCtrl'
        })
        .state('myOrder',{
            url:'/myorder',
            templateUrl:'tpl/myorder.html',
            controller:'myOrderCtrl'
        })
        .state('detail',{
            url:'/detail/:did',
            templateUrl:'tpl/detail.html',
            controller:'detailCtrl'
        })
        .state('cart',{
            url:'/cart',
            templateUrl:'tpl/cart.html',
            controller:'cartCtrl'
        })
        .state('setting',{
            url:'/setting',
            templateUrl:'tpl/setting.html',
            controller:'settingCtrl'
        })

    $urlRouterProvider.otherwise('/start');
})

//能够有加载中的遮盖层，如果不封装该服务就每次都要调用$ionicLoading
app.service('$kflHttp',['$ionicLoading','$http',function($ionicLoading,$http){
    this.sendRequest=function(url,func){
        $ionicLoading.show({
            template:'正在加载中。。',
            duration:2000
        })
        $http.get(url).success(function(data){
            func(data);
            $ionicLoading.hide();
        })
    }
}])

app.controller('bodyCtrl',['$scope','$state',function($scope,$state){
    $scope.jump=function(desPath,args){
        $state.go(desPath,args)
    }
}])


//main页面
app.controller('mainCtrl',['$scope','$kflHttp',function($scope,$kflHttp){
    $scope.inputTxt={kw:''};
    $scope.hasMore=false;

    //$http.get('php/dish_getbupage.php').success(function(data){
    //    $scope.uList=data;
    //})
    $kflHttp.sendRequest('php/dish_getbupage.php',function(data){
        $scope.uList=data;
    })

    //搜索框
    $scope.$watch('inputTxt.kw',function(){
        if( $scope.inputTxt.kw.length>0){
            //$http.get('php/dish_getbykw.php?kw='+ $scope.inputTxt.kw).success(function(data){
            //    if(data.length>0) {
            //        $scope.uList = data;
            //    }
            //})
            $kflHttp.sendRequest('php/dish_getbykw.php?kw='+ $scope.inputTxt.kw,function(data){
                if(data.length>0) {
                           $scope.uList = data;
                }
            })
        }
    })
    //加载更多按钮
    $scope.doMore=function(){
        //$http.get('php/dish_getbupage.php?start='+$scope.uList.length).success(function(data){
        //    if(data.length<5){
        //        $scope.hasMore=true;
        //    }
        //    $scope.uList=$scope.uList.concat(data);
        //})
        $kflHttp.sendRequest('php/dish_getbupage.php?start='+$scope.uList.length,function(data){
            if(data.length<5){
                $scope.hasMore=true;
            }
                $scope.uList=$scope.uList.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete');


        })


    }

}])


//详情页面
app.controller('detailCtrl',['$scope','$kflHttp','$stateParams','$httpParamSerializerJQLike','$ionicPopup',function($scope,$kflHttp,$stateParams,$httpParamSerializerJQLike,$ionicPopup){
    $scope.id=$stateParams.did;
    $kflHttp.sendRequest('php/dish_getbyid.php?did='+$scope.id,function(data){
        $scope.dList=data[0];
    })


    $scope.msg={
        uid:1,
        did:$stateParams.did,
        count:-1
    }

    $scope.addCart=function(){
        var result=$httpParamSerializerJQLike($scope.msg);

        $ionicPopup.confirm({
            title:'信息',
            template:'您确定添加到购物车吗?'
        }).then(function(res) {
                if (res) {
                    $kflHttp.sendRequest('php/cart_update.php?' + result, function (data) {
                        if (data.msg == 'succ') {
                            $ionicPopup.alert({
                                title:'信息',
                                template:'添加成功'
                            })
                        }
                    })
                }

        })
    }

}])


//订单页面
app.controller('orderCtrl',['$scope','$kflHttp','$stateParams','$httpParamSerializerJQLike',function($scope,$kflHttp,$stateParams,$httpParamSerializerJQLike){
    $scope.msg={
        user_name:'',
        phone:'',
        addr:'',
        totalprice:$stateParams.sum,
        userid:1,
        cartDetail:sessionStorage.getItem('cart')
    }

    $scope.sendClick=function(){
        var result=$httpParamSerializerJQLike($scope.msg);
        console.log(result);
        $kflHttp.sendRequest('php/order_add.php?'+result,function(data){
            if(data[0].msg=='succ'){
                $scope.successMsg='下单成功,订单编号为：'+data[0].oid;
            }else{
                $scope.successMsg='下单失败';
            }
        })


    }
}])


//我的用户订单
app.controller('myOrderCtrl',['$scope','$kflHttp',function($scope,$kflHttp){
        $scope.orderList=[];
    $kflHttp.sendRequest('php/order_getbyuserid.php?userid=1',function(result){
        console.log(result);
        $scope.orderList=result.data;


    })
}])


//设置页面
app.controller('settingCtrl',['$scope','$ionicModal',function($scope,$ionicModal){
        $ionicModal
            .fromTemplateUrl('setting.html',{scope:$scope})
            .then(function(result){
                $scope.customModal=result;
              })

                $scope.show=function(){
                    $scope.customModal.show();
                }

                $scope.hide=function(){
                    $scope.customModal.hide();
                }

}])


//购物车页面
app.controller('cartCtrl',['$scope','$kflHttp','$ionicPopup','$ionicModal',function($scope,$kflHttp,$ionicPopup,$ionicModal){
    $scope.cartList=[];

    $kflHttp.sendRequest('php/cart_select.php?uid=1',function(data){
        $scope.cartList=data.data;

    })


    //总和价钱的方法
    $scope.sumAll=function(){
        var totalPrice=0;
        for(var i=0;i<$scope.cartList.length;i++){
            var dish=$scope.cartList[i];
            totalPrice+=(dish.price*dish.dishCount);
        }
        return totalPrice;
    }



    //减按钮
    $scope.mClick=function(index){
        var count=$scope.cartList[index].dishCount;
        if(count>1){
            count--;
            $kflHttp.sendRequest( 'php/cart_update.php?uid=1&did='+$scope.cartList[index].did+"&count="+count, function () {
                $scope.cartList[index].dishCount--;
                $ionicPopup.alert({
                    template:'更新成功'
                })
            })
        }
    }

    ////加按钮
    $scope.aClick=function(index){
        var count=$scope.cartList[index].dishCount;
            count++;
            $kflHttp.sendRequest( 'php/cart_update.php?uid=1&did='+$scope.cartList[index].did+"&count="+count, function () {
                $scope.cartList[index].dishCount++;
                $ionicPopup.alert({
                    template:'更新成功'
                })
            })
    }


    $ionicModal
        .fromTemplateUrl('revise.html',{scope:$scope})
        .then(function(result){
            $scope.customModal=result;
        })

        $scope.show=function(){
            $scope.customModal.show();
        }

        $scope.hide=function(){
            $scope.customModal.hide();
        }


    //定义保存购物车详情的方法
    $scope.saveAndJump=function(){
        sessionStorage.setItem('cart',angular.toJson($scope.cartList));
        $scope.jump('order',{sum:$scope.sumAll()});
    }

}])