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
let logo_image = null;
const title_regex = /[^a-z\s-]/gi;



const draw_logo = (logo_img) => {
  console.log('drawing logo');
  const qr_canvas = document.querySelector('#qrcode canvas');
  const ctx = qr_canvas.getContext('2d');
  const image = new Image();
  
  // Set the source of the image (replace "image_path.png" with your actual image path)
  
  image.src = URL.createObjectURL(logo_img);
  
  // Wait for the image to load before drawing it on the canvas
  image.onload = function () {
    const desiredWidth = qr_size / 4;
    const desiredHeight = qr_size / 4;

    // Calculate the center position to draw the image and circle
    const centerX = qr_canvas.width / 2;
    const centerY = qr_canvas.height / 2;

    // Calculate the radius of the circle (adding a little extra)
    const extraPadding = qr_size / 50;
    const radius = Math.max(desiredWidth, desiredHeight) / 2 + extraPadding;

    // Draw the circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = qr_color;
    ctx.fill();

    // Draw the image at the center of the circle with the desired width and height
    const imageX = centerX - desiredWidth / 2;
    const imageY = centerY - desiredHeight / 2;
    ctx.drawImage(image, imageX, imageY, desiredWidth, desiredHeight);
  };
}


const add_logo = document.getElementById('add-logo-input');

add_logo.onchange = (event) => {
  logo_image = event.target.files[0];
  if ( document.querySelector('#qrcode') !== undefined){
    document.querySelector('#qrcode').innerHTML = '';
  };
  console.log('rendering new qr code');
  renderQr(text_temp);
  draw_logo(logo_image);
  event.target.value = null;

  
}


const file_tabs = document.getElementsByClassName('file-tab')
file_tabs.forEach((tab) => {
  tab.addEventListener('paste' , (e) => {
    const items = e.clipboardData?.items;
  
    if (items) {
      // Check if files are present in the clipboard data
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          // Here, you have access to the file from the clipboard

          const file_input = tab.getElementsByClassName('file-input')[0];
          let list = new DataTransfer();
          list.items.add(file);
          file_input.files = list.files;
          const event = new Event('change', { bubbles: true });
          file_input.dispatchEvent(event);
          break; // We only handle the first file found in the clipboard
        }
      }
    }
  })
})

const custome_file_input = document.getElementsByClassName('custom-file-input');
for (element of custome_file_input){
  const file_input = document.getElementById(element.getAttribute('for'));


  element.addEventListener('dragenter',(e)=>{
    e.preventDefault();
    e.stopPropagation();
    e.target.style = 'border:2px black solid;'
  });
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  element.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.style = 'border:none;'
  });

  element.addEventListener('drop' , (e) => {
    e.target.style = 'border:none;'
    e.preventDefault();
    const dt = e.dataTransfer;
    const files = dt.files;
    file_input.files = files;
    console.log(file_input);
    const event = new Event('change', { bubbles: true });
    file_input.dispatchEvent(event);
  })
}




const renderQr = (text) =>{
  
  try{
    text_temp = text
    QrCreator.render({
      text: text,
      radius: 0.5, // 0.0 to 0.5
      ecLevel: 'H', // L, M, Q, H   
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
    if(logo_image){
      draw_logo(logo_image);
    }
})
const color_picker = document.getElementsByClassName('color-picker')[0]
color_picker.addEventListener('change' , () => {
  qr_color = color_picker.value
  if ( document.querySelector('#qrcode') !== undefined){
    document.querySelector('#qrcode').innerHTML = ''
  }


  renderQr(text_temp);
  if(logo_image){
    draw_logo(logo_image);
  }
})

const size_picker = document.getElementsByClassName('size-picker')[0]
size_picker.addEventListener('change' , () => {
  qr_size = size_picker.value
  if ( document.querySelector('#qrcode') !== undefined){
    document.querySelector('#qrcode').innerHTML = ''
  }

  renderQr(text_temp);
  if(logo_image){
    draw_logo(logo_image);
  }
})




//adds the url of the active tab to the url field in the html
url.value = tabs[0].url

const exportbtn = document.getElementsByClassName('export')[0]; // the export button in the home screen

//download the rendered qr code with the chrome api
exportbtn.onclick = () => { 
  chrome.downloads.download({
  url: document.querySelector('.qrcode canvas').toDataURL('image/png'),
  filename: `${save_title.replace(title_regex, '')}-qrify.png`, // the file name, will be the title of the active tab + qrify and file extention.
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

const qr_image_input = document.getElementById('qr-image-input');
const qr_image_container = document.getElementsByClassName('qr-image-container')[0];
qr_image_input.onchange = (event) => {
    //if the user already uploaded an image
    if (document.getElementsByClassName('user-qr-image')[0] !== undefined){
      document.getElementsByClassName('user-qr-image')[0].remove() // delete the previous image
    };
    //try showing the user uploaded image on the extention
    try{
      const user_image = document.createElement('img');
      user_image.classList.add('user-qr-image')
      user_image.src = URL.createObjectURL(event.target.files[0]);
      qr_image_container.innerHTML = '';
      qr_image_container.append(user_image);
    }
    // if the program failed to load the image an error message will be added
    catch (error){
      const error_image = document.createElement('h4');
      error_image.innerText = 'Failed to load image :(';
      qr_image_container.innerHTML = '';
      qr_image_container.append(error_image);
    }
}

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
    image_container.innerHTML = '';
    image_container.append(user_image);
  }
  // if the program failed to load the image an error message will be added
  catch(error){
    const error_image = document.createElement('h1');
    error_image.innerText = 'Failed to load image :(';
    image_container.innerHTML = '';
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
    renderQr(`https://www.pastebin.run/${data}.txt`)
    url.value = 'your message 😳'
    save_title = document.getElementsByClassName('object-subject')[0].value
}).catch((e) => {
  home_tab.children[1].remove()
  home_tab.children[0].classList.remove('hidden')
  document.querySelector('#qrcode').innerText = `failed to upload your message :( \n ${e}`
})

     
  })


  const scan_qr = (imageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = imageElement;

    // Set the canvas dimensions to match the image
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Draw the image onto the canvas
    ctx.drawImage(imageElement, 0, 0, width, height);

    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, width, height);

    // Scan the QR code from the image data
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      // QR code found
      return code.data;
    }
      return 'no qr code found in the image, you can try to crop it 🥺';
  }


  const qr_image_send_button = document.getElementsByClassName('send-qr-image')[0]
  qr_image_send_button.addEventListener('click', () => {

    const imageElement = document.getElementsByClassName('user-qr-image')[0];
    let qr_result;
    if(imageElement){
      qr_result = scan_qr(imageElement);
    }
    else{
      qr_result = 'you must choose an image of a qr code 😗';
    }

    const regex = /(\b(?:https?:\/\/|www\.)\S+\b)/gi;
    const replacedContent = qr_result.replace(regex, '<a href="$1" class="highlighted-link" target="_blank">$1</a>');
    document.getElementsByClassName('qr-result')[0].innerHTML = replacedContent
    }
);

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

    fetch("https://api.imgur.com/3/image/", { // send the data to the imgur api, with fetch post reqeust.
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

