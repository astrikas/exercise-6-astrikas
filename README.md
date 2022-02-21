# Exercise #6: Watch Party 2: The Single Page Experience

10 points

**DUE: Friday, February 25 by 5:30pm**

### Instructions

For this exercise, we will build a *single-page* group chat web application with
asynchronous Javascript and a REST API written in Python with Flask.

Like the original, Watch Party 2 lets users start group chats with
disappearing messages and invite their friends. This time, however, we
serve a static HTML page and never redirect or reload. Instead, the page
interacts purely with the JSON API.

As before, chats may contain up 30 messages. This time, however, we prompt users
for a username and password when they create a chat or join one, and we allow
them to log back into their account from a different browser.

The default page should allow users to log in with their username and password,
or to create a new account. Logged-in users should receive an access token that
they use for all other requests. The access token can potentially be used in
multiple chats in multiple tabs. Newly logged-in users should see a chat index
page that lists the chats they are in and has a button to create a new chat.

The app should create a new chat by `POST`ing to the JSON API. The response will
contain a chat_id and a magic invite link. Without reloading, display the chat
screen and push `chat/<chat_id>` to the URL bar and browser history. Display the
invite link on the page.

When a user visits a magic link, serve them the same single-page application.
If users don't have a valid access token, prompt them to sign in or create an
account. If they do have a valid access token (e.g. saved in localStorage), the
application should use the URL query parameters to try to authenticate via
the `join` endpoint. If successful (i.e. the invite link is valid), show them
the chat screen and set the URL bar and browser history to `chat/<chat_id>`.
Otherwise, show them the default chat index page and set the URL bar and browser
history to `/`.

Users in the chat post messages using the API, and the front-end continuously
polls the API for new messages, so that they appear automatically in the chat.
Store the usernames on the server associated with the access tokens, so users
do not have to supply them on each message.

Take Watch Party UI here and serve it
using server-side code written in the

Starting with the files included in this directory, implement the UI for Watch
Party in HTML, CSS, and Javascript, and serve it using server-side code written
in the
[latest stable version of Python](https://www.python.org/downloads/release/python-3102/)
([3.10.2](https://www.python.org/downloads/release/python-3102/))
and [Flask](https://flask.palletsprojects.com/en/2.0.x/installation/). You'll
notice that there are some routes in `app.py` to get you started, and some that
you will need to add. Make sure that you:
- Prompt users to enter a username and password to sign up or log in
- Display a list of chats a logged in user is currently in, with a button to
  create a new one.
- Give each chat a unique URL so users can return to it if they close their
  tab or reload the page. Remember who they are if they do.
- Allow users to be in multiple chats in multiple tabs if they want.
- As other users type new messages in a chat, Watch Party should asynchronously
  fetch them, and those messages should appear automatically without anyone
  reloading or otherwise interacting with the page.

You may save chat messages and user names on the server however you want; with a
database like we used in Exercise 3 or just in memory on your server. Either
way, make sure you delete older messages as ones over 30 come in. For the
purposes of this Exercise, you also do not need to worry about deleting chats
that nobody is using anymore.

Remember to include in your submission any classmates you collaborated with and
any materials you consulted. Watch Party (though it has somewhat different
requirements) is inspired by [yap.chat](https://yap.chat/).

### Rubric

One point each for:
- Remember permissions:
  - Usernames are unique. When a user with an auth key creates a chat or enters
  one with a magic link, save on the server that they have permission to use
  that chat room. **[1 pt]**
  - API endpoint to list which rooms a user is in. **[1 pt]**
  - Optionally, you may let users name/rename rooms [0 pts]
- Single-Page UI:
  - Have only one HTML file, containing the elements to display
    either the login screen, a list of chats the user is in, or the screen for a
    single chat (list messages sent, display the magic invite link, fields to
    enter a new message), and showing or hiding the elements as appropriate.
    **[1 pt]**
  - The entire app runs without reloading the page. **[1 pt]**
- State from Navigation Bar: Users should be able to exit their browser and
  return to any URL the app presents to them.
  - Front end pulls the chat_id from the navigation bar as needed **[1 pt]**
  - Front end pulls the magic passphrase from the navigation bar as needed
    **[1 pt]**
- Push Single-Page State to the Navigation Bar: Use the History API to set which
  page the user has navigated to.
    - Users can use the Back button to navigate back to a chat page **[1 pt]**
    - Users can use the Back button to navigate back to the index page
      **[1 pt]**
- Clear the magic passphrase from the navigation bar after one has been used.
  **[1 pt]**
- Asyncronously Post and Fetch New Messages: Use asynchronous calls to the JSON
  API to post and fetch new messages. Continuously poll for new messages from
  other users and display them as they are written. **[1 pt]**
