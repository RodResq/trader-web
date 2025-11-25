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
    
    def __post_init__(self):
        self.avg_rating = round(self.avg_rating, 2)
    

@dataclass
class TeamAnalysis:
    team_name: str
    total_players: int
    overall_rating: float
    defensive_rating: float
    midfield_rating: float
    offensive_rating: float
    position_stats: Dict[str, PositionStats] = field(default_factory=dict)
    
    def __post_init__(self):
        self.overall_rating = round(self.overall_rating, 2)
        self.defensive_rating = round(self.defensive_rating, 2)
        self.midfield_rating = round(self.midfield_rating, 2)
        self.offensive_rating = round(self.offensive_rating, 2)
    
    
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
    team_id: int
    
    def __post_init__(self):
        self.avg_rating = round(self.avg_rating, 2)
    
    
@dataclass
class AttackVsDefenseComparison:
    attacking_team: str
    defending_team: str
    attack_rating: float
    defense_rating: float
    difference: float
    winner: str
    
    def __post_init__(self):
        self.attack_rating = round(self.attack_rating, 2)
        self.defense_rating = round(self.defense_rating, 2)
        self.difference = round(self.difference, 2)
    
    
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
        
        defensive_diff = round(home_analysis.defensive_rating - away_analysis.defensive_rating, 2)
        defensive_winner = (
            home_players[0].team_id if defensive_diff > 0.1 else
            away_players[0].team_id if defensive_diff < -0.1 else
            'Indefinido'
        )
        
        midfield_diff = round(home_analysis.midfield_rating - away_analysis.midfield_rating, 2)
        midfield_winner = (
            home_players[0].team_id if midfield_diff > 0.1 else
            away_players[0].team_id if midfield_diff < -0.1 else
            'Indefinido'
        )
        
        offensive_diff = round(home_analysis.offensive_rating - away_analysis.offensive_rating, 2)
        offensive_winner = (
            home_players[0].team_id if offensive_diff > 0.1 else
            away_players[0].team_id if offensive_diff < -0.1 else
            'Indefinido'
        )
        
        overall_diff = round(home_analysis.overall_rating - away_analysis.overall_rating, 2)
        overall_winner = (
            home_players[0].team_id if overall_diff > 0.1 else
            away_players[0].team_id if overall_diff < -0.1 else
            'Indefinido'
        )
        
        
        return MatchComparation(
            home_analysis=home_analysis,
            away_analysis=away_analysis,
            overall_winner=overall_winner,
            defensive_comparasion={
                'home': home_analysis.defensive_rating,
                'away': away_analysis.defensive_rating,
                'difference': defensive_diff,
                'winnerId': defensive_winner
            },
            midfield_cmparation={
                'home': home_analysis.midfield_rating,
                'away': away_analysis.midfield_rating,
                'difference': midfield_diff,
                'winnerId': midfield_winner
            },
            offensive_comparasion={
                'home': home_analysis.offensive_rating,
                'away': away_analysis.offensive_rating,
                'difference': offensive_diff,
                'winnerId': offensive_winner
            }
        )
        
    @staticmethod
    def compare_attack_vs_defense(
        attaking_players: List[Player],
        attaking_team: int,
        defense_players: List[Player],
        defending_team: int
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
        
    @staticmethod
    def analyse_attack_vs_defense_dual(
        home_players: List[Player],
        away_players: List[Player]
    ) -> DualAttackDefenseAnalysis:
        
        home_attack_vs_away_defense = LineupComparationService.compare_attack_vs_defense(
            home_players, home_players[0].team_id, away_players, away_players[0].team_id
        )
        
        away_attack_vs_home_defense = LineupComparationService.compare_attack_vs_defense(
            away_players, away_players[0].team_id, home_players, home_players[0].team_id
        )
        
        likely_scenario = LineupComparationService._analyze_scenario(
            home_attack_vs_away_defense,
            away_attack_vs_home_defense
        )
        
        return DualAttackDefenseAnalysis(
            home_attack_vs_away_defense=home_attack_vs_away_defense,
            away_attack_vs_home_defense=away_attack_vs_home_defense,
            likely_scenario=likely_scenario
        )
    
    
    @staticmethod
    def _analyze_scenario(
        home_attack_vs_away_defense: AttackVsDefenseComparison,
        away_attack_vs_home_defense: AttackVsDefenseComparison
    ) -> Dict[str, Any]:
        home_offensive_advantage = home_attack_vs_away_defense.winner == "attack"
        away_offensive_advantage = away_attack_vs_home_defense.winner == "attack"
        
        home_defensive_strength = home_attack_vs_away_defense.winner == "defense"
        away_defensive_strength = away_attack_vs_home_defense.winner == "defense"
        
        scenarios = {
            'both_strong_offense': home_offensive_advantage and away_offensive_advantage,
            'both_strong_defense': home_defensive_strength and away_defensive_strength,
            'home_offensive_advantage': home_offensive_advantage and away_offensive_advantage,
            'away_offensive_advantage': away_offensive_advantage and home_defensive_strength,
            'balanced_match': not any([
                home_offensive_advantage, away_offensive_advantage,
                home_defensive_strength, away_defensive_strength
            ])
        }
        
        scenario_descriptions = {
            'both_strong_offense': {
                'description': 'Partida Ofensiva - Muitos Gols Esperados',
                'prediction': 'Over 2.5 Goals - Ambos os times têm ataque superior às defesas',
                'likelihood': 'Alta'
            },
            'both_strong_defense': {
                'description': 'Partida Defensiva - Poucos Gols Esperados',
                'prediction': 'Under 2.5 Goals - Ambos os times têm defesa superior aos ataques',
                'likelihood': 'Alta'
            },
            'home_offensive_advantage': {
                'description': 'Home com Vantagem Ofensiva',
                'prediction': 'Vitória do Home ou Empate com gols',
                'likelihood': 'Moderada a Alta'
            },
            'away_offensive_advantage': {
                'description': 'Away com Vantagem Ofensiva',
                'prediction': 'Vitória do Away ou Empate com gols',
                'likelihood': 'Moderada a Alta'
            },
            'balanced_match': {
                'description': 'Partida Equilibrada',
                'prediction': 'Resultado imprevisível - Pode dar qualquer coisa',
                'likelihood': 'Moderada'
            }
        }
        
        dominant_scenario = next(
            (k for k, v in scenarios.items() if v), 
            'balanced_match'
        )
        
        return {
            'dominant_scenario': dominant_scenario,
            **scenario_descriptions.get(dominant_scenario, scenario_descriptions['balanced_match']),
            'metrics': {
                'home_attack_vs_away_defense': {
                    'attack_rating': round(home_attack_vs_away_defense.attack_rating, 2),
                    'defense_rating': round(home_attack_vs_away_defense.defense_rating, 2),
                    'difference': round(home_attack_vs_away_defense.difference, 2),
                    'advantage': home_attack_vs_away_defense.winner
                },
                'away_attack_vs_home_defense': {
                    'attack_rating': round(away_attack_vs_home_defense.attack_rating, 2),
                    'defense_rating': round(away_attack_vs_home_defense.defense_rating, 2),
                    'difference': round(away_attack_vs_home_defense.difference, 2),
                    'advantage': away_attack_vs_home_defense.winner
                }
            }
        }
        
        
        