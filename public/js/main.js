// initialize webspeech
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const socket = io();
console.log(recognition ? 'SpeechRecognition initialized' : 'Error initializing SpeechRecognition');

// config webspeech
recognition.lang = 'es-ES';
recognition.interimResults = false;
recognition.continuous = true;

recognition.onstart = () => { console.log('Recognition START') }
recognition.onresult = () => { console.log('Recognition RESULTS') }
recognition.onerror = () => { console.log('Recognition ERROR') }
recognition.onend = () => { console.log('Recognition END') }


// DOM elements
const breakLine = '<br>';
var sendBtn = document.getElementById('btn-send');
var talkBtn = document.getElementById('btn-talk');
var stopBtn = document.getElementById('btn-stop');
stopBtn.style.display = 'none';
var conversation = document.getElementById('conversation');
var messageInput = document.getElementById('write-message');
messageInput.focus();

// events
talkBtn.addEventListener('click', () => {
    recognition.start();
    stopBtn.style.display = 'inline';
    talkBtn.style.display = 'none';
});
stopBtn.addEventListener('click', () => {
    recognition.stop();
    talkBtn.style.display = 'inline';
    stopBtn.style.display = 'none';
});
sendBtn.addEventListener('click', () => {
    var text = messageInput.value;
    messageInput.value = '';
    sendMessage(text);
});
messageInput.onkeydown = function(e) {
    if (e.keyCode == 13) {
        var text = messageInput.value;
        messageInput.value = '';
        sendMessage(text);
    }
};

recognition.addEventListener('result', (e) => {
    let last = e.results.length - 1;
    let text = e.results[last][0].transcript;
    console.log('Result received: ' + text);
    console.log('Confidence: ' + e.results[0][0].confidence);
    sendMessage(text);
});


// socket config
socket.on('bot reply', function(replyText) {
    recognition.stop();
    talkBtn.style.display = 'inline';
    stopBtn.style.display = 'none';
    printMessage(replyText, true);
    synthVoice(replyText);
});


// functions
function sendMessage(text) {
    if (!text || text.length <= 0) {
        messageInput.focus();
        return;
    }
    printMessage(text, false);
    socket.emit('chat message', text);
    messageInput.focus();
    console.log('Sending message to server: ', text);
}

function printMessage(text, isBot) {
    conversation.innerHTML += getHtmlMessage(text, isBot);
    scrollConversationToBottom();
}

function getHtmlMessage(text, isBot) {
    var subject = isBot ? 'WONKI' : 'YOU';
    var customClass = isBot ? 'msg-wonki' : 'msg-you';
    return `
        <p class="message ${customClass}">
            <strong>${subject}</strong>: ${text} ${breakLine}
        </p>
    `;
}

function synthVoice(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    synth.speak(utterance);
}

function scrollConversationToBottom() {
    conversation.scrollTop = conversation.scrollHeight;
}
