import string
import random
from datetime import datetime
from flask import Flask, jsonify, render_template, request
from functools import wraps
from concurrent.futures.process import _MAX_WINDOWS_WORKERS
from pyexpat.errors import messages

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# You can store data on your server in whatever structure is most convenient,
# either holding it in memory on your server or in a sqlite database.
# You may use the sample structures below or create your own.

# List of registered users
users = {
    "johnsmith": {"password": "password1234", "session_token": ""},
    
}


chats = {
    "isfanfsainfsain": {
        "magic_phrase": "fsianfainfainfaifnainfa",
        "authorized_users": ["johnsmith"],
        "messages": [
            {"username": "Alice", "body": "Hi Bob!"},
            {"username": "Bob", "body": "Hi Alice!"},
            {"username": "Alice", "body": "Knock knock"},
            {"username": "Bob", "body": "Who's there?"},
        ]
    }
}


def newChat(username):
    magic_phrase = ''.join(random.choices(string.ascii_lowercase + string.digits, k=20)) 
    return {
        "magic_phrase": magic_phrase,
        "authorized_users": [username],
        "messages": []
    } 

def validateUser(username, session_token):
    for k,v in users.items():
        if k == username and v["session_token"] == session_token:
            return True
    return False


# TODO: Include any other routes your app might send users to


# -------------------------------- API ROUTES ----------------------------------

# TODO: Create the API

# Login
@app.route("/login", methods = ["POST"])
def login():
    username = request.json["username"]
    password = request.json["password"]
    # Locate this user in our user dictionary
    for k,v in users.items():
        if k == username and v["password"] == password:
            # Generate a session token
            session_token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=20))
            v["session_token"] = session_token
            
            return jsonify({"success" : True, "session_token": session_token, "username": username })
        
    return jsonify({"success" : False, "session_token": "" })

# Register
@app.route("/register", methods = ["POST"])
def register():
    username = request.json["username"]
    password = request.json["password"]
    # Locate this user in our user dictionary
    for k,v in users.items():
        if k == username:
            # Duplicate username
            return jsonify({"success" : False, "error_message": 'Username is already taken' })
    session_token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=20))
    users[username] = {}
    users[username]["password"] = password
    users[username]["session_token"] = session_token
    return jsonify({"success" : True, "session_token": session_token, "username": username })

# Check if user is logged in by their session token
@app.route("/is_logged_in", methods = ["POST"])
def is_logged_in():
    session_token = request.json["session_token"]
    username = request.json["username"]
    # Locate this user in our user dictionary
    if validateUser(username, session_token):
            # Logged in if sessiojn token and username match
            return jsonify({"success" : True })
    return jsonify({"success" : False })

# List of chats the user is currently in
@app.route("/chats/<username>")
def user_chats(username):
    # Grab session token from header to validate User
    session_token = request.headers['authorization']
    # Locate all chats the user is in
    userChats = []
    if validateUser(username, session_token):
        for k,v in chats.items():
            if username in v["authorized_users"]:
                userChats.append(k)
        return jsonify({"chats": userChats })
    else:
        return jsonify({"error_message": 'User is not logged in' })

#create chat
@app.route("/create", methods=["POST"])
def create_route():
    session_token = request.json["session_token"]
    username = request.json["username"]
    if validateUser(username, session_token):
        # Create new chat
        chat_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=20)) 
        result = newChat(username)
        chats[chat_id] = result
        return jsonify({"success": True, "chat_id": chat_id })
    return jsonify({"sucess": False})

#Get messages for a particular chat
@app.route("/chat_messages/<chat_id>")
def chat_messages(chat_id):
    # Grab session token from header to validate User
    session_token = request.headers['authorization']
    username = request.headers['username']
    # Grab that chat
    if validateUser(username, session_token):
        for k,v in chats.items():
            if k == chat_id and username in v["authorized_users"]:
                return jsonify({"chat_id": chat_id, "messages": v['messages'], "magic_phrase": v['magic_phrase'] })
    else:
        return jsonify({"error_message": 'User is not logged in' })
#Get messages using a magic phrase 
@app.route("/magic_phrase/<magic_phrase>")
def chat_messages_using_magic_phrase(magic_phrase):
    # Grab session token from header to validate User
    session_token = request.headers['authorization']
    username = request.headers['username']
    # Grab that chat
    if validateUser(username, session_token):
        for k,v in chats.items():
            if v["magic_phrase"] == magic_phrase:
                chats[k]['authorized_users'].append(username)
                return jsonify({"chat_id": k, "messages": v['messages'], "magic_phrase": v['magic_phrase'] })
    else:
        return jsonify({"error_message": 'User is not logged in' })
    
@app.route("/messages", methods = ["POST"])
def create_message_route():
    session_token = request.headers['authorization']
    username = request.headers['username']
    print(username)
    print(session_token)
    new_message = request.json["new_message"]
    chat_id = request.json["chat_id"]
    message_obj = {
        "username": username,
        "body": new_message
    }
    if validateUser(username, session_token):
        for k,v in chats.items():
            if k == chat_id and username in v["authorized_users"]:
                chats[k]['messages'].append(message_obj) 
        return jsonify({"success": True})
    return jsonify({"success": False})

# @app.route("/auth", methods = ["POST"])
# def get_message_route():
#     user_name = request.json["user_name"]
#     room = request.json["room"]
#     if len(chats)==0:
#         return jsonify("no chats")
#     else:
#         chat_users = chats[int(room)]
#         # for each chat_user object - separate the key / values?
#         for k,v in chat_users['authorized_users'].items():
#             # for each value - get the username
#             # print(v['username'])
#             if v['username'] == user_name:
#                 return jsonify({ "success": True})
        
#         return jsonify({"success": False})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return app.send_static_file('index.html')