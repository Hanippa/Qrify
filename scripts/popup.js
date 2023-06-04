

// the main function (self invoking) will run everytime the extention is opened
(async () => {

  
//gets all active tabs from the chrome api, with any url
const tabs = await chrome.tabs.query({
    url: [
      "<all_urls>"
    ],
    active: true,
    currentWindow: true
  });

  // renders the qr code for the active tab we get from the chrome api
  QrCreator.render({
    text: tabs[0].url,
    radius: 0.5, // 0.0 to 0.5
    ecLevel: 'H', // L, M, Q, H
    fill: '#30475E', // foreground color
    background: null, // color or null for transparent
    size: 220 // in pixels
  }, document.querySelector('#qrcode'));

  
  const url = document.getElementsByClassName('url-input')[0]

  // adds event listener to the url input field in the html, any time the input changes the program will delete the current qr code, and render a new one.
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

  //adds the url of the active tab to the url field in the html
  url.value = tabs[0].url

  const exportbtn = document.getElementsByClassName('export')[0]; // the export button in the home screen

  //download the rendered qr code with the chrome api
  exportbtn.onclick = () => {  chrome.downloads.download({
    url: document.querySelector('.qrcode canvas').toDataURL('image/png'),
    filename: `${tabs[0].title}-qrify.png`, // the file name, will be the title of the active tab + qrify and file extention.
    saveAs: true  
  });}


  
  const tab_buttons = document.getElementsByClassName('tab');
  let selected_tab = document.getElementsByClassName('tab-selected')[0]
  
  // loops over all the tabs and adds an event listener to each tab. the event listener adds a class name to the selected tab with different styles to indicate which tab is selected.
  for (let tab_button of tab_buttons){
    tab_button.addEventListener('click' , () => {

      selected_tab.classList.remove('tab-selected')
      document.getElementsByClassName(selected_tab.value)[0].classList.remove('tab-on')

      selected_tab = tab_button // saves to selected tab for later use
      tab_button.classList.add('tab-selected')
      document.getElementsByClassName(tab_button.value)[0].classList.add('tab-on')


    })

  }


  // creating a code block useing the code mirror library
  var myCodeMirror = CodeMirror(document.getElementsByClassName('code-container')[0] , {
    value: "",
    mode:  "javascript", // default programming language
    theme : "dracula", // code block theme
    lineNumbers: true
  });
myCodeMirror.refresh();
myCodeMirror.setSize(240, 250); // size of the code block

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
    user_code = myCodeMirror.getValue() // get the code from the code block
    const formdata = new FormData()
    formdata.append("code", user_code)
    formdata.append("language", selected.dataset.pastebin) // get the selected language
    fetch("https://pastebin.run/api/v1/pastes", { // send the data to the pastebin api, with fetch post reqeust.
        method: "post",
        body: formdata
    }).then(data => data.text()).then(data => {

      // delete the existing qr code 
      if ( document.querySelector('#qrcode') !== undefined){
        document.querySelector('#qrcode').innerHTML = ''
      }
      //render a new qr code for the code
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

  // adds an event listener to the "qrify" button on the object tab.  the event listener creates a form with the data from the object, sends it to the pastebin api and renders a new qr code.
  object_send_button.addEventListener('click' , () => {
    user_object = `${document.getElementsByClassName('object-subject')[0].value} \n ${document.getElementsByClassName('object-message')[0].value} \n from, ${document.getElementsByClassName('object-from')[0].value}`
    const formdata = new FormData()
    formdata.append("code", user_object)
    formdata.append("language", "plaintext")
    fetch("https://pastebin.run/api/v1/pastes", { // send the data to the pastebin api, with fetch post reqeust.
        method: "post",
        body: formdata
    }).then(data => data.text()).then(data => {

      // delete the existing qr code 
      if ( document.querySelector('#qrcode') !== undefined){
        document.querySelector('#qrcode').innerHTML = ''
      }
      //render a new qr code for the ojbect
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

    const image_send_button = document.getElementsByClassName('send-image')[0]
    let user_image = document.getElementById('image-input')
    
    // / adds an event listener to the "qrify" button on the image tab.  the event listener creates a form with the data from the image, sends it to the pastebin api and renders a new qr code.
    image_send_button.addEventListener('click', () => {
      const formdata = new FormData()
      formdata.append("image", user_image.files[0]) // get the image from the html input and append it to the form

      fetch("https://api.imgur.com/3/image/", { // send the data to the imgur api, with fetch post reqeust.
          method: "post",
          headers: {
              Authorization: "Client-ID 93189a52ea5087c"
          },
          body: formdata
      }).then(data => data.json()).then(data => {

        // delete the existing qr code 
        if ( document.querySelector('#qrcode') !== undefined){
          document.querySelector('#qrcode').innerHTML = ''
        }
        //render a new qr code for the image
        QrCreator.render({
          text:  data.data.link,
          radius: 0.5, // 0.0 to 0.5
          ecLevel: 'H', // L, M, Q, H
          fill: '#30475E', // foreground color
          background: null, // color or null for transparent
          size: 220 // in pixels
        }, document.querySelector('#qrcode'));
       
          url.value = 'your image 😳'
      })
    })

})();

