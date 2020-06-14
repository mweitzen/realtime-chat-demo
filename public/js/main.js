const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

const socket = io()

// Join chatroom
socket.emit('joinRoom', {username, room})

socket.on('message', message => {
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight
})

socket.on('roomUsers', ({room, users}) => {

  outputRoomName(room);
  outputUsers(users);
})

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Send chat message to server
  socket.emit('chatMessage', msg);

  // Clear text input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
})


// Output message to DOM
const outputMessage = (message) => {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class='meta'>${message.username} <span>${message.time}</span></p><p class='text'>${message.text}</p>`
  chatMessages.appendChild(div)
}

// Add room to DOM
function outputRoomName(room) {
  roomName.innerText = room
}

// Add room to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}
