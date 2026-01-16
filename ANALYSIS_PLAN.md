# TagPeak Framing Study - Analysis Plan & Research Considerations

## Context Understanding

**TagPeak's Unique Value Proposition:**
- Growth-linked cashback (not fixed) tied to financial market performance
- Minimum 0.5% guaranteed, potential up to 100% of purchase value
- 4-6 month investment period before rewards mature
- Risk-free for consumers (no personal investment required)
- ESG-focused investment approach
- Positioned as alternative to traditional discounts/cashback

**Research Question:**
How do different email framing strategies (financial markets frame vs. cashback frame vs. generic reward frame) influence consumer responses to TagPeak?

---

## Analysis Priorities: To-Do List

### 🔴 CRITICAL ANALYSES (Must-Have)

#### 1. **Framing Condition Main Effects**
- **What**: Compare A (Financial), B (Cashback), C (Generic) across all key outcomes
- **Why**: Core research question - which framing works best?
- **Metrics to analyze**:
  - Message involvement (6-item scale, 9-point)
  - Intention to use (before website: 4 items, 7-point)
  - Intention to use (after website: 4 items, 7-point)
  - Ease of use perceptions (2 items, 7-point)
  - Clarity perceptions (2 items, 7-point)
  - Perceived advantage (2 items, 7-point)
  - Willingness to use (3 items, 7-point)
- **Statistical tests**: 
  - One-way ANOVA with post-hoc tests (Tukey HSD)
  - Effect sizes (Cohen's d, η²)
  - Confidence intervals

#### 2. **Website Exposure Impact (Repeated Measures)**
- **What**: Compare intention scores before vs. after website exposure
- **Why**: TagPeak's complexity may require website to fully understand; measure learning effect
- **Analysis**:
  - Paired t-tests for each framing condition separately
  - Mixed ANOVA (framing × time interaction)
  - Website viewing time as covariate
- **Key question**: Does website exposure change framing effects?

#### 3. **Exclusion Criteria & Data Quality**
- **What**: Filter participants based on exclusion questions
- **Why**: Ensure participants actually read and understood the email
- **Criteria**:
  - Correct partner name (Tagpeak vs. distractors)
  - Correct cost understanding (No additional cost)
- **Action**: Report exclusion rates by condition; analyze with/without exclusions

#### 4. **Manipulation Check Analysis**
- **What**: Qualitative analysis of open-ended manipulation thoughts
- **Why**: Verify that framing conditions actually created different perceptions
- **Methods**:
  - Thematic analysis (financial terms, risk mentions, investment language)
  - Word frequency analysis by condition
  - Sentiment analysis
  - Code for: financial market references, risk perception, complexity mentions

---

### 🟡 HIGH-PRIORITY ANALYSES (Should-Have)

#### 5. **Involvement as Moderator**
- **What**: Test if baseline involvement moderates framing effects
- **Why**: Academic research shows involvement is key moderator
- **Variables**:
  - Investment involvement (baseline, 4 items)
  - Initial promotional benefit involvement (baseline, 4 items)
- **Analysis**:
  - Create involvement composite scores (reverse code where needed)
  - Median split or continuous moderation analysis
  - Interaction effects: Framing × Investment Involvement, Framing × Promotional Involvement
- **Hypothesis**: High investment involvement → Financial frame (A) more effective; Low → Generic frame (C) more effective

#### 6. **Financial Literacy as Moderator**
- **What**: Test if financial knowledge moderates framing effects
- **Why**: Financial frame may require literacy to understand/appreciate
- **Analysis**:
  - Create financial literacy score (0-3 correct answers)
  - Categorize: Low (0-1), Medium (2), High (3)
  - Test Framing × Financial Literacy interactions
- **Hypothesis**: High financial literacy → Financial frame (A) more effective

#### 7. **Demographic Segmentation**
- **What**: Analyze framing effects by demographics
- **Why**: Different segments may respond differently
- **Segments**:
  - Age groups (especially 26-35 vs. 51+)
  - Income levels (may affect risk perception)
  - Gender (research shows differences in financial decision-making)
  - Shopping preference (online vs. in-person)
- **Analysis**: 
  - Subgroup analyses by condition
  - Test for significant interactions
  - Report effect sizes within segments

#### 8. **Message Involvement Mediation**
- **What**: Test if message involvement mediates framing → intention relationship
- **Why**: Involvement theory suggests involvement drives behavior
- **Analysis**:
  - Mediation analysis (Baron & Kenny or PROCESS macro)
  - Path: Framing → Message Involvement → Intention
  - Test all 6 involvement dimensions separately
- **Hypothesis**: Framing affects involvement, which affects intention

#### 9. **Perceived Risk & Complexity Analysis**
- **What**: Extract risk/complexity perceptions from manipulation check
- **Why**: TagPeak's financial markets link may create risk perception
- **Analysis**:
  - Code manipulation thoughts for:
    - Risk mentions (positive/negative)
    - Complexity mentions
    - Trust/security concerns
  - Compare by framing condition
  - Test if risk perception mediates effects

---

### 🟢 MEDIUM-PRIORITY ANALYSES (Nice-to-Have)

#### 10. **Brand Selection Effects**
- **What**: Analyze if selected brand influences responses
- **Why**: Different brands may have different customer bases/expectations
- **Analysis**:
  - Compare high-involvement brands (Samsung, Adidas) vs. lower
  - Test Brand × Framing interactions
  - Consider brand familiarity/trust

#### 11. **Composite Score Creation & Validation**
- **What**: Create reliable composite measures
- **Why**: Multiple items should be combined for stronger measures
- **Scales to create**:
  - Message Involvement Index (6 items, Cronbach's α)
  - Intention to Use Index (before/after, 4 items each)
  - Ease of Use Index (2 items, reverse code difficult)
  - Clarity Index (2 items)
  - Advantage Index (2 items)
  - Willingness Index (3 items)
- **Validation**: 
  - Internal consistency (α > 0.70)
  - Confirmatory factor analysis if needed

#### 12. **Concerns & Barriers Analysis**
- **What**: Thematic analysis of concerns text
- **Why**: Identify common barriers to adoption
- **Methods**:
  - Thematic coding (risk, complexity, trust, timing, etc.)
  - Compare concerns by framing condition
  - Identify most common barriers
  - Test if concerns predict intention

#### 13. **Website Engagement Analysis**
- **What**: Analyze website viewing time
- **Why**: Engagement may indicate interest/comprehension
- **Analysis**:
  - Descriptive stats (mean, median, distribution)
  - Test if viewing time correlates with intention changes
  - Compare viewing time by framing condition
  - Identify optimal viewing time threshold

#### 14. **Response Quality Indicators**
- **What**: Check for data quality issues
- **Why**: Ensure valid responses
- **Checks**:
  - Completion rates by screen
  - Straight-lining (same response across items)
  - Response time analysis (too fast = low quality)
  - Missing data patterns
  - Outlier detection

---

### 🔵 ADVANCED ANALYSES (If Resources Allow)

#### 15. **Structural Equation Modeling (SEM)**
- **What**: Test full theoretical model
- **Why**: Understand complex relationships simultaneously
- **Model**:
  - Framing → Message Involvement → Perceptions (Ease, Clarity, Advantage) → Intention
  - Include moderators (involvement, financial literacy)
  - Test indirect effects

#### 16. **Latent Class Analysis**
- **What**: Identify unobserved segments
- **Why**: May reveal hidden patterns in responses
- **Analysis**: 
  - Cluster participants based on response patterns
  - Test if segments respond differently to framing
  - Profile segments demographically

#### 17. **Text Mining & NLP Analysis**
- **What**: Advanced text analysis of open-ended responses
- **Why**: Extract deeper insights from qualitative data
- **Methods**:
  - Topic modeling (LDA)
  - Named entity recognition (financial terms)
  - Emotion detection
  - Comparative text analysis by condition

#### 18. **Time-Series Analysis** (if multiple data collections)
- **What**: Track changes over time
- **Why**: Understand if effects are stable
- **Analysis**:
  - Compare early vs. late respondents
  - Test for order effects
  - Seasonal/trend analysis

---

## Key Research Questions to Answer

### Primary Questions:
1. **Which email framing is most effective?** (A, B, or C)
2. **Does framing effect persist after website exposure?**
3. **Who responds best to which framing?** (moderators)

### Secondary Questions:
4. **How does message involvement mediate effects?**
5. **What are the main barriers/concerns?**
6. **Does financial literacy matter?**
7. **How does baseline involvement affect responses?**

---

## Statistical Considerations

### Sample Size Requirements:
- **Minimum**: 30-50 per condition (90-150 total) for basic comparisons
- **Ideal**: 100+ per condition (300+ total) for moderation analyses
- **Power analysis**: Calculate based on expected effect sizes (framing effects often small: d = 0.2-0.4)

### Effect Size Benchmarks:
- **Small**: d = 0.2, η² = 0.01
- **Medium**: d = 0.5, η² = 0.06
- **Large**: d = 0.8, η² = 0.14
- **Framing effects typically**: Small to medium

### Assumptions to Check:
- Normality (Shapiro-Wilk, visual inspection)
- Homogeneity of variance (Levene's test)
- Independence of observations
- Missing data patterns (MCAR assumption)

---

## Reporting Priorities

### Executive Summary Should Include:
1. **Main finding**: Which framing works best (with effect sizes)
2. **Practical recommendation**: Which email to use
3. **Segmentation insights**: Who to target with which frame
4. **Key barriers**: What concerns to address

### Detailed Report Should Include:
1. Descriptive statistics (means, SDs by condition)
2. Main effects (ANOVA results with effect sizes)
3. Moderation analyses (who responds to what)
4. Mediation analyses (why framing works)
5. Qualitative insights (themes from open-ended)
6. Limitations and future research

---

## Tools & Software Recommendations

### Statistical Analysis:
- **R** (recommended): `tidyverse`, `lme4`, `mediation`, `semTools`
- **SPSS**: Good for ANOVA, moderation
- **Python**: `pandas`, `scipy`, `statsmodels`, `scikit-learn` (for ML approaches)

### Visualization:
- **R**: `ggplot2`, `plotly`
- **Python**: `matplotlib`, `seaborn`, `plotly`
- **JavaScript**: `Chart.js`, `D3.js` (for interactive dashboard)

### Qualitative Analysis:
- **NVivo** or **Dedoose**: Thematic coding
- **Python**: `nltk`, `spaCy` (NLP)
- **R**: `quanteda`, `tm` (text mining)

---

## Academic Research Alignment

### Key Theories to Reference:
1. **Prospect Theory** (Kahneman & Tversky): Loss aversion, framing effects
2. **Involvement Theory** (Zaichkowsky, Laurent & Kapferer): Message processing
3. **Elaboration Likelihood Model** (Petty & Cacioppo): Central vs. peripheral processing
4. **Technology Acceptance Model**: Ease of use, perceived advantage
5. **Theory of Planned Behavior**: Intention → Behavior

### Expected Findings (Based on Literature):
- **Financial frame (A)**: May work better for high-involvement, financially literate consumers
- **Cashback frame (B)**: May work better for general audience (familiar concept)
- **Generic frame (C)**: May reduce complexity but also reduce differentiation
- **Website exposure**: Likely increases intention (more information = better understanding)

---

## Next Steps

1. ✅ **Data Collection**: Ensure sufficient sample size per condition
2. ✅ **Data Cleaning**: Apply exclusion criteria, check quality
3. ✅ **Exploratory Analysis**: Descriptive stats, visualizations
4. ✅ **Primary Analyses**: Main effects, repeated measures
5. ✅ **Moderation Analyses**: Involvement, financial literacy, demographics
6. ✅ **Mediation Analyses**: Message involvement pathways
7. ✅ **Qualitative Analysis**: Thematic coding of open-ended responses
8. ✅ **Reporting**: Executive summary + detailed report
9. ✅ **Dashboard Creation**: Interactive visualization tool

---

## Questions to Consider Before Analysis

- [ ] What is the minimum sample size needed? (Power analysis)
- [ ] How will missing data be handled? (Listwise deletion, imputation, etc.)
- [ ] What is the exclusion criteria threshold? (Both questions correct? One?)
- [ ] How to handle outliers? (Z-scores > 3? Visual inspection?)
- [ ] Should intention scores be averaged or analyzed separately?
- [ ] How to code financial literacy? (Sum score? Weighted?)
- [ ] What alpha level for significance? (0.05? Bonferroni correction?)
- [ ] How to handle multiple comparisons? (Post-hoc corrections)
- [ ] Should website viewing time be log-transformed? (likely right-skewed)
- [ ] How to present results to different audiences? (academic vs. business)

---

## References to Consult

1. **Framing Effects**: 
   - Prospect Theory (Kahneman & Tversky, 1979)
   - Gain vs. Loss Framing meta-analyses
   - Email framing in marketing contexts

2. **Involvement Theory**:
   - Zaichkowsky (1985) - Personal Involvement Inventory
   - Laurent & Kapferer (1985) - Consumer Involvement Profiles
   - Mittal (1989) - Purchase Decision Involvement

3. **Financial Decision-Making**:
   - Financial literacy and consumer behavior
   - Risk perception in financial products
   - Investment decision-making research

4. **Technology Adoption**:
   - Technology Acceptance Model (TAM)
   - Perceived ease of use and usefulness
   - Innovation adoption research

---

*This analysis plan should be reviewed and refined based on actual data characteristics and research objectives.*
