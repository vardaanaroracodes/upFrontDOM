# from flask import Flask, request, redirect
# import requests

# app = Flask(__name__)

# # HubSpot App Credentials
# CLIENT_ID = 'ab404060-d418-47da-b945-ae21fb0d82c1'
# CLIENT_SECRET = 'accc1bc8-fead-4646-91ee-72cece0d9097'
# REDIRECT_URI = 'http://localhost:5001/oauth/callback'

# ACCESS_TOKEN = None  # For dev only

# @app.route('/')
# def home():
#     auth_url = (
#         f"https://app-na2.hubspot.com/oauth/authorize"
#         f"?client_id={CLIENT_ID}"
#         f"&redirect_uri={REDIRECT_URI}"
#         f"&scope=crm.objects.contacts.read%20crm.objects.contacts.write%20oauth"
#     )
#     return f'<a href="{auth_url}">🔐 Connect to HubSpot</a>'

# @app.route('/oauth/callback')
# def oauth_callback():
#     global ACCESS_TOKEN
#     code = request.args.get('code')

#     token_url = "https://api.hubapi.com/oauth/v1/token"
#     payload = {
#         'grant_type': 'authorization_code',
#         'client_id': CLIENT_ID,
#         'client_secret': CLIENT_SECRET,
#         'redirect_uri': REDIRECT_URI,
#         'code': code
#     }
#     headers = {'Content-Type': 'application/x-www-form-urlencoded'}

#     response = requests.post(token_url, data=payload, headers=headers)
#     if response.status_code == 200:
#         ACCESS_TOKEN = response.json()['access_token']
#         print(f"Access Token: {ACCESS_TOKEN}")
#         return "✅ Connected! Go to <a href='/contacts'>/contacts</a> to see contacts."
#     else:
#         return f"❌ Token error: {response.text}"

# @app.route('/contacts')
# def contacts():
#     global ACCESS_TOKEN
#     if not ACCESS_TOKEN:
#         return "⚠️ Not connected. Go to <a href='/'>/</a> to connect."

#     url = "https://api.hubapi.com/crm/v3/objects/contacts"
#     headers = {
#         'Authorization': f'Bearer {ACCESS_TOKEN}',
#         'Content-Type': 'application/json'
#     }
#     params = {
#         'limit': 5,
#         'properties': 'firstname,lastname,email'
#     }

#     response = requests.get(url, headers=headers, params=params)
#     if response.status_code != 200:
#         return f"❌ Error fetching contacts: {response.text}"

#     contacts = response.json().get('results', [])
#     html = "<h2>Contacts:</h2><ul>"
#     for contact in contacts:
#         props = contact['properties']
#         cid = contact['id']
#         name = f"{props.get('firstname', '')} {props.get('lastname', '')}"
#         email = props.get('email', '')
#         html += f"<li>{name} — {email} — <a href='/update?id={cid}'>Update</a></li>"
#     html += "</ul>"
#     return html

# @app.route('/create', methods=['GET', 'POST'])
# def create_contact():
#     global ACCESS_TOKEN
#     if not ACCESS_TOKEN:
#         return "⚠️ Not connected. Go to <a href='/'>/</a> first."

#     if request.method == 'POST':
#         firstname = request.form.get('firstname')
#         lastname = request.form.get('lastname')
#         email = request.form.get('email')

#         url = "https://api.hubapi.com/crm/v3/objects/contacts"
#         headers = {
#             'Authorization': f'Bearer {ACCESS_TOKEN}',
#             'Content-Type': 'application/json'
#         }
#         data = {
#             "properties": {
#                 "firstname": firstname,
#                 "lastname": lastname,
#                 "email": email
#             }
#         }

#         response = requests.post(url, json=data, headers=headers)
#         if response.status_code == 201:
#             return f"✅ Contact created successfully! <a href='/contacts'>See contacts</a>"
#         else:
#             return f"❌ Error creating contact: {response.text}"

#     # GET: Show form
#     return '''
#         <h2>Create New Contact</h2>
#         <form method="post">
#             First Name: <input type="text" name="firstname"><br>
#             Last Name: <input type="text" name="lastname"><br>
#             Email: <input type="email" name="email"><br>
#             <input type="submit" value="Create Contact">
#         </form>
#         <br><a href="/contacts">⬅ Back to contacts</a>
#     '''

# @app.route('/update', methods=['GET', 'POST'])
# def update_contact():
#     global ACCESS_TOKEN
#     contact_id = request.args.get('id')
#     if not ACCESS_TOKEN:
#         return "⚠️ Not connected. Go to <a href='/'>/</a> first."
#     if not contact_id:
#         return "⚠️ Missing contact ID."

#     if request.method == 'POST':
#         firstname = request.form.get('firstname')
#         email = request.form.get('email')

#         update_url = f'https://api.hubapi.com/crm/v3/objects/contacts/{contact_id}'
#         headers = {
#             'Authorization': f'Bearer {ACCESS_TOKEN}',
#             'Content-Type': 'application/json'
#         }
#         data = {
#             "properties": {
#                 "firstname": firstname,
#                 "email": email
#             }
#         }
#         response = requests.patch(update_url, json=data, headers=headers)
#         if response.status_code == 200:
#             return f"✅ Contact updated successfully. <a href='/contacts'>Back to contacts</a>"
#         else:
#             return f"❌ Update failed: {response.text}"

#     # GET: show form
#     return f'''
#         <h2>Update Contact {contact_id}</h2>
#         <form method="post">
#             First name: <input type="text" name="firstname"><br>
#             Email: <input type="email" name="email"><br>
#             <input type="submit" value="Update Contact">
#         </form>
#         <br><a href="/contacts">⬅ Back to contacts</a>
#     '''

# if __name__ == '__main__':
#     app.run(port=5001, debug=True)

from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)  # Allow extension & dev

# HubSpot credentials
CLIENT_ID = 'ab404060-d418-47da-b945-ae21fb0d82c1'
CLIENT_SECRET = 'accc1bc8-fead-4646-91ee-72cece0d9097'
REDIRECT_URI = 'http://localhost:5001/oauth/callback'

ACCESS_TOKEN = None  # In-memory for demo

# ----------------------
# OAuth Flow
# ----------------------

@app.route('/')
def home():
    scope = [
            "crm.objects.contacts.read",
            "crm.objects.contacts.write",
            "crm.objects.custom.read",
            "crm.objects.custom.write",
            "crm.schemas.contacts.read",
            "crm.schemas.contacts.write",
            "oauth"
        ]

    auth_url = (
        "https://app-na2.hubspot.com/oauth/authorize"
        f"?client_id={CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&scope={'%20'.join(scope)}"
    )

    return f'<a href="{auth_url}">🔐 Connect to HubSpot</a>'

@app.route('/oauth/callback')
def oauth_callback():
    global ACCESS_TOKEN
    code = request.args.get('code')
    if not code:
        return "❌ Missing `code` from HubSpot."

    # Exchange code for token
    token_url = "https://api.hubapi.com/oauth/v1/token"
    payload = {
        'grant_type': 'authorization_code',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uri': REDIRECT_URI,
        'code': code
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    res = requests.post(token_url, data=payload, headers=headers)

    if res.status_code != 200:
        return f"❌ Token error: {res.text}"

    ACCESS_TOKEN = res.json()['access_token']
    print("[✅] HubSpot access token stored.")

    # --------------------------
    # Auto-create custom fields
    # --------------------------
    custom_fields = [
    {
        "name": "linkedin_url",
        "label": "LinkedIn Profile URL",  # 🔁 CHANGE THIS LABEL
        "description": "LinkedIn profile link scraped from extension",
        "groupName": "contactinformation",
        "type": "string",
        "fieldType": "text"
    },
    {
        "name": "company_period",
        "label": "Company Role Period",
        "description": "Tenure or time at company",
        "groupName": "contactinformation",
        "type": "string",
        "fieldType": "text"
    }
]


    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }
    setup_url = "https://api.hubapi.com/properties/v2/contacts/properties"
    results = []
    for field in custom_fields:
        r = requests.post(setup_url, json=field, headers=headers)
        if r.status_code == 409:
            results.append(f"{field['name']} already exists")
        elif r.status_code == 200:
            results.append(f"{field['name']} created")
        else:
            results.append(f"Error creating {field['name']}: {r.text}")

    return "✅ Connected to HubSpot.<br><ul>" + "".join([f"<li>{r}</li>" for r in results]) + "</ul><br>You can now use the extension."

# ----------------------
# Status Check
# ----------------------

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({'connected': ACCESS_TOKEN is not None})

# ----------------------
# Contact Enrichment
# ----------------------

@app.route('/api/enrich-contact', methods=['POST'])
def enrich_contact():
    if not ACCESS_TOKEN:
        return jsonify({'error': 'Not connected to HubSpot'}), 403

    data = request.get_json()

    name = data.get('name', '')
    # email = data.get('email') or f"{name.lower().replace(' ', '')}@example.com"
    email= data.get('email') or ''
    firstname = name.split()[0] if name else ''
    lastname = " ".join(name.split()[1:]) if len(name.split()) > 1 else ''

    contact_data = {
        "properties": {
            "firstname": firstname,
            "lastname": lastname,
            "email": email,
            "company": data.get('currentCompany', ''),
            "jobtitle": data.get('currentPosition', ''),
            "city": data.get('location', ''),
            "linkedin_url": data.get('linkedin_url', ''),
            "company_period": data.get('company_period', '')
        }
    }

    url = "https://api.hubapi.com/crm/v3/objects/contacts"
    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }

    response = requests.post(url, json=contact_data, headers=headers)
    if response.status_code == 201:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'error': response.text}), response.status_code

# ----------------------
# Optional: List Contacts
# ----------------------

@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    if not ACCESS_TOKEN:
        return jsonify({'error': 'Not connected to HubSpot'}), 403

    url = "https://api.hubapi.com/crm/v3/objects/contacts"
    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }
    params = {
        'limit': 5,
        'properties': 'firstname,lastname,email'
    }

    res = requests.get(url, headers=headers, params=params)
    return res.json(), res.status_code

# ----------------------
# Update Contact (optional)
# ----------------------

@app.route('/api/contacts/<contact_id>', methods=['PATCH'])
def update_contact(contact_id):
    if not ACCESS_TOKEN:
        return jsonify({'error': 'Not connected to HubSpot'}), 403

    data = request.get_json()
    url = f"https://api.hubapi.com/crm/v3/objects/contacts/{contact_id}"
    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }
    payload = {
        "properties": data
    }

    res = requests.patch(url, json=payload, headers=headers)
    return res.json(), res.status_code

# ----------------------
# Run the App
# ----------------------

if __name__ == '__main__':
    app.run(port=5001, debug=True)
