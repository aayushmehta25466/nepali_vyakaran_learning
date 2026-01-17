import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

// Hero Section
const HeroSection = styled.section`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: white;
  overflow: hidden;
`;

const HeroContent = styled(motion.div)`
  max-width: 900px;
  z-index: 10;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.4rem;
  margin-bottom: 40px;
  opacity: 0.95;
  font-weight: 300;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CTAButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 60px;
`;

const CTAButton = styled(Link)`
  padding: 16px 50px;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  display: inline-block;
  white-space: nowrap;
  
  ${props => props.primary ? `
    background: white;
    color: #667eea;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }
  ` : `
    background: transparent;
    color: white;
    border: 2px solid white;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
  `}
`;

const HeroIllustration = styled(motion.div)`
  font-size: 200px;
  margin-top: 40px;
  opacity: 0.8;
  
  @media (max-width: 768px) {
    font-size: 120px;
  }
`;

// Features Section
const FeaturesSection = styled.section`
  padding: 80px 20px;
  background: #f5f5f5;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  color: #333;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.2);
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 40px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
  font-size: 1rem;
`;

// Learning Path Section
const LearningPathSection = styled.section`
  padding: 80px 20px;
  background: white;
`;

const PathGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
`;

const PathCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 15px;
  padding: 30px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
    transform: translateY(-5px);
  }
`;

const PathIcon = styled.div`
  font-size: 50px;
  margin-bottom: 15px;
`;

const PathTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
`;

const PathDescription = styled.p`
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
`;

// Stats Section
const StatsSection = styled.section`
  padding: 80px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  text-align: center;
`;

const StatItem = styled(motion.div)``;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  opacity: 0.95;
`;

// Mobile App Section
const MobileAppSection = styled.section`
  padding: 80px 20px;
  background: #f5f5f5;
`;

const MobileContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const MobileText = styled.div``;

const MobileTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 20px;
`;

const MobileDescription = styled.p`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.7;
  margin-bottom: 30px;
`;

const AppBadges = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const AppBadge = styled.a`
  display: inline-block;
  background: white;
  padding: 12px 24px;
  border-radius: 10px;
  text-decoration: none;
  color: #667eea;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
  }
`;

const MobileIllustration = styled.div`
  font-size: 200px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 120px;
  }
`;

// CTA Banner
const CTABanner = styled.section`
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
`;

const BannerTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const BannerSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.95;
`;

const PublicHome = () => {
  const { t, language } = useLanguage();

  const features = [
    {
      icon: '📚',
      title: language === 'ne' ? 'नि:शुल्क, मजेदार र प्रभावकारी' : 'Free, Fun & Effective',
      description: language === 'ne' 
        ? 'नेपाली सिकाइ मजेदार छ र अनुसन्धानले देखाएको छ कि यो काम गर्छ! छोटो, बाइट-साइज्ड पाठहरूसँग, तपाई अंक अर्जन गर्नुहोस्।'
        : 'Learning Nepali is fun and research shows it works! With short bite-sized lessons, earn points and unlock new levels.'
    },
    {
      icon: '🔬',
      title: language === 'ne' ? 'विज्ञान द्वारा समर्थित' : 'Backed by Science',
      description: language === 'ne'
        ? 'हामी अनुसन्धान-समर्थित शिक्षण विधि र आनन्ददायक सामग्रीको संयोजन प्रयोग गर्छौं जो पढन, लेखन, सुनने र बोल्ने कौशल सिकाउँछ।'
        : 'We use research-backed teaching methods combined with delightful content to teach reading, writing, listening & speaking skills.'
    },
    {
      icon: '🎯',
      title: language === 'ne' ? 'प्रेरित रहनुहोस्' : 'Stay Motivated',
      description: language === 'ne'
        ? 'हामी खेल-जस्तै सुविधा, मजेदार चुनौती र मित्रवत् प्रतिक्रियाको साथ नेपाली सिकाइको आदत बनाउन सहज बनाउँछौं।'
        : 'We make it easy to form a learning habit with game-like features, fun challenges, and friendly progress tracking.'
    },
    {
      icon: '✨',
      title: language === 'ne' ? 'व्यक्तिगत शिक्षण' : 'Personalized Learning',
      description: language === 'ne'
        ? 'AI र भाषा विज्ञानको सर्वश्रेष्ठ संयोजन, पाठहरू तपाईलाई सही स्तर र गतिमा सिक्न मद्दत गर्न अनुकूलित छन्।'
        : 'Combining the best of AI and language science, lessons are tailored to help you learn at the right level and pace.'
    }
  ];

  const learningPaths = [
    {
      icon: '📖',
      title: t('lessons') || (language === 'ne' ? 'पाठहरू' : 'Lessons'),
      description: language === 'ne' ? 'संरचित पाठहरूसँग मूलभूत नेपाली व्याकरण र शब्दावली सिकनुहोस्।' : 'Learn Nepali grammar & vocabulary with structured lessons.'
    },
    {
      icon: '🎮',
      title: t('games') || (language === 'ne' ? 'खेलहरू' : 'Games'),
      description: language === 'ne' ? 'रमाइलो, इन्टरएक्टिभ खेलहरू खेल्दै नेपाली सिकनुहोस्।' : 'Learn while playing fun, interactive language games.'
    },
    {
      icon: '✍️',
      title: t('writing') || (language === 'ne' ? 'लेखन' : 'Writing'),
      description: language === 'ne' ? 'व्यावहारिक लेखन अभ्यासमार्फत आपनो कौशल सुधार गर्नुहोस्।' : 'Improve your skills through practical writing exercises.'
    },
    {
      icon: '📊',
      title: t('progress') || (language === 'ne' ? 'प्रगति' : 'Progress'),
      description: language === 'ne' ? 'आपनो सीखने की यात्रा ट्र्याक गर्नुहोस् र बिस्तृत विश्लेषण देख्नुहोस्।' : 'Track your learning journey with detailed analytics.'
    }
  ];

  const stats = [
    { number: '50K+', label: language === 'ne' ? 'सक्रिय शिक्षार्थी' : 'Active Learners' },
    { number: '1000+', label: language === 'ne' ? 'प्रश्नहरू' : 'Questions' },
    { number: '100+', label: language === 'ne' ? 'पाठहरू' : 'Lessons' },
    { number: '95%', label: language === 'ne' ? 'सफलता दर' : 'Success Rate' }
  ];

  return (
    <>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          key={language}
        >
          <HeroTitle>
            {language === 'ne' ? 'नेपाली सिकनुहोस्' : 'Learn Nepali'}
          </HeroTitle>
          <HeroSubtitle>
            {language === 'ne' 
              ? 'नि:शुल्क, मजेदार र प्रभावकारी तरिकामा नेपाली भाषा सिकनुहोस्' 
              : 'Learn the Nepali language in a free, fun and effective way'}
          </HeroSubtitle>
          
          <CTAButtonGroup>
            <CTAButton to="/register" primary>
              {t('get_started') || (language === 'ne' ? 'शुरु गर्नुहोस्' : 'Get Started')}
            </CTAButton>
            <CTAButton to="/login">
              {language === 'ne' ? 'पहिलेदेखि खाता छ?' : 'Already have an account?'}
            </CTAButton>
          </CTAButtonGroup>

          <HeroIllustration
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            📚
          </HeroIllustration>
        </HeroContent>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <Container>
          <SectionTitle key={language}>
            {language === 'ne' ? 'किन नेपाली सिकनुहोस्?' : 'Why Learn Nepali?'}
          </SectionTitle>
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </Container>
      </FeaturesSection>

      {/* Learning Paths Section */}
      <LearningPathSection>
        <Container>
          <SectionTitle key={`${language}-paths`}>
            {language === 'ne' ? 'सिक्ने तरिकाहरू' : 'Learning Paths'}
          </SectionTitle>
          <PathGrid>
            {learningPaths.map((path, index) => (
              <PathCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <PathIcon>{path.icon}</PathIcon>
                <PathTitle>{path.title}</PathTitle>
                <PathDescription>{path.description}</PathDescription>
              </PathCard>
            ))}
          </PathGrid>
        </Container>
      </LearningPathSection>

      {/* Stats Section */}
      <StatsSection>
        <Container>
          <StatsGrid>
            {stats.map((stat, index) => (
              <StatItem
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <StatNumber>{stat.number}</StatNumber>
                <StatLabel>{stat.label}</StatLabel>
              </StatItem>
            ))}
          </StatsGrid>
        </Container>
      </StatsSection>

      {/* Mobile App Section */}
      <MobileAppSection>
        <Container>
          <MobileContent>
            <MobileText>
              <MobileTitle>
                {language === 'ne' ? 'कहीँ पनि, कहिले पनि सिकनुहोस्' : 'Learn Anywhere, Anytime'}
              </MobileTitle>
              <MobileDescription>
                {language === 'ne'
                  ? 'iOS र Android मा उपलब्ध। बसमा हिँड्दै पनि नेपाली सिकनुहोस्। आपनो समयमा, आपनो गतिमा।'
                  : 'Available on iOS and Android. Learn Nepali while commuting. At your own pace.'}
              </MobileDescription>
              <AppBadges>
                <AppBadge href="#">📱 App Store</AppBadge>
                <AppBadge href="#">🤖 Google Play</AppBadge>
              </AppBadges>
            </MobileText>
            <MobileIllustration>📱</MobileIllustration>
          </MobileContent>
        </Container>
      </MobileAppSection>

      {/* Final CTA */}
      <CTABanner key={`${language}-cta`}>
        <BannerTitle>
          {language === 'ne' ? 'नेपाली सिक्न तयार?' : 'Ready to Learn Nepali?'}
        </BannerTitle>
        <BannerSubtitle>
          {language === 'ne' ? 'आज नै शुरु गर्नुहोस् - बिनामूल्य!' : 'Start today - completely free!'}
        </BannerSubtitle>
        <CTAButton to="/register" primary style={{ display: 'inline-block' }}>
          {t('get_started') || (language === 'ne' ? 'शुरु गर्नुहोस्' : 'Get Started')}
        </CTAButton>
      </CTABanner>
    </>
  );
};

export default PublicHome;
