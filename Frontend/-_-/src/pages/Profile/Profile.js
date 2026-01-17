import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { Star, Trophy, Flame, BookOpen, Zap } from 'lucide-react';
import { getUserStats } from '../../services/api';

const ProfileContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 12px;
  margin-bottom: 40px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
`;

const AvatarPlaceholder = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  font-size: 1.8rem;
  margin: 0 0 10px 0;
  font-weight: 700;
`;

const UserEmail = styled.p`
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.9;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
    transform: translateY(-4px);
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: unset;
    -webkit-text-fill-color: unset;
    background-clip: unset;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const SectionTitle = styled.h3`
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BadgesSection = styled.div`
  margin-bottom: 40px;
`;

const BadgeContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
`;

const BadgeItem = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 12px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);

  svg {
    width: 32px;
    height: 32px;
    margin-bottom: 8px;
  }

  .badge-name {
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .badge-date {
    font-size: 0.75rem;
    opacity: 0.8;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background: #f5f5f5;
  border-radius: 12px;
  color: #999;

  p {
    margin: 0;
    font-size: 0.95rem;
  }
`;

const AchievementsSection = styled.div`
  margin-bottom: 40px;
`;

const AchievementList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AchievementItem = styled.div`
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 15px;

  .icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .content {
    flex: 1;

    .name {
      font-weight: 600;
      color: #333;
      margin-bottom: 2px;
    }

    .date {
      font-size: 0.85rem;
      color: #999;
    }
  }
`;

const Profile = () => {
  const { t } = useLanguage();
  const { gameState } = useGame();
  const { user } = useAuth();
  const [backendStats, setBackendStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user stats from backend on component mount
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const stats = await getUserStats();
        if (stats) {
          setBackendStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  // Use backend stats if available, otherwise fallback to gameState from context
  const displayStats = backendStats || gameState;

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <DashboardLayout pageTitle={t('profile')}>
      <ProfileContainer>
        {/* Header Section with User Info */}
        <HeaderSection>
          <AvatarPlaceholder>👤</AvatarPlaceholder>
          <UserInfo>
            <UserName>{user?.username || 'User'}</UserName>
            <UserEmail>{user?.email || 'user@example.com'}</UserEmail>
          </UserInfo>
        </HeaderSection>

        {/* Stats Grid */}
        <StatsGrid>
          <StatCard>
            <StatValue>
              <Star size={28} />
              {displayStats?.level || gameState.level}
            </StatValue>
            <StatLabel>{t('level') || 'Level'}</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue>
              <Zap size={28} />
              {displayStats?.points || gameState.points}
            </StatValue>
            <StatLabel>{t('points') || 'Points'}</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue>
              💰
              {displayStats?.coins || gameState.coins}
            </StatValue>
            <StatLabel>{t('coins') || 'Coins'}</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue>
              <Flame size={28} />
              {displayStats?.currentStreak || gameState.currentStreak}
            </StatValue>
            <StatLabel>{t('current_streak') || 'Current Streak'}</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue>
              <BookOpen size={28} />
              {displayStats?.completedLessons?.length || gameState.completedLessons?.length || 0}
            </StatValue>
            <StatLabel>{t('lessons_completed') || 'Lessons Completed'}</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue>
              {displayStats?.totalCorrectAnswers || gameState.totalCorrectAnswers}
            </StatValue>
            <StatLabel>{t('correct_answers') || 'Correct Answers'}</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Badges Section */}
        {(displayStats?.badges || gameState.badges) && (displayStats?.badges?.length || gameState.badges?.length) > 0 && (
          <BadgesSection>
            <SectionTitle>
              <Trophy size={24} />
              {t('badges') || 'Badges'}
            </SectionTitle>
            <BadgeContainer>
              {(displayStats?.badges || gameState.badges)?.map((badge, index) => (
                <BadgeItem key={index}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                    {badge.icon || '🏆'}
                  </div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-date">{formatDate(badge.earnedAt)}</div>
                </BadgeItem>
              ))}
            </BadgeContainer>
          </BadgesSection>
        )}

        {/* Achievements Section */}
        {(displayStats?.achievements || gameState.achievements) && (displayStats?.achievements?.length || gameState.achievements?.length) > 0 && (
          <AchievementsSection>
            <SectionTitle>
              <Zap size={24} />
              {t('achievements') || 'Achievements'}
            </SectionTitle>
            <AchievementList>
              {(displayStats?.achievements || gameState.achievements)?.map((achievement, index) => (
                <AchievementItem key={index}>
                  <div className="icon">⭐</div>
                  <div className="content">
                    <div className="name">{achievement.name}</div>
                    <div className="date">{formatDate(achievement.earnedAt)}</div>
                  </div>
                </AchievementItem>
              ))}
            </AchievementList>
          </AchievementsSection>
        )}

        {/* Empty States */}
        {(!displayStats?.badges || displayStats?.badges?.length === 0) && (!gameState.badges || gameState.badges.length === 0) && (
          <BadgesSection>
            <SectionTitle>
              <Trophy size={24} />
              {t('badges') || 'Badges'}
            </SectionTitle>
            <EmptyState>
              <p>{t('no_badges_yet') || 'No badges earned yet. Keep learning!'}</p>
            </EmptyState>
          </BadgesSection>
        )}

        {(!displayStats?.achievements || displayStats?.achievements?.length === 0) && (!gameState.achievements || gameState.achievements.length === 0) && (
          <AchievementsSection>
            <SectionTitle>
              <Zap size={24} />
              {t('achievements') || 'Achievements'}
            </SectionTitle>
            <EmptyState>
              <p>{t('no_achievements_yet') || 'No achievements yet. Complete lessons to earn achievements!'}</p>
            </EmptyState>
          </AchievementsSection>
        )}
      </ProfileContainer>
    </DashboardLayout>
  );
};

export default Profile;
