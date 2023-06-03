
(async () => {
const exportbtn = document.getElementsByClassName('export')[0];
const tabs = await chrome.tabs.query({
    url: [
      "<all_urls>"
    ],
    active: true,
    currentWindow: true
  });

  QrCreator.render({
    text: tabs[0].url,
    radius: 0.5, // 0.0 to 0.5
    ecLevel: 'H', // L, M, Q, H
    fill: '#30475E', // foreground color
    background: null, // color or null for transparent
    size: 220 // in pixels
  }, document.querySelector('#qrcode'));

  const url = document.getElementsByClassName('url-input')[0]
  url.addEventListener('input' , () => {
    if ( document.querySelector('#qrcode') !== undefined){
      document.querySelector('#qrcode').innerHTML = ''
    }
    QrCreator.render({
      text:  url.value,
      radius: 0.5, // 0.0 to 0.5
      ecLevel: 'H', // L, M, Q, H
      fill: '#30475E', // foreground color
      background: null, // color or null for transparent
      size: 220 // in pixels
    }, document.querySelector('#qrcode'));
  })
  url.value = tabs[0].url

  exportbtn.onclick = () => {  chrome.downloads.download({
    url: document.querySelector('.qrcode canvas').toDataURL('image/png'),
    filename: `${tabs[0].title}-qrify.png`,
    saveAs: true  
  });}

  const tab_buttons = document.getElementsByClassName('tab');
  let selected_tab = document.getElementsByClassName('tab-selected')[0]
  
  for (let tab_button of tab_buttons){
    tab_button.addEventListener('click' , () => {

      selected_tab.classList.remove('tab-selected')
      document.getElementsByClassName(selected_tab.value)[0].classList.remove('tab-on')

      selected_tab = tab_button
      tab_button.classList.add('tab-selected')
      document.getElementsByClassName(tab_button.value)[0].classList.add('tab-on')


    })

  }

  var myCodeMirror = CodeMirror(document.getElementsByClassName('code-container')[0] , {
    value: "function myScript(){return 100;}\n",
    mode:  "javascript",
    theme : "dracula",
    lineNumbers: true
  });
myCodeMirror.refresh();
myCodeMirror.setSize(240, 250);

  const code_actions = document.getElementsByClassName('code-action');
  let selected = document.getElementsByClassName('code-selected')[0];
  for(let button of code_actions) {
    button.addEventListener('click', () => {

        selected.classList.remove('code-selected')
        selected = button;
        myCodeMirror.setOption("mode", button.value);
        button.classList.add('code-selected');
  })};

  const image_input = document.getElementById('image-input');
  const image_container = document.getElementsByClassName('image-container')[0];
  image_input.onchange = (event) => {
    if (document.getElementsByClassName('user-image')[0] !== undefined){
      document.getElementsByClassName('user-image')[0].remove()
    };
    try{
      const user_image = document.createElement('img');
      user_image.classList.add('user-image')
      user_image.src = URL.createObjectURL(event.target.files[0]);
      image_container.append(user_image);
    }
    catch{
      const error_image = document.createElement('h1');
      error_image.innerText = 'Failed to load image :(';
      image_container.append(error_image);
    }




  }

  const code_send_button = document.getElementsByClassName('send-code')[0]
  let user_code = myCodeMirror.getValue()
  code_send_button.addEventListener('click' , () => {
    user_code = myCodeMirror.getValue()
    const formdata = new FormData()
    formdata.append("code", user_code)
    formdata.append("language", selected.dataset.pastebin)
    fetch("https://pastebin.run/api/v1/pastes", {
        method: "post",
        body: formdata
    }).then(data => data.text()).then(data => {

      if ( document.querySelector('#qrcode') !== undefined){
        document.querySelector('#qrcode').innerHTML = ''
      }
      QrCreator.render({
        text:  `https://www.pastebin.run/${data}`,
        radius: 0.5, // 0.0 to 0.5
        ecLevel: 'H', // L, M, Q, H
        fill: '#30475E', // foreground color
        background: null, // color or null for transparent
        size: 220 // in pixels
      }, document.querySelector('#qrcode'));
      url.value = 'your code 😳'
    })
       
    })

    
  const object_send_button = document.getElementsByClassName('send-object')[0]
  let user_object = `${document.getElementsByClassName('object-subject')[0].value} \n ${document.getElementsByClassName('object-message')[0].value} \n from, ${document.getElementsByClassName('object-from')[0].value}`
  object_send_button.addEventListener('click' , () => {
    user_object = `${document.getElementsByClassName('object-subject')[0].value} \n ${document.getElementsByClassName('object-message')[0].value} \n from, ${document.getElementsByClassName('object-from')[0].value}`
    const formdata = new FormData()
    formdata.append("code", user_object)
    formdata.append("language", "plaintext")
    fetch("https://pastebin.run/api/v1/pastes", {
        method: "post",
        body: formdata
    }).then(data => data.text()).then(data => {

      if ( document.querySelector('#qrcode') !== undefined){
        document.querySelector('#qrcode').innerHTML = ''
      }
      QrCreator.render({
        text:  `https://www.pastebin.run/${data}`,
        radius: 0.5, // 0.0 to 0.5
        ecLevel: 'H', // L, M, Q, H
        fill: '#30475E', // foreground color
        background: null, // color or null for transparent
        size: 220 // in pixels
      }, document.querySelector('#qrcode'));
      url.value = 'your message 😳'
    })
       
    })



})();

