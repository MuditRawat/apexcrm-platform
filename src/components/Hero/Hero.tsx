import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Sparkles, TrendingUp, Users, DollarSign, Briefcase, Bot, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button/Button';
import styles from './Hero.module.css';

export const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'deals' | 'ai'>('pipeline');
  const [focusedMetric, setFocusedMetric] = useState<'revenue' | 'deals' | 'winrate'>('revenue');
  
  // Deals stage state
  const [deals, setDeals] = useState([
    { id: 1, name: 'Acme Corp', value: 48000, stage: 'Proposal', won: false },
    { id: 2, name: 'Globex Inc', value: 24500, stage: 'Negotiation', won: false },
    { id: 3, name: 'Initech Co', value: 12000, stage: 'Discovery', won: false },
  ]);

  // AI Prompt typing effect state
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>('Select an AI insight action above to simulate...');

  const advanceDeal = (id: number) => {
    setDeals(prevDeals => prevDeals.map(deal => {
      if (deal.id === id) {
        if (deal.stage === 'Discovery') return { ...deal, stage: 'Proposal' };
        if (deal.stage === 'Proposal') return { ...deal, stage: 'Negotiation' };
        if (deal.stage === 'Negotiation') return { ...deal, stage: 'Closed Won', won: true };
        return { ...deal, stage: 'Discovery', won: false }; // Loop back
      }
      return deal;
    }));
  };

  const simulateAiInsight = (actionType: 'email' | 'forecast' | 'risks') => {
    setIsTyping(true);
    setAiResponse('');
    
    let responseText = '';
    if (actionType === 'email') {
      setCurrentPrompt('Draft follow-up email for Acme Corp');
      responseText = "Hey Sarah,\n\nI wanted to follow up on the custom pricing model we sent over on Tuesday. Our engineering team has cleared the API custom fields scope, so we can guarantee a 14-day migration window.\n\nLet's connect for 10 minutes tomorrow to align next steps?\n\nBest,\nAlex | ApexCRM";
    } else if (actionType === 'forecast') {
      setCurrentPrompt('Run Q3 revenue forecast simulation');
      responseText = "📈 APEX INTELLIGENCE FORECAST:\n\nBased on historical win rates and current pipeline acceleration ($428k), Q3 projected revenue is on track for $640,000 (Confidence: 91%).\n\nRecommendation: Focus team resources on closing 'Globex Inc' ($24.5k) to overachieve target by 8%.";
    } else if (actionType === 'risks') {
      setCurrentPrompt('Analyze deal risks in current pipeline');
      responseText = "⚠️ ALERT: 2 key contacts have changed roles.\n\n- Initech Co: Technical Sponsor left last Friday. Action: Re-engage VP of Product immediately.\n- Win rate is dipping slightly in 'Discovery' stage. Consider setting an auto-nudge email sequence.";
    }

    let i = 0;
    const interval = setInterval(() => {
      setAiResponse(prev => prev + responseText.charAt(i));
      i++;
      if (i >= responseText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 12); // speedy elegant typing
  };

  return (
    <section className={styles.heroSection} id="hero">
      {/* Background radial glow */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className={`${styles.container} container`}>
        {/* Text Content */}
        <div className={styles.textContent}>
          <div className={styles.badge}>
            <Sparkles size={14} className={styles.badgeIcon} />
            <span>Introducing Apex Intelligence AI</span>
          </div>

          <h1 className={styles.title}>
            The CRM your sales team will <span className={styles.highlight}>actually love</span> to use.
          </h1>

          <p className={styles.subheading}>
            Close more deals, centralize communication, and automate busywork with the next-generation CRM designed for high-growth teams. No endless setups. No clunky tables. Just acceleration.
          </p>

          <div className={styles.ctaGroup}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '#contact'}
            >
              Start Free Trial <ArrowRight size={18} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '#contact'}
            >
              <Play size={16} fill="currentColor" /> Book a Demo
            </Button>
          </div>

          <div className={styles.socialProof}>
            <p className={styles.socialProofText}>Trusted by engineering and sales teams at scaling companies:</p>
            <div className={styles.logoGrid}>
              <div className={styles.logoItem}>▲ Vercel</div>
              <div className={styles.logoItem}>❖ Figma</div>
              <div className={styles.logoItem}>⧉ Linear</div>
              <div className={styles.logoItem}>⬤ Notion</div>
            </div>
          </div>
        </div>

        {/* CSS-based Interactive CRM Dashboard Graphic */}
        <div className={styles.graphicContainer}>
          <div className={styles.dashboardMockup}>
            {/* Header / Nav Mock */}
            <div className={styles.dashHeader}>
              <div className={styles.dashDots}>
                <span className={`${styles.dot} ${styles.dotRed}`} />
                <span className={`${styles.dot} ${styles.dotYellow}`} />
                <span className={`${styles.dot} ${styles.dotGreen}`} />
              </div>
              <div className={styles.dashSearch} />
              <div className={styles.liveTag}>LIVE INTERACTIVE TOUR</div>
            </div>

            {/* Sidebar + Body Grid */}
            <div className={styles.dashBody}>
              {/* Interactive Sidebar Tabs */}
              <div className={styles.dashSidebar}>
                <button
                  type="button"
                  onClick={() => setActiveTab('pipeline')}
                  className={activeTab === 'pipeline' ? styles.sidebarLinkActive : styles.sidebarLink}
                  aria-label="Pipeline Analytics Tab"
                  title="Pipeline Analytics"
                >
                  <TrendingUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('deals')}
                  className={activeTab === 'deals' ? styles.sidebarLinkActive : styles.sidebarLink}
                  aria-label="Interactive Deals Board Tab"
                  title="Deals Manager"
                >
                  <Briefcase size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ai')}
                  className={activeTab === 'ai' ? styles.sidebarLinkActive : styles.sidebarLink}
                  aria-label="AI Sales Copilot Tab"
                  title="AI Copilot"
                >
                  <Bot size={16} />
                </button>
              </div>

              {/* Main Area based on Active Tab */}
              <div className={styles.dashMain}>
                
                {/* 1. PIPELINE ANALYTICS TAB */}
                {activeTab === 'pipeline' && (
                  <>
                    <div className={styles.dashRow}>
                      <div>
                        <h3 className={styles.dashTitle}>Pipeline Performance</h3>
                        <p className={styles.dashSubtitle}>Click cards below to filter trends</p>
                      </div>
                      <span className={styles.dashBadge}>+24% this week</span>
                    </div>

                    {/* Interactive Cards Grid */}
                    <div className={styles.dashCards}>
                      <button
                        type="button"
                        onClick={() => setFocusedMetric('revenue')}
                        className={`${styles.dashCard} ${focusedMetric === 'revenue' ? styles.focusedCard : ''}`}
                      >
                        <div className={styles.dashCardHeader}>
                          <DollarSign size={13} className={styles.cardIconBlue} />
                          <span className={styles.dashCardLabel}>Revenue</span>
                        </div>
                        <p className={styles.dashCardValue}>$428,290</p>
                        <div className={styles.dashProgress} style={{ '--progress-pct': '72%' } as React.CSSProperties} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setFocusedMetric('deals')}
                        className={`${styles.dashCard} ${focusedMetric === 'deals' ? styles.focusedCard : ''}`}
                      >
                        <div className={styles.dashCardHeader}>
                          <Users size={13} className={styles.cardIconIndigo} />
                          <span className={styles.dashCardLabel}>Deals</span>
                        </div>
                        <p className={styles.dashCardValue}>142</p>
                        <div className={styles.dashProgress} style={{ '--progress-pct': '85%' } as React.CSSProperties} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setFocusedMetric('winrate')}
                        className={`${styles.dashCard} ${focusedMetric === 'winrate' ? styles.focusedCard : ''}`}
                      >
                        <div className={styles.dashCardHeader}>
                          <TrendingUp size={13} className={styles.cardIconGreen} />
                          <span className={styles.dashCardLabel}>Win Rate</span>
                        </div>
                        <p className={styles.dashCardValue}>34.8%</p>
                        <div className={styles.dashProgress} style={{ '--progress-pct': '54%' } as React.CSSProperties} />
                      </button>
                    </div>

                    {/* Mini Dynamic Graph illustration */}
                    <div className={styles.dashGraph}>
                      <div className={styles.graphHeader}>
                        <span>
                          {focusedMetric === 'revenue' && 'Monthly Revenue Growth ($)'}
                          {focusedMetric === 'deals' && 'Active Customer Deal Count'}
                          {focusedMetric === 'winrate' && 'Conversion Rate Trends (%)'}
                        </span>
                        <span className={styles.graphLegend}>
                          <span className={styles.legendDotBlue} /> Target
                          <span className={styles.legendDotIndigo} /> Actual
                        </span>
                      </div>
                      
                      <div className={styles.graphBars}>
                        {focusedMetric === 'revenue' && (
                          <>
                            <div className={styles.graphBarCol}>
                              <div className={styles.bar1} style={{ height: '40%' }} />
                              <div className={styles.bar2} style={{ height: '30%' }} />
                              <span className={styles.barLabel}>Mar</span>
                            </div>
                            <div className={styles.graphBarCol}>
                              <div className={styles.bar1} style={{ height: '60%' }} />
                              <div className={styles.bar2} style={{ height: '45%' }} />
                              <span className={styles.barLabel}>Apr</span>
                            </div>
                            <div className={styles.graphBarCol}>
                              <div className={styles.bar1} style={{ height: '70%' }} />
                              <div className={styles.bar2} style={{ height: '65%' }} />
                              <span className={styles.barLabel}>May</span>
                            </div>
                            <div className={styles.graphBarCol}>
                              <div className={styles.bar1} style={{ height: '90%' }} />
                              <div className={styles.bar2} style={{ height: '85%' }} />
                              <span className={styles.barLabel}>Jun</span>
                            </div>
                          </>
                        )}
                        {focusedMetric === 'deals' && (
                          <>
                            <div className={styles.graphBarCol}>
                              <div className={styles.bar1} style={{ height: '30%' }} />
                              <div className={styles.bar2} style={{ height: '50%' }} />
                              <span className={styles.barLabel}>Mar</span>
                            </div>
                            <div className={styles.graphBarCol}>
                              <div className={styles.bar1} style={{ height: '50%' }} />
                              <div className={styles.bar2} style={{ height: '75%' }} />
                              <span className={styles.barLabel}>Apr</span>
                            </div>
                            <div className={styles.graphBarCol}>
                              <div className={styles.bar1} style={{ height: '65%' }} />
                              <div className={styles.bar2} style={{ height: '80%' }} />
                              <span className={styles.barLabel}>May</span>
                            </div>
                            <div className={styles.graphBarCol}>
                              <div className={styles.bar1} style={{ height: '80%' }} />
                              <div className={styles.bar2} style={{ height: '95%' }} />
                              <span className={styles.barLabel}>Jun</span>
                            </div>
                          </>
                        )}
                        {focusedMetric === 'winrate' && (
                          <>
                            <div className={styles.graphBarCol}>
                              <div className={styles.bar1} style={{ height: '80%' }} />
                              <div className={styles.bar2} style={{ height: '30%' }} />
                              <span className={styles.barLabel}>Mar</span>
                            </div>
                            <div className={styles.graphBarCol}>
                              <div className={styles.bar1} style={{ height: '75%' }} />
                              <div className={styles.bar2} style={{ height: '40%' }} />
                              <span className={styles.barLabel}>Apr</span>
                            </div>
                            <div className={styles.graphBarCol}>
                              <div className={styles.bar1} style={{ height: '60%' }} />
                              <div className={styles.bar2} style={{ height: '55%' }} />
                              <span className={styles.barLabel}>May</span>
                            </div>
                            <div className={styles.graphBarCol}>
                              <div className={styles.bar1} style={{ height: '50%' }} />
                              <div className={styles.bar2} style={{ height: '72%' }} />
                              <span className={styles.barLabel}>Jun</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* 2. DEALS BOARD TAB */}
                {activeTab === 'deals' && (
                  <div className={styles.tabContentWrapper}>
                    <div className={styles.dashRow}>
                      <div>
                        <h3 className={styles.dashTitle}>Interactive Deal Pipeline</h3>
                        <p className={styles.dashSubtitle}>Click card button to advance stage</p>
                      </div>
                    </div>
                    <div className={styles.dealsList}>
                      {deals.map(deal => (
                        <div key={deal.id} className={styles.dealCard}>
                          <div className={styles.dealInfo}>
                            <p className={styles.dealName}>{deal.name}</p>
                            <span className={styles.dealValue}>${deal.value.toLocaleString()}</span>
                          </div>
                          <div className={styles.dealActionArea}>
                            <span className={`${styles.dealStageBadge} ${deal.won ? styles.stageWon : ''}`}>
                              {deal.stage}
                            </span>
                            <button
                              type="button"
                              onClick={() => advanceDeal(deal.id)}
                              className={styles.dealAdvanceBtn}
                              aria-label={`Advance ${deal.name} sales stage`}
                            >
                              Nudge
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. AI SALES ASSISTANT TAB */}
                {activeTab === 'ai' && (
                  <div className={styles.tabContentWrapper}>
                    <div className={styles.dashRow}>
                      <div>
                        <h3 className={styles.dashTitle}>Apex AI Copilot</h3>
                        <p className={styles.dashSubtitle}>Select an agent macro prompt below</p>
                      </div>
                    </div>
                    
                    <div className={styles.aiMacros}>
                      <button
                        type="button"
                        onClick={() => simulateAiInsight('email')}
                        className={styles.aiMacroBtn}
                        disabled={isTyping}
                      >
                        Draft Followup
                      </button>
                      <button
                        type="button"
                        onClick={() => simulateAiInsight('forecast')}
                        className={styles.aiMacroBtn}
                        disabled={isTyping}
                      >
                        Forecast Q3
                      </button>
                      <button
                        type="button"
                        onClick={() => simulateAiInsight('risks')}
                        className={styles.aiMacroBtn}
                        disabled={isTyping}
                      >
                        Deals Audit
                      </button>
                    </div>

                    <div className={styles.aiChatbox}>
                      <div className={styles.aiChatHeader}>
                        <MessageSquare size={11} />
                        <span>Prompt: "{currentPrompt}"</span>
                      </div>
                      <div className={styles.aiChatBody}>
                        {isTyping && <span className={styles.blinkingCursor} />}
                        <p className={styles.aiResponseText}>{aiResponse || (isTyping ? '' : 'Click a macro above to run simulated smart forecasting & automated deal drafts...')}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
