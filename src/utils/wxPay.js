const onBridgePayReady = (data) => {
  const { appId, timeStamp, nonceStr, package: packageStr, signType, paySign } = data;
  // 支付接口参数
  const payParam = { 
    appId,     //公众号名称
    timeStamp, //时间戳
    nonceStr,  //随机串
    package: packageStr, 
    signType,  //微信签名方式
    paySign    //微信签名
  };
  console.log('payParam', payParam);

  return new Promise((resolve, reject) => {
    function onBridgeReady(){
      WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        payParam,
        function(res){
          if(res.err_msg == "get_brand_wcpay_request:ok" ){
          // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
            resolve();
          } else {
            // get_brand_wcpay_request:fail get_brand_wcpay_request:cancel
            reject();
          }
        }
      ); 
    }
  
    if (typeof WeixinJSBridge == "undefined"){
      if( document.addEventListener ){
          document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
      }else if (document.attachEvent){
          document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
          document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
      }
    }else{
      onBridgeReady();
    }
  });
}

export { onBridgePayReady }