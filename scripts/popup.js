// a function for creating a loading wheel element
const getloadingwheel = (size='small') => {
  const wheel = document.createElement('div')
  if (size === 'large'){
    wheel.classList.add('loader-large')
    return wheel
  }
  else{
    wheel.classList.add('loader')
    return wheel
  }
}

let qr_color = '#30475E'
let save_title = ''
let text_temp = ''
let qr_size = 500


const renderQr = (text) =>{
  try{
    text_temp = text
    QrCreator.render({
      text: text,
      radius: 0.5, // 0.0 to 0.5
      ecLevel: 'H', // L, M, Q, H   radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%);
      fill: qr_color, // foreground color
      background: null, // color or null for transparent
      size: qr_size // in pixels (230)
    }, document.querySelector('#qrcode'));
  }
  catch (e){
    console.log(e)
    document.querySelector('#qrcode').innerText = 'failed to render qr code :('
  }
}

const changeTab = (tab_button) => {

  let selected_tab = document.getElementsByClassName('tab-selected')[0]

  selected_tab.classList.remove('tab-selected')
  document.getElementsByClassName(selected_tab.value)[0].classList.remove('tab-on')

  selected_tab = tab_button // saves to selected tab for later use
  tab_button.classList.add('tab-selected')
  document.getElementsByClassName(tab_button.value)[0].classList.add('tab-on')


}

// the main function (self invoking) will run everytime the extention is opened
(async () => {

  const qrcreator = document.getElementById('qrscript')
  //wait for the qr code creator to load (had issues with loading on slow comupters (might not be needed))
  qrcreator.addEventListener('load', async () => {
    
//gets all active tabs from the chrome api, with any url
const tabs = await chrome.tabs.query({
  url: [
    "<all_urls>"
  ],
  active: true,
  currentWindow: true
});

// renders the qr code for the active tab we get from the chrome api

  renderQr(tabs[0].url)
  save_title = tabs[0].title


const url = document.getElementsByClassName('url-input')[0]

// adds event listener to the url input field in the html, any time the input changes the program will delete the current qr code, and render a new one.
url.addEventListener('input' , () => {
  if ( document.querySelector('#qrcode') !== undefined){
    document.querySelector('#qrcode').innerHTML = ''
  }
  
    renderQr(url.value)
})
const color_picker = document.getElementsByClassName('color-picker')[0]
color_picker.addEventListener('change' , () => {
  qr_color = color_picker.value
  if ( document.querySelector('#qrcode') !== undefined){
    document.querySelector('#qrcode').innerHTML = ''
  }

  renderQr(text_temp)
})

const size_picker = document.getElementsByClassName('size-picker')[0]
size_picker.addEventListener('change' , () => {
  qr_size = size_picker.value
  if ( document.querySelector('#qrcode') !== undefined){
    document.querySelector('#qrcode').innerHTML = ''
  }

  renderQr(text_temp)
})



//adds the url of the active tab to the url field in the html
url.value = tabs[0].url

const exportbtn = document.getElementsByClassName('export')[0]; // the export button in the home screen

//download the rendered qr code with the chrome api
exportbtn.onclick = () => {  chrome.downloads.download({
  url: document.querySelector('.qrcode canvas').toDataURL('image/png'),
  filename: `${save_title}-qrify.png`, // the file name, will be the title of the active tab + qrify and file extention.
  saveAs: true  
});}




const copybtn = document.getElementsByClassName('copy')[0]; // the copy button in the home screen
//copy the rendered qr code with the chrome api
copybtn.onclick = () => { 
  try {
      document.querySelector('.qrcode canvas').toBlob((blob) => { 
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]); 
    });

} catch (error) {
    console.error(error);
}
}

const tab_buttons = document.getElementsByClassName('tab');

// loops over all the tabs and adds an event listener to each tab. the event listener adds a class name to the selected tab with different styles to indicate which tab is selected.
for (let tab_button of tab_buttons){
  tab_button.addEventListener('click' , () => {
    changeTab(tab_button)
  })
}

// creating a code block useing the code mirror library
let myCodeMirror
try{
  myCodeMirror = CodeMirror(document.getElementsByClassName('code-container')[0] , {
    value: "",
    mode:  "javascript", // default programming language
    theme : "dracula", // code block theme
    lineNumbers: true
  });
  myCodeMirror.refresh();
  myCodeMirror.setSize(240, 250); // size of the code block
}
catch{
  document.getElementsByClassName('code-container')[0].innerText = 'failed to create code block :('
}


const code_actions = document.getElementsByClassName('code-action');
let selected = document.getElementsByClassName('code-selected')[0];

// loops over all the language options, and adds an event listener to each option. the event listener adds a class for styling.
for(let button of code_actions) {
  button.addEventListener('click', () => {

      selected.classList.remove('code-selected')
      selected = button; // saves the selected code for later use
      myCodeMirror.setOption("mode", button.value); // sets the code block languages to the selected lanugage
      button.classList.add('code-selected');
})};


const image_input = document.getElementById('image-input');
const image_container = document.getElementsByClassName('image-container')[0];

// adds an events listener to when a file is uploaded
image_input.onchange = (event) => {
  //if the user already uploaded an image
  if (document.getElementsByClassName('user-image')[0] !== undefined){
    document.getElementsByClassName('user-image')[0].remove() // delete the previous image
  };
  //try showing the user uploaded image on the extention
  try{
    const user_image = document.createElement('img');
    user_image.classList.add('user-image')
    user_image.src = URL.createObjectURL(event.target.files[0]);
    image_container.append(user_image);
  }
  // if the program failed to load the image an error message will be added
  catch{
    const error_image = document.createElement('h1');
    error_image.innerText = 'Failed to load image :(';
    image_container.append(error_image);
  }

}

const code_send_button = document.getElementsByClassName('send-code')[0]
let user_code = myCodeMirror.getValue()

// adds an event listener to the "qrify" button on the code tab. the event listener creates a form with the data from the code block, sends it to the pastebin api and renders a new qr code.
code_send_button.addEventListener('click' , () => {
  changeTab(document.getElementsByClassName('tab')[0])
  user_code = myCodeMirror.getValue() // get the code from the code block
  const formdata = new FormData()
  formdata.append("code", user_code)
  formdata.append("language", selected.dataset.pastebin) // get the selected language

  // adds a loading wheel and hides the home icon
  const qr_container = document.getElementById('qrcode')
  qr_container.children[0].classList.add('hidden');
  qr_container.append(getloadingwheel('large'));
  
  home_tab = tab_buttons[0]
  home_tab.children[0].classList.add('hidden')
  home_tab.append(getloadingwheel())
  
  fetch("https://pastebin.run/api/v1/pastes", { // send the data to the pastebin api, with fetch post reqeust.
      method: "post",
      body: formdata
  }).then(data => data.text()).then(data => {

    //removes the loading wheel and enables the home icon
    home_tab.children[1].remove()
    home_tab.children[0].classList.remove('hidden')

    // delete the existing qr code 
    if ( document.querySelector('#qrcode') !== undefined){
      document.querySelector('#qrcode').innerHTML = ''
    }
    //render a new qr code for the code
      renderQr(`https://www.pastebin.run/${data}`)
    url.value = 'your code 😳'
    save_title = user_code.slice(0, 7)
  }).catch((e) => {
    home_tab.children[1].remove()
    home_tab.children[0].classList.remove('hidden')
    document.querySelector('#qrcode').innerText = `failed to upload your code :( \n ${e}`
  })
     
  })

  
const object_send_button = document.getElementsByClassName('send-object')[0]
let user_object = `${document.getElementsByClassName('object-subject')[0].value} \n ${document.getElementsByClassName('object-message')[0].value} \n from, ${document.getElementsByClassName('object-from')[0].value}`

// adds an event listener to the "qrify" button on the object tab.  the event listener creates a form with the data from the object, sends it to the pastebin api and renders a new qr code.
object_send_button.addEventListener('click' , () => {
  changeTab(document.getElementsByClassName('tab')[0])
  // adds a loading wheel and hides the home icon
  const qr_container = document.getElementById('qrcode')
  qr_container.children[0].classList.add('hidden');
  qr_container.append(getloadingwheel('large'));

  home_tab = tab_buttons[0]
  home_tab.children[0].classList.add('hidden')
  home_tab.append(getloadingwheel())

  user_object = `${document.getElementsByClassName('object-subject')[0].value} \n ${document.getElementsByClassName('object-message')[0].value} \n from, ${document.getElementsByClassName('object-from')[0].value}`
  const formdata = new FormData()
  formdata.append("code", user_object)
  formdata.append("language", "plaintext")


    fetch("https://pastebin.run/api/v1/pastes", { // send the data to the pastebin api, with fetch post reqeust.
    method: "post",
    body: formdata
  }).then(data => data.text()).then(data => {
       
  //removes the loading wheel and enables the home icon
  home_tab.children[1].remove()
  home_tab.children[0].classList.remove('hidden')

  // delete the existing qr code 
  if ( document.querySelector('#qrcode') !== undefined){
    document.querySelector('#qrcode').innerHTML = ''
  }
  //render a new qr code for the ojbect
    renderQr(`https://www.pastebin.run/${data}`)
    url.value = 'your message 😳'
    save_title = document.getElementsByClassName('object-subject')[0].value
}).catch((e) => {
  home_tab.children[1].remove()
  home_tab.children[0].classList.remove('hidden')
  document.querySelector('#qrcode').innerText = `failed to upload your message :( \n ${e}`
})

     
  })

  const image_send_button = document.getElementsByClassName('send-image')[0]
  let user_image = document.getElementById('image-input')
  
  // / adds an event listener to the "qrify" button on the image tab.  the event listener creates a form with the data from the image, sends it to the pastebin api and renders a new qr code.
  image_send_button.addEventListener('click', () => {
    changeTab(document.getElementsByClassName('tab')[0])
    const formdata = new FormData();
    formdata.append("image", user_image.files[0]); // get the image from the html input and append it to the form
    // adds a loading wheel and hides the home icon
    const qr_container = document.getElementById('qrcode')
    qr_container.children[0].classList.add('hidden');
    qr_container.append(getloadingwheel('large'));

    const home_tab = tab_buttons[0];
    home_tab.children[0].classList.add('hidden');
    home_tab.append(getloadingwheel());

    fetch("https://api.imgur.com/3/image/", { // send the dasta to the imgur api, with fetch post reqeust.
        method: "post",
        headers: {
            Authorization: "Client-ID 93189a52ea5087c"
        },
        body: formdata
    }).then(data => data.json()).then(data => {

    //removes the loading wheel and enables the home icon
      home_tab.children[1].remove()
      home_tab.children[0].classList.remove('hidden')

      // delete the existing qr code 
      if ( document.querySelector('#qrcode') !== undefined){
        document.querySelector('#qrcode').innerHTML = ''
      }
      //render a new qr code for the image
       renderQr(data.data.link)
        url.value = 'your image 😳'
        save_title = user_image.files[0].name.split(".")[0];
    }).catch((e) => {
      home_tab.children[1].remove()
      home_tab.children[0].classList.remove('hidden')
      document.querySelector('#qrcode').innerText = `failed to upload your image :( \n ${e}`
    })
  })})
})();

