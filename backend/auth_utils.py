import hashlib
import bcrypt

def _pre_hash(password: str) -> str:
    # Convert password to SHA256 first (removes bcrypt 72-byte limit issue)
    return hashlib.sha256(password.encode()).hexdigest()

def hash_password(password: str) -> str:
    pre_hashed = _pre_hash(password)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pre_hashed.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pre_hashed = _pre_hash(plain_password)
        return bcrypt.checkpw(
            pre_hashed.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False
