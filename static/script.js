/* For index.html */

// TODO: If a user clicks to create a chat, create an auth key for them
// and save it. Redirect the user to /chat/<chat_id>
function createChat() {}

// function showThis(value1, value2, pushHistory = true) {
//   let element1 = document.querySelector(value1);
//   element1.setAttribute("style", "display: grid");

//   let element2 = document.querySelector(value2);
//   element2.setAttribute("style", "display: none");

//   //update this
//   if (pushHistory) {
//     history.pushState({ page: value1 }, "title", `chat/${1}`);
//   }
// }

// function loadPage(pushHistory = true) {
//   pathname = document.location.pathname;
//   paths = pathname.split("/");
//   ending = paths[1];
//   if (ending.length > 0) {
//     showThis(ending, pushHistory);
//   }
// }

// window.addEventListener("load", loadPage);
// window.addEventListener("popstate", (newState) => {
//   console.log(newState);
//   loadPage(false);
// });

/* For chat.html */

// TODO: Fetch the list of existing chat messages.
// POST to the API when the user posts a new message.
// Automatically poll for new messages on a regular interval.

let messageInterval = null;

function postMessage(e) {
  e.preventDefault();

  let new_message = document.querySelector("#text_input").value;

  const urlParams = new URLSearchParams(window.location.search);
  const chat_id = urlParams.get("chat_id");

  let username = localStorage.getItem("username");
  let session_token = localStorage.getItem("session_token");
  //console.log(typeof room);

  fetch("/messages", {
    method: "POST",
    body: JSON.stringify({ new_message, chat_id }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: session_token,
      Username: username,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success == true) {
        addMessagesToScreen([{ username, body: new_message }]);
      }
    })
    .catch((err) => console.log(err));
}

function startMessagePolling() {
  const urlParams = new URLSearchParams(window.location.search);
  const chat_id = urlParams.get("chat_id");

  const username = localStorage.getItem("username");
  const session_token = localStorage.getItem("session_token");
  fetch("/chat_messages/" + chat_id, {
    method: "GET",
    headers: {
      Authorization: session_token,
      Username: username,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      let message_box = document.querySelector(".messages");
      // Check if no messages were added since last time
      if (
        document.querySelectorAll(".message").length !== data.messages.length
      ) {
        message_box.innerHTML = "";
        addMessagesToScreen(data.messages);
      }
    })
    .catch((err) => console.log(err));

  return;
}

function addMessagesToScreen(messages) {
  console.log("messages", messages);
  let message_box = document.querySelector(".messages");
  messages.forEach((element) => {
    const div = document.createElement("div");
    const usernameP = document.createElement("p");
    const bodyP = document.createElement("p");
    div.setAttribute("class", "message");
    usernameP.innerText = element.username + ":";
    bodyP.innerText = element.body;
    div.append(usernameP);
    div.append(bodyP);
    message_box.append(div);
  });
  return;
}

function joinChat(chatId) {
  const username = localStorage.getItem("username");
  const session_token = localStorage.getItem("session_token");
  fetch("/chat_messages/" + chatId, {
    method: "GET",
    headers: {
      Authorization: session_token,
      Username: username,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("chat messages", data);
      showPage(".chat_page");
      let message_box = document.querySelector(".messages");
      message_box.innerHTML = "";
      addMessagesToScreen(data.messages);
      const urlParams = new URLSearchParams(window.location.search);
      const chat_id = urlParams.get("chat_id");
      if (!chat_id && chat_id !== chatId) {
        history.pushState("", "", "?chat_id=" + chatId);
      }
      clearInterval(messageInterval);
      messageInterval = setInterval(startMessagePolling, 3000);
      createMagicLink(data.magic_phrase);
    })
    .catch((err) => console.log(err));
}

function getUserChats() {
  const username = localStorage.getItem("username");
  const session_token = localStorage.getItem("session_token");
  fetch("/chats/" + username, {
    method: "GET",
    headers: {
      Authorization: session_token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("chat list data", data);
      const chatList = document.querySelector(".chats");
      // Add each chat to the list of chats
      data.chats.forEach((chatId) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.setAttribute("href", "javascript: void(0)");
        a.innerText = chatId;
        li.append(a);
        chatList.append(li);
        li.addEventListener("click", function () {
          joinChat(chatId);
        });
      });
    })
    .catch((err) => console.log(err));
}

function showPage(page) {
  // Hide every page
  document.querySelectorAll(".page").forEach((element) => {
    element.style.display = "none";
  });
  // Show the relevant page
  document.querySelector(page).style.display = "block";
}

document.getElementById("registerLink").addEventListener("click", function () {
  // Show the register screen
  showPage(".register");
});

document.getElementById("login").addEventListener("click", function () {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  fetch("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success === true) {
        showPage(".chat_index_page");
        // Store session token in localStorage
        localStorage.setItem("session_token", data.session_token);
        localStorage.setItem("username", data.username);
        getUserChats();
      } else {
        alert("Wrong username/password");
        // Show unsuccessful login
      }
    })
    .catch((err) => console.log(err));
});

document.getElementById("register").addEventListener("click", function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
  }

  fetch("/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success === true) {
        showPage(".chat_index_page");
        // Store session token in localStorage
        localStorage.setItem("session_token", data.session_token);
        localStorage.setItem("username", data.username);
        getUserChats();
      } else {
        alert(data.error_message);
      }
    })
    .catch((err) => console.log(err));
});

function isLoggedIn() {
  const session_token = localStorage.getItem("session_token");
  const username = localStorage.getItem("username");
  if (!session_token || !username) {
    return showPage(".login");
  }

  fetch("/is_logged_in", {
    method: "POST",
    body: JSON.stringify({ session_token, username }),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success === true) {
        const urlParams = new URLSearchParams(window.location.search);
        const magic_phrase = urlParams.get("magic_phrase");
        const chat_id = urlParams.get("chat_id");

        if (magic_phrase) {
          consumeMagicLink(magic_phrase);
        } else if (chat_id) {
          joinChat(chat_id);
        } else {
          showPage(".chat_index_page");
          getUserChats();
        }
      } else {
        showPage(".login");
      }
    })
    .catch((err) => console.log(err));
}

document.getElementById("postMessage").addEventListener("click", function (e) {
  // Show the register screen
  postMessage(e);
});
document.getElementById("createChat").addEventListener("click", function (e) {
  const session_token = localStorage.getItem("session_token");
  const username = localStorage.getItem("username");

  fetch("/create", {
    method: "POST",
    body: JSON.stringify({ session_token, username }),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success === true) {
        joinChat(data.chat_id);
      }
    })
    .catch((err) => console.log(err));
});

function createMagicLink(magic_phrase) {
  const magicLink = document.getElementById("invite_link");
  magicLink.innerText = "http://localhost:5000/?magic_phrase=" + magic_phrase;
}
function consumeMagicLink(magic_phrase) {
  const session_token = localStorage.getItem("session_token");
  const username = localStorage.getItem("username");
  fetch("/magic_phrase/" + magic_phrase, {
    method: "GET",
    headers: {
      Authorization: session_token,
      Username: username,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      showPage(".chat_page");
      let message_box = document.querySelector(".messages");
      message_box.innerHTML = "";
      addMessagesToScreen(data.messages);
      history.pushState("", "", "?chat_id=" + data.chat_id);
      clearInterval(messageInterval);
      messageInterval = setInterval(startMessagePolling, 3000);
      createMagicLink(data.magic_phrase);
    })
    .catch((err) => console.log(err));
}

isLoggedIn();

// window.addEventListener("load", loadAnimal);
window.addEventListener("popstate", (newState) => {
  const urlParams = new URLSearchParams(window.location.search);
  const chat_id = urlParams.get("chat_id");
  console.log("popstate running", newState);
  const currUrl = location.href;
  if (currUrl === "http://localhost:5000/") {
    clearInterval(messageInterval);
    showPage(".chat_index_page");
  } else if (chat_id) {
    joinChat(chat_id);
  }
  console.log(
    "file: script.js ~ line 361 ~ window.addEventListener ~ currUrl",
    currUrl
  );
});

// If on load, there is a chat id, send that user to that chat
console.log("running..");
