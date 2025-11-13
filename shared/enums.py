from enum import Enum

class EventOriginEnum(Enum):
    SCORE_DATA = "score-data"
    OWNER_BALL = "owner-ball"
    
class BetsResultEnum(Enum):
    RED = "R"
    GREEN = "G"
    ANULADO = "A"
    CANCELED = "C"