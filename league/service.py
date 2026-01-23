from dataclasses import dataclass
from datetime import date

@dataclass
class LeagueDataClass:
    name: str
    type: str
    logo: str
    country_name: str
    country_code: str
    country_flag: str
    season_year: int
    season_start: date
    season_end: date
    season_coverege_perdictions: bool