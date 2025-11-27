from pydantic import BaseModel

class RegisterCreds(BaseModel):
    username: str
    password: str


class LoginCreds(BaseModel):
    username: str
    password: str