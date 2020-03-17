export function getQueryParam (name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ""])[1].replace(/\+/g, '%20')) || null;
}

// 删除参数
export function deleteUrlParam(url, paramName) {
  var oUrl = url.toString();
  var reg=eval('/('+ paramName+'=)([^&]*)(&*)/gi');
  var nUrl = oUrl.replace(reg, '');
  return nUrl;
}

/**
 * 获取URL中的参数
 * @param {*} url 
 * @param {*} name 
 */
export function getQuerystring(url, name) {
  const search = url.split("?")[1];

  if (!search) return;

  const paramObj = {};
  decodeURIComponent(search).split("&").forEach((item) => {
    const param = item.split("=");
    paramObj[param[0]] = param[1];
  });

  return paramObj[name];
}