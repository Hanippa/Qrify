// this code is devided to 3 parts, function -> events -> actions

// main function (self invoking)
(async () => {


const qrScannerModule = await import('./qr-scanner/qr-scanner.min.js');
const QrScanner = qrScannerModule.default;
console.log('🤡',QrScanner);

    //main scope variables
  let scripts = document.getElementsByClassName('qr-script');
  let qr_image = null;
  let qr_color = '#30475E';
  let save_title = '';
  let qr_text = '';
  let qr_size = 500;
  let logo_image = null;
  let title_regex = /[^a-z\s-]/gi;
  let qr_container = document.getElementById('qrcode');
  let qr_canvas = null;
  let tab_buttons = document.getElementsByClassName('tab');
  let selected_tab_button = document.getElementsByClassName('tab-button-selected')[0];
  let selected_tab = document.getElementsByClassName('tab-on')[0];
  let code_container = document.getElementsByClassName('code-container')[0];
  let user_code = '';
  let selected_language = document.getElementsByClassName('code-selected')[0];
  const tabs = await chrome.tabs.query({url: ["<all_urls>"],active: true,currentWindow: true}); // gets all active tabs from the chrome api, with any url
  //sction 1 - functions

  //function 1 - get loading animation element.
  const getloadingwheel = (size='small') => {
    const wheel = document.createElement('div');
    wheel.classList.add('loading-wheel');
    switch (size){
      case 'small':
        wheel.classList.add('loader');
        break;
      case 'medium':
        wheel.classList.add('loader-medium');
        break;
      case 'large':
        wheel.classList.add('loader-large');
        break;
    };
    return wheel;
  }


  //function 2 - draw logo on qr canvas.
  const draw_logo = (logo , canvas) => {
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = URL.createObjectURL(logo);
    image.onload = () =>  {
      const width = qr_size / 4;
      const height = qr_size / 4;
      const centerX = canvas.width / 2; // X center of the canvas
      const centerY = canvas.height / 2; // Y center of the canvas

      const padding = qr_size / 50; // padding arround the image
      const radius = (Math.max(width, height) / 2) + padding; // the size of the image devided by 2 + padding

      //draw a circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = qr_color;
      ctx.fill();

      // draw the logo inside of the circle
      const imageX = centerX - width / 2;
      const imageY = centerY - height / 2;
      ctx.drawImage(image, imageX, imageY, width, height);
    }
  }

  //function 3 - clean container element
  const clean_container = (container) => {
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
    };
  };
  }

  //function 4 - render qr code
  const renderQr = (text) => {
    try{
    qr_text = text; // save the text to the main scope
      QrCreator.render({
        text: text,
        radius: 0.5, // 0.0 to 0.5
        ecLevel: 'H', // L, M, Q, H   
        fill: qr_color, // foreground color
        background: null, // color or null for transparent
        size: qr_size // in pixels
      }, qr_container);
      qr_canvas = document.querySelector('#qrcode canvas');
    }
    catch{
      qr_container.innerText = 'failed to render qr code :(';
    };
  }

  //function 5 - change current tab 
  const changeTab = (tab_button) => {
    selected_tab_button.classList.remove('tab-button-selected'); //remove selected class from previous tab button
    selected_tab.classList.remove('tab-on');//remove on class from previous tab
    selected_tab_button = tab_button;//save new selected tab button to the main scope
    selected_tab = document.getElementsByClassName(tab_button.value)[0];//save new selected tab to the main scope
    selected_tab_button.classList.add('tab-button-selected');//add selected class to new selected tab button
    selected_tab.classList.add('tab-on');//add on class to new selected tab
  }

  //function 6 - container error
  const container_error = (container , message) => {
    const error_message = document.createElement('h4');
    error_message.innerText = message;
    container.append(error_message);
  }

  //function 7 - add an image from a file to a container
  const add_container_image = (container, image_file) => {
  const image = document.createElement('img');
  image.classList.add('user-qr-image');
  image.src = URL.createObjectURL(image_file);
  container.append(image);
}

//function 8 - add a loading wheel to a container
const getContainerLoadingWheel = (container , size='small') => {
  for(element of container.children){
    element.classList.add('hidden');
  };
  container.append(getloadingwheel(size));
}

//function 9 - remove a loading wheel from a container
const removeContainerLoadingWheel = (container) => {
  container.getElementsByClassName('loading-wheel')[0].remove();
  for(element of container.children){
    element.classList.remove('hidden');
  };
}

//fucntion 10 - scan a qr code image 
const scan_qr = async () => {
  // Scan the QR code from the qr_image global variable.
  try{
    const scan_result = await QrScanner.scanImage(qr_image, { returnDetailedScanResult: true });
    console.log(scan_result);
    if(scan_result){
      return scan_result.data;
    }
  }
  catch(e){
    return e;
  }
}



// section 2 - events


//event 1 - loops over all the tabs and adds an event listener to each tab. the event listener adds a class name to the selected tab with different styles to indicate which tab is selected.
for (let tab_button of tab_buttons){
  tab_button.addEventListener('click' , () => {
    changeTab(tab_button)
  })
}

//event 2 -  adds an event listener to the color input, any time the input changes the program will delete the current qr code, and render a new one.
const color_picker = document.getElementsByClassName('color-picker')[0]; // color input element
color_picker.addEventListener('change' , () => {
  qr_color = color_picker.value; // save the qr color to the main scope
  clean_container(qr_container);
  renderQr(qr_text);
  if(logo_image){
    draw_logo(logo_image , qr_canvas);
  };
});

//event 3 - adds an event listener to the url input field, any time the input changes the program will delete the current qr code, and render a new one.
const url = document.getElementsByClassName('url-input')[0]; // url input element
url.addEventListener('input' , () => {
    clean_container(qr_container);
    renderQr(url.value)
    if(logo_image){
      draw_logo(logo_image , qr_canvas);
    };
});

//event 4 - adds an event listener to the size input field, any time the input changes the program will delete the current qr code, and render a new one.
const size_picker = document.getElementsByClassName('size-picker')[0]; // size input element
size_picker.addEventListener('change' , () => {
  qr_size = size_picker.value;  // save the qr color to the main scope
  clean_container(qr_container);
  renderQr(qr_text);
  if(logo_image){
    draw_logo(logo_image , qr_canvas);
  };
});

//event 5 - adds an event listener to the add logo button, any time the button is clicked, the the image the user selects will be rendered at the center of the qr code.
const add_logo = document.getElementById('add-logo-input');
add_logo.addEventListener('change' , (event) => {
  logo_image = event.target.files[0]; // save the logo to the main scope
  clean_container(qr_container);
  renderQr(qr_text); // rerender the qr code, to remove any existing logos
  draw_logo(logo_image , qr_canvas);
  event.target.value = null;
});

//event 6 - adds an event listener to the export button, any time the button is clicked, the rendered qr code is downloaded with the chrome api.
const exportbtn = document.getElementsByClassName('export')[0]; // the export button in the home screen
exportbtn.addEventListener('click' , () => { 
  try{
    chrome.downloads.download({
      url: qr_container.getElementsByTagName('canvas')[0].toDataURL('image/png'),
      filename: `${save_title.replace(title_regex, '')}-qrify.png`, // the filtered file name, will be the title of the active tab + qrify and file extention.
      saveAs: true  
    })
  }catch(error){
    console.error(error);
  };
});


//event 7 - adds an event listener to the copy button, any time the button is clicked, the rendered qr code is copied with the chrome api
const copybtn = document.getElementsByClassName('copy')[0]; // the copy button in the home screen
copybtn.addEventListener('click' , () => { 
  try {
      document.querySelector('.qrcode canvas').toBlob((blob) => { 
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]); 
    });

} catch (error) {
    console.error(error);
};
});

//event 8 - // loops over all the code language options, and adds an event listener to each option. the event listener adds a class for styling.
const code_actions = document.getElementsByClassName('code-action');
for(let button of code_actions) {
  button.addEventListener('click', () => {
      selected_language.classList.remove('code-selected')
      selected_language = button; // saves the selected code to the main scope
      myCodeMirror.setOption("mode", button.value); // sets the code block languages to the selected lanugage
      button.classList.add('code-selected');
})};

//event 9 -  adds an event listener to the qr code file input, any time the file input changes, the image will show in the container
const qr_image_input = document.getElementById('qr-image-input');
const qr_image_container = document.getElementsByClassName('qr-image-container')[0];
qr_image_input.addEventListener('change' , (event) => {
  clean_container(qr_image_container);   //if the user already uploaded an image
  try{  //try showing the user uploaded image on the extention
    qr_image = event.target.files[0];
    add_container_image(qr_image_container, event.target.files[0])
  }
  catch{  // if the program failed to load the image an error message will be added
    container_error(qr_image_container , 'Failed to load image :(');
  };
});


//event 10 -  adds an event listener to the image file input, any time the file input changes, the image will show in the container
const image_input = document.getElementById('image-input');
const image_container = document.getElementsByClassName('image-container')[0];
image_input.addEventListener('change' , (event) => {
  clean_container(image_container);  //if the user already uploaded an image
  try{  //try showing the user uploaded image on the extention
    add_container_image(image_container , event.target.files[0]);
  }
  catch{  // if the program failed to load the image an error message will be added
    container_error(image_container , 'Failed to load image :(');
  };
}); 

//event 11 - adds an event listener to the "scan" button on the scanning tab.  the event scans the qr code from image with the jsqr library
const qr_image_send_button = document.getElementsByClassName('send-qr-image')[0]
qr_image_send_button.addEventListener('click', async () => {
  const imageElement = document.getElementsByClassName('user-qr-image')[0];
  let qr_result;
  if(imageElement){
    qr_result = await scan_qr();
  }
  else{
    qr_result = 'you must choose an image of a qr code 😗';
  }
  const regex = /(\b(?:https?:\/\/|www\.)\S+\b)/gi;
  const replacedContent = qr_result.replace(regex, '<a href="$1" class="highlighted-link" target="_blank">$1</a>');
  document.getElementsByClassName('qr-result')[0].innerHTML = replacedContent
});

//event 12 - add a paste event to all the file tabs, when a file is pasted in them the file gets add to the file input present in the tab, and triggering its change event
const file_tabs = document.getElementsByClassName('file-tab');
for (tab of file_tabs){
  tab.addEventListener('paste' , (e) => {
    const items = e.clipboardData?.items;
    if (items) {// Check if files are present in the clipboard data
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          const file_input = tab.getElementsByClassName('file-input')[0];
          let list = new DataTransfer();
          list.items.add(file);
          file_input.files = list.files;
          const event = new Event('change', { bubbles: true });
          file_input.dispatchEvent(event);
          break; // only handle the first file found in the clipboard
        }
      }
    }
  });
}

//event 13 - add event listeners to all file input to enable file drag and drop functionalit
const custom_file_input = document.getElementsByClassName('custom-file-input');
for (element of custom_file_input){
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
    const event = new Event('change', { bubbles: true });
    file_input.dispatchEvent(event);
  })
}

// qrify events 

//event 14 - adds an event listener to the "qrify" button on the code tab. the event listener creates a form with the data from the code block, sends it to the pastebin api and renders a new qr code.
const object_send_button = document.getElementsByClassName('send-code')[0];
object_send_button.addEventListener('click' , () => {
  user_code = myCodeMirror.getValue(); // get the code from the code block
  changeTab(tab_buttons[0]); // go to the home tab
  const formdata = new FormData()
  formdata.append("code", user_code)
  formdata.append("language", selected_language.dataset.pastebin) // get the selected language
  getContainerLoadingWheel(qr_container , 'large');  // adds a loading wheel and hides the home icon
  fetch("https://pastebin.run/api/v1/pastes", { // send the data to the pastebin api, with fetch post reqeust.
      method: "post",
      body: formdata
  }).then(data => data.text()).then(data => {
    removeContainerLoadingWheel(qr_container); // removes the loading wheel and enables the home icon
    clean_container(qr_container); // delete the existing qr code 
    renderQr(`https://www.pastebin.run/${data}`); //render a new qr code for the code
    url.value = 'your code 😳';
    save_title = user_code.slice(0, 7);
  }).catch((e) => {
    container_error(qr_container ,`failed to upload your code :( \n ${e}` )
  }); });




//event 15 - adds an event listener to the "qrify" button on the message tab. the event listener creates a form with the data from the message block, sends it to the pastebin api and renders a new qr code.
const code_send_button = document.getElementsByClassName('send-object')[0];
code_send_button.addEventListener('click' , () => {
  changeTab(tab_buttons[0]); // go to the home tab
  const object_data = document.getElementsByClassName('object-data-field');
  const user_object = `${object_data[0].value} \n ${object_data[1].value} \n from, ${object_data[2].value}`
  const formdata = new FormData()
  formdata.append("code", user_object)
  formdata.append("language", "plaintext") // get the selected language
  getContainerLoadingWheel(qr_container , 'large');  // adds a loading wheel and hides the home icon
  fetch("https://pastebin.run/api/v1/pastes", { // send the data to the pastebin api, with fetch post reqeust.
      method: "post",
      body: formdata
  }).then(data => data.text()).then(data => {
    removeContainerLoadingWheel(qr_container);     // removes the loading wheel and enables the home icon
    clean_container(qr_container); // delete the existing qr code 
    renderQr(`https://www.pastebin.run/${data}.txt`); //render a new qr code for the code
    url.value = 'your message 😳';
    save_title =  object_data[0].value;
  }).catch((e) => {
    container_error(qr_container ,`failed to upload your message :( \n ${e}` )
  }); });



  //event 16 - adds an event listener to the "qrify" button on the image tab.  the event listener creates a form with the data from the image, sends it to the imgur api and renders a new qr code.
  const image_send_button = document.getElementsByClassName('send-image')[0];
  let user_image = document.getElementById('image-input');
  image_send_button.addEventListener('click', () => {
    changeTab(tab_buttons[0]); // go to the home tab
    const formdata = new FormData();
    formdata.append("image", user_image.files[0]); // get the image from the html input and append it to the form
    getContainerLoadingWheel(qr_container , "large"); // adds a loading wheel and hides the home icon
    fetch("https://api.imgur.com/3/image/", { // send the data to the imgur api, with fetch post reqeust.
        method: "post",
        headers: {
            Authorization: "Client-ID 93189a52ea5087c"
        },
        body: formdata
    }).then(data => data.json()).then(data => {
      removeContainerLoadingWheel(qr_container);//removes the loading wheel and enables the home icon
      clean_container(qr_container); // delete the existing qr code 
      //render a new qr code for the image
       renderQr(data.data.link)
        url.value = 'your image 😳';
        save_title = user_image.files[0].name.split(".")[0];
    }).catch((e) => {
       container_error(qr_container , `failed to upload your image :( \n ${e}`);
    })
  })








//section 3 - actions
    getContainerLoadingWheel(qr_container , 'large');
    renderQr(tabs[0].url); // renders the qr code for the active tab we get from the chrome api
    removeContainerLoadingWheel(qr_container);
    url.value = tabs[0].url //adds the url of the active tab to the url field in the html
    save_title = tabs[0].title; // saves the title to the main scope
  
    // creating a code block using the code mirror library
    let myCodeMirror;
    try{
      myCodeMirror = CodeMirror(code_container , {
        value: "",
        mode:  "javascript", // default programming language
        theme : "dracula", // code block theme
        lineNumbers: true
      });
      myCodeMirror.refresh();
      myCodeMirror.setSize(240, 250); // size of the code block
    }
    catch{
      code_container.innerText = 'failed to create code block :(';
    }

})();