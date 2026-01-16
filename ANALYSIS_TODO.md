# TagPeak Framing Study - Analysis To-Do List

## 🎯 Pre-Analysis Checklist

### Data Preparation
- [ ] **Verify data structure**: Ensure CSV files match expected format (framing_study_results.csv, demographics.csv)
- [ ] **Check sample sizes**: Minimum 30-50 per condition (90-150 total); ideal 100+ per condition (300+ total)
- [ ] **Data cleaning**: 
  - Handle missing values (decide: listwise deletion vs. imputation)
  - Check for duplicates
  - Validate data ranges (Likert scales: 1-7 or 1-9)
- [ ] **Create composite scores**: 
  - Message Involvement Index (6 items, Cronbach's α)
  - Intention Index - Before Website (4 items)
  - Intention Index - After Website (4 items)
  - Ease of Use Index (reverse code "difficult")
  - Clarity Index (2 items)
  - Advantage Index (2 items)
  - Willingness Index (3 items)
- [ ] **Reverse code items**: Investment involvement (important, relevant), Initial involvement (important, relevant)

---

## 🔴 CRITICAL ANALYSES (Do First)

### 1. Exclusion Criteria & Data Quality
- [ ] **Apply exclusion filters**:
  - Correct partner name = "Tagpeak" (exclude if wrong)
  - Correct cost understanding = "No" (exclude if "Yes")
- [ ] **Report exclusion rates** by condition (A, B, C)
- [ ] **Data quality checks**:
  - Completion rates by screen
  - Straight-lining detection (same response across items)
  - Response time analysis (flag suspiciously fast responses)
  - Outlier detection (Z-scores > 3)

**Output**: Clean dataset with exclusion flags, quality report

---

### 2. Descriptive Statistics
- [ ] **Demographics summary**:
  - Age distribution
  - Gender distribution
  - Income distribution
  - Shopping preference
  - Financial literacy scores (0-3)
- [ ] **Baseline measures**:
  - Investment involvement (mean, SD by condition)
  - Initial promotional benefit involvement (mean, SD by condition)
- [ ] **Key outcomes by condition**:
  - Message involvement (6 dimensions)
  - Intention scores (before/after website)
  - Perceptions (ease, clarity, advantage)
  - Willingness scores
  - Website viewing time

**Output**: Summary tables, distribution plots

---

### 3. Main Effects: Framing Condition Comparisons
- [ ] **One-way ANOVA** for each outcome:
  - Message Involvement (6 dimensions separately + composite)
  - Intention to Use - Before Website (4 items + composite)
  - Intention to Use - After Website (4 items + composite)
  - Ease of Use (2 items + composite)
  - Clarity (2 items + composite)
  - Perceived Advantage (2 items + composite)
  - Willingness (3 items + composite)
- [ ] **Post-hoc tests** (Tukey HSD) to identify which conditions differ
- [ ] **Effect sizes**: Cohen's d for pairwise comparisons, η² for overall effect
- [ ] **Visualizations**: 
  - Bar charts with error bars by condition
  - Box plots showing distributions
  - Significance indicators

**Output**: ANOVA tables, effect size tables, comparison charts

---

### 4. Website Exposure Impact (Repeated Measures)
- [ ] **Paired t-tests**: Intention before vs. after website (for each condition separately)
- [ ] **Mixed ANOVA**: Framing (A/B/C) × Time (Before/After) interaction
- [ ] **Website viewing time**:
  - Descriptive stats (mean, median, distribution)
  - Correlation with intention change (after - before)
  - Compare viewing time by condition
- [ ] **Interpretation**: Does website exposure change framing effects?

**Output**: Repeated measures ANOVA table, interaction plots, viewing time analysis

---

### 5. Manipulation Check (Qualitative)
- [ ] **Thematic coding** of manipulation thoughts:
  - Financial market references (count by condition)
  - Risk mentions (positive/negative)
  - Complexity mentions
  - Investment language
  - Cashback/reward language
- [ ] **Word frequency analysis** by condition
- [ ] **Sentiment analysis** (if using NLP tools)
- [ ] **Verification**: Do conditions actually create different perceptions?

**Output**: Thematic summary, word clouds, frequency tables

---

## 🟡 HIGH-PRIORITY ANALYSES (Do Next)

### 6. Involvement as Moderator
- [ ] **Create involvement scores**:
  - Investment Involvement Index (4 items, reverse code important/relevant)
  - Promotional Benefit Involvement Index (4 items, reverse code important/relevant)
  - Check internal consistency (Cronbach's α > 0.70)
- [ ] **Moderation analysis**:
  - Framing × Investment Involvement interaction
  - Framing × Promotional Involvement interaction
  - Use median split or continuous moderation (PROCESS macro or similar)
- [ ] **Simple effects**: Test framing effects at high vs. low involvement
- [ ] **Visualization**: Interaction plots (framing × involvement)

**Output**: Moderation tables, interaction plots, simple effects tests

---

### 7. Financial Literacy as Moderator
- [ ] **Create financial literacy score**:
  - Sum correct answers (0-3)
  - Categorize: Low (0-1), Medium (2), High (3)
- [ ] **Moderation analysis**:
  - Framing × Financial Literacy interaction
  - Test if financial frame (A) works better for high literacy
- [ ] **Simple effects**: Framing effects at each literacy level
- [ ] **Visualization**: Interaction plots

**Output**: Moderation tables, interaction plots

---

### 8. Demographic Segmentation
- [ ] **Subgroup analyses** by:
  - Age groups (especially 26-35 vs. 51+)
  - Income levels
  - Gender
  - Shopping preference (online vs. in-person)
- [ ] **Test interactions**: Framing × Demographics
- [ ] **Report effect sizes** within each segment
- [ ] **Identify segments** that respond best to each frame

**Output**: Subgroup comparison tables, segment-specific effect sizes

---

### 9. Message Involvement Mediation
- [ ] **Mediation analysis** (Baron & Kenny or PROCESS):
  - Path: Framing → Message Involvement → Intention
  - Test all 6 involvement dimensions separately
  - Test composite involvement index
- [ ] **Indirect effects**: Calculate and test significance
- [ ] **Visualization**: Mediation path diagrams

**Output**: Mediation tables, path coefficients, indirect effect tests

---

### 10. Perceived Risk & Complexity
- [ ] **Code manipulation thoughts** for:
  - Risk mentions (count, sentiment)
  - Complexity mentions
  - Trust/security concerns
- [ ] **Compare by condition**: Which frame creates more risk perception?
- [ ] **Test if risk mediates**: Framing → Risk Perception → Intention
- [ ] **Identify concerns** that predict lower intention

**Output**: Risk/complexity summary by condition, mediation results

---

## 🟢 MEDIUM-PRIORITY ANALYSES (If Time Permits)

### 11. Brand Selection Effects
- [ ] **Compare responses** by selected brand
- [ ] **Test Brand × Framing interaction**
- [ ] **Group brands** by category (tech, fashion, etc.) if meaningful
- [ ] **Identify brand-specific patterns**

**Output**: Brand comparison tables

---

### 12. Concerns & Barriers Analysis
- [ ] **Thematic coding** of concerns text:
  - Risk/uncertainty
  - Complexity/understanding
  - Trust/security
  - Timing (4-6 months)
  - Value perception
- [ ] **Frequency analysis** by condition
- [ ] **Test if concerns predict intention**: Regression with concerns as predictor
- [ ] **Identify most common barriers** to address in messaging

**Output**: Thematic summary, frequency tables, regression results

---

### 13. Website Engagement Analysis
- [ ] **Website viewing time**:
  - Distribution analysis (likely right-skewed, consider log transform)
  - Correlation with intention change
  - Optimal threshold identification
- [ ] **Compare by condition**: Does framing affect engagement?
- [ ] **Test if viewing time moderates**: Framing × Viewing Time → Intention

**Output**: Viewing time analysis, correlation tables

---

### 14. Composite Score Validation
- [ ] **Internal consistency**: Cronbach's α for all composite scores
- [ ] **Factor analysis**: Confirmatory if needed (CFA)
- [ ] **Item-total correlations**: Check for problematic items
- [ ] **Reliability**: Test-retest if applicable

**Output**: Reliability tables, factor loadings

---

## 🔵 ADVANCED ANALYSES (Optional/If Resources Allow)

### 15. Structural Equation Modeling (SEM)
- [ ] **Build theoretical model**:
  - Framing → Message Involvement → Perceptions → Intention
  - Include moderators (involvement, financial literacy)
- [ ] **Test model fit**: χ², CFI, RMSEA, SRMR
- [ ] **Test indirect effects**: Mediation pathways
- [ ] **Compare models**: Nested model comparisons

**Output**: SEM path diagram, fit indices, indirect effects

---

### 16. Latent Class Analysis
- [ ] **Identify unobserved segments** based on response patterns
- [ ] **Profile segments** demographically
- [ ] **Test if segments respond differently** to framing
- [ ] **Interpret segments** (e.g., "risk-averse", "financially engaged")

**Output**: Segment profiles, segment × framing analysis

---

### 17. Advanced Text Analysis
- [ ] **Topic modeling** (LDA) on open-ended responses
- [ ] **Named entity recognition** (financial terms, brands)
- [ ] **Emotion detection** (sentiment by condition)
- [ ] **Comparative text analysis** (A vs. B vs. C)

**Output**: Topic models, emotion scores, comparative analysis

---

## 📊 Reporting & Visualization

### Executive Summary
- [ ] **Main finding**: Which framing works best (with effect sizes)
- [ ] **Practical recommendation**: Which email to use
- [ ] **Segmentation insights**: Who to target with which frame
- [ ] **Key barriers**: What concerns to address
- [ ] **Website impact**: Does exposure change outcomes?

### Detailed Report
- [ ] **Introduction**: Research question, TagPeak context
- [ ] **Methods**: Sample, measures, analysis plan
- [ ] **Results**: 
  - Descriptive statistics
  - Main effects (with effect sizes)
  - Moderation analyses
  - Mediation analyses
  - Qualitative insights
- [ ] **Discussion**: 
  - Interpretation of findings
  - Alignment with theory
  - Practical implications
  - Limitations
- [ ] **Recommendations**: Actionable next steps

### Interactive Dashboard
- [ ] **Key metrics overview**: Response rates, completion rates
- [ ] **Framing comparisons**: Interactive charts (A vs. B vs. C)
- [ ] **Segmentation views**: Filter by demographics
- [ ] **Moderation visualizations**: Interaction plots
- [ ] **Export functionality**: Download charts, data tables

---

## 🎓 Academic Considerations

### Theory Alignment
- [ ] **Prospect Theory**: Loss aversion, framing effects
- [ ] **Involvement Theory**: Message processing pathways
- [ ] **ELM**: Central vs. peripheral processing
- [ ] **TAM**: Technology acceptance factors
- [ ] **TPB**: Intention-behavior relationship

### Statistical Best Practices
- [ ] **Power analysis**: Calculate required sample size
- [ ] **Assumption checks**: Normality, homogeneity, independence
- [ ] **Multiple comparisons**: Bonferroni or FDR correction
- [ ] **Effect size reporting**: Always include (not just p-values)
- [ ] **Confidence intervals**: Report for all estimates

### Research Questions to Answer
- [ ] **Primary**: Which framing is most effective?
- [ ] **Primary**: Does website exposure change effects?
- [ ] **Primary**: Who responds best to which framing?
- [ ] **Secondary**: How does involvement mediate?
- [ ] **Secondary**: What are main barriers?
- [ ] **Secondary**: Does financial literacy matter?

---

## 📋 Quick Reference: Key Variables

### Independent Variable
- **Framing Condition**: A (Financial), B (Cashback), C (Generic)

### Dependent Variables
- Message Involvement (6 items, 9-point)
- Intention to Use - Before (4 items, 7-point)
- Intention to Use - After (4 items, 7-point)
- Ease of Use (2 items, 7-point)
- Clarity (2 items, 7-point)
- Perceived Advantage (2 items, 7-point)
- Willingness (3 items, 7-point)

### Moderators
- Investment Involvement (baseline, 4 items)
- Promotional Benefit Involvement (baseline, 4 items)
- Financial Literacy (0-3)
- Demographics (age, gender, income, shopping preference)

### Mediators
- Message Involvement (6 dimensions)
- Perceived Risk (from manipulation check)
- Perceptions (ease, clarity, advantage)

### Control Variables
- Website Viewing Time
- Selected Brand
- Exclusion Criteria (partner name, cost understanding)

---

## ⚠️ Important Decisions to Make

- [ ] **Exclusion criteria**: Both questions correct? Or one?
- [ ] **Missing data**: Listwise deletion? Imputation method?
- [ ] **Outliers**: Z-score threshold? Visual inspection?
- [ ] **Alpha level**: 0.05? Bonferroni correction?
- [ ] **Composite scores**: Average? Weighted? Factor scores?
- [ ] **Involvement coding**: Median split? Continuous? Tertiles?
- [ ] **Website time**: Log transform? Categorize?
- [ ] **Multiple comparisons**: Which correction method?

---

*Review this list before starting analysis. Adjust priorities based on research objectives and data characteristics.*
