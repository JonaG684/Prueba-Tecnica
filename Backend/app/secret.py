import secrets

# Generate a random 32-character or 16-character secret key
SECRET_KEY = secrets.token_urlsafe(16)

print("Generated SECRET_KEY:", SECRET_KEY)
