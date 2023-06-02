
(async () => {
const sharebtn = document.getElementsByClassName('share')[0];
const exportbtn = document.getElementsByClassName('export')[0];
const tabs = await chrome.tabs.query({
    url: [
      "<all_urls>"
    ],
    active: true,
    currentWindow: true
  });
//   const qrcode = new QRCode('qrcode' , {
//     text : tabs[0].url,
//     width : 230,
//     height : 220,
//     colorDark : "#30475E",
//     colorLight : "#F5F5F5"
//   })

  QrCreator.render({
    text: tabs[0].url,
    radius: 0.5, // 0.0 to 0.5
    ecLevel: 'H', // L, M, Q, H
    fill: '#30475E', // foreground color
    background: null, // color or null for transparent
    size: 220 // in pixels
  }, document.querySelector('#qrcode'));

  const url = document.getElementsByClassName('url-input')[0]
  url.value = tabs[0].url
  const shareData = {
    title: "Qrify",
    text: tabs[0].url,
    files : [],
  };
  sharebtn.onclick = () => {navigator.share(shareData)}
  exportbtn.onclick = () => {  chrome.downloads.download({
    url: document.querySelector('.qrcode canvas').toDataURL('image/png'),
    filename: `${tabs[0].title}-qrify.png`,
    saveAs: true  // Forces the browser to show the Save As dialog
  });}
})();

