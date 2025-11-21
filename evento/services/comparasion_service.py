from dataclasses import dataclass, field
from typing import List, Dict, Any
from enum import Enum
from statistics import mean

class Position(str, Enum):
    GOALKEEPER = 'G'
    DEFENDER = 'D'
    MIDFIELDER = 'M'
    FORWARD = 'F'
    

@dataclass
class PositionStats:
    position: str
    count: int
    avg_rating: float
    players: List[str]
    

@dataclass
class TeamAnalysis:
    team_name: str
    total_players: int
    overall_rating: float
    defensive_rating: float
    midfield_rating: float
    offensive_rating: float
    position_stats: Dict[str, PositionStats] = field(default_factory=dict)
    
    
@dataclass
class MatchComparation:
    home_analysis: TeamAnalysis
    away_analysis: TeamAnalysis
    overall_winner: str
    defensive_comparasion: Dict[str, Any]
    midfield_cmparation: Dict[str, Any]
    offensive_comparasion: Dict[str, Any]
    
@dataclass
class Player:
    id: int
    name: str
    position: str
    avg_rating: float
    
    
@dataclass
class AttackVsDefenseComparison:
    attacking_team: str
    defending_team: str
    attack_rating: float
    defense_rating: float
    difference: float
    winner: str
    
    
@dataclass
class DualAttackDefenseAnalysis:
    home_attack_vs_away_defense: AttackVsDefenseComparison
    away_attack_vs_home_defense: AttackVsDefenseComparison
    likely_scenario: str
    

class LineupComparationService:
    
    @staticmethod
    def analyse_team(players: List[Player], team_name: str = "Team") -> TeamAnalysis:
        
        if not players:
            raise ValueError(f"Nenhum jogador fornecido para {team_name}")
        
        positions_dict = {}
        for player in players:
            if player.position not in positions_dict:
                positions_dict[player.position] = []
            positions_dict[player.position].append(player)
            
        position_stats = {}
        for position, players_list in positions_dict.items():
            ratings = [p.avg_rating for p in players_list if p.avg_rating]
            position_stats[position] = PositionStats(
                position=position,
                count=len(players_list),
                avg_rating=mean(ratings) if ratings else 0,
                players=[p.name for p in players_list]
            )
            
        all_ratings = [p.avg_rating for p in players if p.avg_rating]
        overall_rating = mean(all_ratings) if all_ratings else 0
        
        defensive_players = [
            p for p in players
            if p.position in ['G', 'D']
        ]
        
        defensive_rating = mean(
            [p.avg_rating for p in defensive_players if p.avg_rating]
        ) if defensive_players else 0
        
        midfield_players = [p for p in players if p.position == 'M']
        midfield_rating = mean(
            [p.avg_rating for p in midfield_players if p.avg_rating]
        ) if midfield_players else 0
        
        offensive_players = [p for p in players if p.position == 'F']
        offensive_rating = mean(
            [p.avg_rating for p in offensive_players if p.avg_rating]
        ) if offensive_players else 0
        
        return TeamAnalysis(
            team_name=team_name,
            total_players=len(players),
            overall_rating=overall_rating,
            defensive_rating=defensive_rating,
            midfield_rating=midfield_rating,
            offensive_rating=offensive_rating,
            position_stats=position_stats
        )

    
    
    @staticmethod
    def compare_all_home_vs_away(home_players: List[Player], away_players: List[Player]) -> MatchComparation:
        home_analysis = LineupComparationService.analyse_team(home_players, 'Home')
        away_analysis = LineupComparationService.analyse_team(away_players, 'Away')
        
        defensive_diff = home_analysis.defensive_rating - away_analysis.defensive_rating
        defensive_winner = (
            "home" if defensive_diff > 0.1 else
            "away" if defensive_diff < -0.1 else
            "equal"
        )
        
        midfield_diff = home_analysis.midfield_rating - away_analysis.midfield_rating
        midfield_winner = (
            "home" if midfield_diff > 0.1 else
            "away" if midfield_diff < -0.1 else
            "equal"
        )
        
        offensive_diff = home_analysis.offensive_rating - away_analysis.offensive_rating
        offensive_winner = (
            "home" if offensive_diff > 0.1 else
            "away" if offensive_diff < -0.1 else
            "equal"
        )
        
        overall_diff = home_analysis.overall_rating - away_analysis.overall_rating
        overall_winner = (
            "home" if overall_diff > 0.1 else
            "away" if overall_diff < -0.1 else
            "equal"
        )
        
        
        return MatchComparation(
            home_analysis=home_analysis,
            away_analysis=away_analysis,
            overall_winner=overall_winner,
            defensive_comparasion={
                'home': home_analysis.defensive_rating,
                'away': away_analysis.defensive_rating,
                'difference': defensive_diff,
                'winner': defensive_winner
            },
            midfield_cmparation={
                'home': home_analysis.midfield_rating,
                'away': away_analysis.midfield_rating,
                'difference': midfield_diff,
                'winner': midfield_winner
            },
            offensive_comparasion={
                'home': home_analysis.offensive_rating,
                'away': away_analysis.offensive_rating,
                'difference': offensive_diff,
                'winner': offensive_winner
            }
        )
        
    @staticmethod
    def compare_attack_vs_defense(
        attaking_players: List[Player],
        attaking_team: str,
        defense_players: List[Player],
        defending_team: str
    ) -> AttackVsDefenseComparison:
        
        attacking_untis = [
            p for p in attaking_players
            if p.position in ['F', 'M']
        ]
        
        attack_rating = mean(
            [p.avg_rating for p in attacking_untis if p.avg_rating]
        ) if attacking_untis else 0
        
        defending_units = [
            p for p in defense_players
            if p.position in ['G', 'D']
        ]
        
        defense_rating = mean(
            [p.avg_rating for p in defending_units if p.avg_rating]
        ) if defending_units else 0
        
        difference = attack_rating - defense_rating
        
        if difference > 0.15:
            winner = "attack"
        elif difference < -0.15:
            winner = "defense"
        else:
            winner = "balanced"
            
        return AttackVsDefenseComparison(
            attacking_team=attaking_team,
            defending_team=defending_team,
            attack_rating=attack_rating,
            defense_rating=defense_rating,
            difference=difference,
            winner=winner
        )
        
    
        
        
        
        
        