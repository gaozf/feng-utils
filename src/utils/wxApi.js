import { getWxSign, activitySummaryShare } from '@/utils/data'
import pubJs from '@/utils/mixin'
import { appId } from '@/utils/constant'
import { Dialog } from 'vant';
import store from '../store';
const pubJsMethods = pubJs.methods;

// 获取微信API签名参数，使用vuex，以页面URL缓存配置信息
function getWxAPISign() {
  const currentUrl = location.href.split('#')[0];
  const wxApiPage = store.getters.getWxApiPage(currentUrl);
  if (wxApiPage) {
    return Promise.resolve(wxApiPage.config);
  }

  return getWxSign(currentUrl).then(({data: {data}}) => {
    if (!data) {
      Dialog.alert({
        message: '获取微信API签名失败'
      })
      return;
    }

    store.commit('addWxApiPage', {
      url: currentUrl,
      config: data
    })
    return data;
  });
}
// 配置微信API
// 'updateAppMessageShareData', 'updateTimelineShareData', 'getLocation','scanQRCode', 'chooseImage', 'uploadImage'
function configWx(apiList, callback) {
  getWxAPISign().then((config) => {
    const { nonceStr, signature, timestamp} = config;
    wx.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，
      appId, // 必填，公众号的唯一标识
      timestamp, // 必填，生成签名的时间戳
      nonceStr, // 必填，生成签名的随机串
      signature, // 必填，签名
      jsApiList: apiList // 必填，需要使用的JS接口列表
    })
    setTimeout(()=>{
      callback();
    },500)
  });
}

// 配置分享信息
export function configShareInfo({ title, desc, imgUrl, link }) {
  const apiList = ['onMenuShareAppMessage', 'onMenuShareTimeline'];
  configWx(apiList, () => {
    wx.ready(function() {
      //分享给朋友
      wx.onMenuShareAppMessage({
        title, // 分享标题
        desc, // 分享描述
        link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl, // 分享图标
        success: () => {
          activitySummaryShare(pubJsMethods.GetActivityId())
          .then(res=>{
            if(res.data.success){
              //分享成功
              Dialog.alert({
                title: '提示',
                message: '分享成功'
              });
            }
          })
        }
      })
      //分享到朋友圈
      wx.onMenuShareTimeline({
        title, // 分享标题
        link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl, // 分享图标
        success: () => {
          activitySummaryShare(pubJsMethods.GetActivityId())
          .then(res=>{
            if(res.data.success){
              //分享成功
              Dialog.alert({
                title: '提示',
                message: '分享成功'
              });
            }
          })
        }
      })
    });
  });
}

// 显示分享按钮
export function showShareMenus() {
  const apiList = ['showMenuItems'];
  // 复制链接，在QQ浏览器打开，发送给朋友，分享到朋友圈，收藏，分享到QQ，分享到QQ空间
  const showMenus = [
    'menuItem:share:appMessage', 'menuItem:share:timeline',
    'menuItem:share:qq', 'menuItem:share:QZone'
  ];
  configWx(apiList, () => {
    wx.ready(function() {
      wx.showMenuItems({
        menuList: showMenus
      });
    });
  });
}

// 隐藏所有非基础按钮
export function hideNonBaseMenu() {
  const apiList = ['hideAllNonBaseMenuItem'];
  configWx(apiList, () => {
    wx.ready(function() {
      wx.hideAllNonBaseMenuItem();
    });
  });
}

// 隐藏分享等按钮
export function hideShareMenus() {
  const apiList = ['hideMenuItems'];
  // 复制链接，在QQ浏览器打开，发送给朋友，分享到朋友圈，收藏，分享到QQ，分享到QQ空间
  const hideMenus = [
    'menuItem:copyUrl', 'menuItem:openWithQQBrowser', 'menuItem:openWithSafari',
    'menuItem:share:appMessage', 'menuItem:share:timeline',
    'menuItem:share:qq', 'menuItem:share:QZone'
  ];
  configWx(apiList, () => {
    wx.ready(function() {
      wx.hideMenuItems({
        menuList: hideMenus // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
      });
    });
  });
}

// 隐藏复制链接，在浏览器打开等按钮
export function hideHomeMenus() {
  const apiList = ['hideMenuItems'];
  // 复制链接，在QQ浏览器打开
  const hideMenus = [
    'menuItem:copyUrl', 'menuItem:openWithQQBrowser', 'menuItem:openWithSafari'
  ];
  configWx(apiList, () => {
    wx.ready(function() {
      wx.hideMenuItems({
        menuList: hideMenus // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
      });
    });
  });
}

// 扫码
export function ViewQRcode(success, fail) {
  const apiList = ['scanQRCode']
  configWx(apiList, () => {
    wx.ready(function() {
      wx.scanQRCode({
        needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
        success: function (res) {
          // let result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
          success(res);
        },
        fail: function() {
          if (typeof fail === 'function') {
            fail();
          }
        }
      });
    });
  });
}

// 识别OCR
export function ViewOCR() {
  const apiList = ['chooseImage', 'uploadImage']
  configWx(apiList, () => {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 指定是原图还是压缩图，默认都有
      sourceType: ['album', 'camera'], // 指定来源是相册还是相机，默认都有
      success: function (res) {
        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
        wx.uploadImage({
          localId: localIds.toString(), // 需要上传的图片的ID，由chooseImage接口获得
          isShowProgressTips: 1, // 进度提示
          success: function (res) {
            var mediaId = res.serverId; // 返回图片的服务器端ID，即mediaId
            //将获取到的 mediaId 传入后台 方法savePicture
            this.$toast(mediaId)
          },
          fail: function (res) {
            this.$toast('图片上传失败，请重试');
          }
        });
      }
    });
  })
}

// 获取位置
export function getLocation(callback, failFn) {
  const apiList = ['getLocation']
  configWx(apiList, () => {
    wx.ready(function() {
      wx.getLocation({
        type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
        success: function (res) {
          const latitude = res.latitude // 纬度，浮点数，范围为90 ~ -90
          const longitude = res.longitude // 经度，浮点数，范围为180 ~ -180
          console.log('getlocation1', latitude, longitude)
          getCityInfoByLatLng(latitude, longitude, callback, failFn);
        },
        fail: function() {
          if (typeof failFn === 'function') {
            failFn();
          }
        }
      });
    });
  });
}

// 根据经纬度获取城市信息
function getCityInfoByLatLng(lat, lng, callback, failFn) {
  const myLatlng = new qq.maps.LatLng(lat, lng)

  //调用城市服务信息
  const citylocation = new qq.maps.CityService({
    complete: results => {
      console.log('getlocation2', results)
      callback(results)
    },
    error: () => {
      if (typeof failFn === 'function') {
        failFn();
      }
    }
  })

  //调用城市经纬度查询接口实现经纬查询
  citylocation.searchCityByLatLng(myLatlng)
}



