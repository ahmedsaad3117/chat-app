const $userMessage = document.querySelector("#user-message");
const $sendMessage = document.querySelector("#send-message");
const $messages = document.querySelector("#messages");
const $sendLoction = document.querySelector("#send-loction");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const loctionTemplate = document.querySelector("#loction-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;


//Option
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () =>{
  // New message element
  const $newMessage = $messages.lastElementChild

  //Height of the new message
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //Visible height
  const visibleHeight = $messages.offsetHeight

  //Height of message container
  const containerHeight = $messages.scrollHeight

  //How far have i scrolled
  const scorlOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scorlOffset){
    $messages.scrollTop = $messages.scrollHeight + newMessageHeight
  }

  //$messages.scrollTop = $messages.scrollHeight
}

const socket = io();

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

$sendMessage.addEventListener("click", () => {
  $sendMessage.setAttribute("disabled", "disabled");

  socket.emit("sendingMessage", $userMessage.value, (mes) => {
    $sendMessage.removeAttribute("disabled");
    console.log("The message was deliverd!", mes);
  });
  $sendMessage.value = "";
  
});

socket.on("loctaionMessage", (message) => {
  const html = Mustache.render(loctionTemplate, {
    username: message.username,
    message: message.link,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

$sendLoction.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not Supported");
  }

  $sendLoction.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLoction",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (message) => {
        console.log(message);
      }
    );
    $sendLoction.removeAttribute("disabled");
  });
});

socket.on('roomData',({room , users})=>{
  const html = Mustache.render(sidebarTemplate,{
    room,
    users
  })

  document.querySelector('#sidebar').innerHTML = html
})

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
