import string
import random
from datetime import datetime
from flask import Flask, render_template, request
from functools import wraps

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# You can store data on your server in whatever structure is most convenient,
# either holding it in memory on your server or in a sqlite database.
# You may use the sample structures below or create your own.

def newChat(host_auth_key):
    magic_passphrase = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))

    return dict([
        ("authorized_users", set(host_auth_key)),
        ("magic_key", magic_passphrase),
        ("messages", [])
    ])


# TODO: Include any other routes your app might send users to
@app.route('/')
@app.route('/chat/<int:chat_id>')
def index(chat_id=None):
    return app.send_static_file('index.html')


# -------------------------------- API ROUTES ----------------------------------

# TODO: Create the API
