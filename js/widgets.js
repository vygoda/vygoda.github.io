// OK Widgets
!function (d, id, did, st) {
  var js = d.createElement("script");
  js.src = "https://connect.ok.ru/connect.js";
  js.onload = js.onreadystatechange = function () {
  if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
    if (!this.executed) {
      this.executed = true;
      setTimeout(function () {
        OK.CONNECT.insertGroupWidget(id,did,st);
      }, 0);
    }
  }}
  d.documentElement.appendChild(js);
}(document,"ok_group_widget","43737308201104","{height:335}");

// VK Widgets
VK.Widgets.Group("vk_groups", {mode: 0, height: "400", color1: 'FFFFFF', color2: '2B587A', color3: '5B7FA6'}, 5366610);