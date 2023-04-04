const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationMessageTemplate = document.querySelector(
  '#location-message-template'
).innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room: room,
    users: users,
  });

  $sidebar.innerHTML = html;
});


const autoScroll = () => {
    const $newMessage = $messages.lastElementChild
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffet = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffet) {
        $messages.scrollTop = $messages.scrollHeight
    }

    

}

socket.on('message', (message) => {
  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll()
});

socket.on('locationMessage', (url) => {
  const html = Mustache.render($locationMessageTemplate, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll()
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');
  const value = e.target.elements.message.value;

  socket.emit('sendMessage', value, (error) => {
    $messageFormButton.removeAttribute('disabled', 'disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log('message delivered');
  });
});

document.querySelector('#send-location').addEventListener('click', (e) => {
  if (!navigator?.geolocation) {
    return alert('Geolocation is not supported in your broswer');
  }

  $sendLocation.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log('Location shared');
        $sendLocation.removeAttribute('disabled', 'disabled');
      }
    );
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
