from django.db import models
from enum import Enum


class EventOriginEnum(Enum):
    SCORE_DATA = "score-data"
    OWNER_BALL = "owner-ball"
    
class EntryOptionEnum(Enum):
    ACCEPT = "A"
    REFUSE = "R"
    WAIT = "W"