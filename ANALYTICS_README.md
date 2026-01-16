# TagPeak Framing Study - Analytics Dashboard

## Overview

This is a comprehensive, password-protected analytics dashboard for analyzing the TagPeak email framing study results. It provides statistical analyses, visualizations, and insights based on the survey data.

## Features

- 🔒 **Password Protection**: Secure access to analytics
- 📊 **Comprehensive Statistics**: Descriptive stats, ANOVA, effect sizes
- 📈 **Interactive Visualizations**: Charts using Chart.js
- 🔍 **Moderation Analyses**: Explore how framing effects vary by participant characteristics
- 🌐 **Website Impact Analysis**: Before/after website exposure comparisons
- 💭 **Text Analysis**: Manipulation check and concerns analysis
- 📝 **Conclusions & Recommendations**: Data-driven insights

## Setup

### 1. File Structure

Ensure you have the following files in the same directory:

```
analytics.html
analytics.js
demographics-2026-01-15.csv
framing_study_results-2026-01-15.csv
```

### 2. Password Configuration

**IMPORTANT**: Change the password before deploying!

Edit `analytics.js` and update line 2:

```javascript
const CORRECT_PASSWORD = 'your-secure-password-here';
```

### 3. CSV File Names

The dashboard expects CSV files with the format:
- `demographics-YYYY-MM-DD.csv`
- `framing_study_results-YYYY-MM-DD.csv`

If your files have different names, update the `loadData()` function in `analytics.js`:

```javascript
const demoResponse = await fetch('your-demographics-file.csv');
const framingResponse = await fetch('your-framing-file.csv');
```

## Usage

### Local Development

1. **Option 1: Direct File Opening**
   - Simply open `analytics.html` in a modern web browser
   - Note: Some browsers may block local file loading due to CORS. If charts don't load, use Option 2.

2. **Option 2: Local Server** (Recommended)
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   
   # Then open: http://localhost:8000/analytics.html
   ```

### Production Deployment

1. Upload all files to your web server
2. Ensure CSV files are accessible
3. Update password in `analytics.js`
4. Access via: `https://your-domain.com/analytics.html`

## Dashboard Sections

### 1. Overview & Sample Characteristics
- Total participants
- Sample sizes by condition
- Demographics (age, gender distributions)
- Completion rates

### 2. Data Quality & Exclusion Criteria
- Exclusion rates
- Valid vs. excluded participants
- Quality metrics by condition

### 3. Main Effects: Framing Condition Comparisons
- ANOVA results for all outcomes
- Effect sizes (Cohen's d)
- Mean comparisons across conditions
- Statistical significance indicators

**Outcomes Analyzed:**
- Message Involvement
- Intention to Use (Before Website)
- Intention to Use (After Website)
- Ease of Use
- Clarity
- Perceived Advantage
- Willingness

### 4. Website Exposure Impact
- Before/after website comparisons
- Change in intention scores
- Analysis by framing condition

### 5. Moderation Analyses
Explore how framing effects vary by:
- Investment Involvement (High vs. Low)
- Promotional Benefit Involvement
- Financial Literacy (High/Medium/Low)
- Age Groups
- Income Levels
- Gender
- Shopping Preference

### 6. Manipulation Check
- Word frequency analysis
- Thematic insights
- Condition comparisons

### 7. Concerns & Barriers Analysis
- Common concerns identified
- Barriers to adoption
- Recommendations for addressing concerns

### 8. Conclusions & Recommendations
- Key findings summary
- Best performing frame
- Practical recommendations
- Limitations

## Statistical Methods

### Composite Scores
- **Message Involvement**: Average of 6 items (9-point scale)
- **Intention**: Average of 4 items (7-point scale)
- **Ease of Use**: Combined score (reverse-coded "difficult")
- **Clarity**: Average of 2 items
- **Advantage**: Average of 2 items
- **Willingness**: Average of 3 items
- **Investment Involvement**: Average of 4 items (reverse-coded where needed)
- **Promotional Involvement**: Average of 4 items (reverse-coded where needed)

### Statistical Tests
- **ANOVA**: One-way analysis of variance
- **Effect Sizes**: Cohen's d for pairwise comparisons, η² for overall effects
- **Exclusion Criteria**: Participants excluded if:
  - Partner name ≠ "Tagpeak"
  - Cost understanding ≠ "No"/"Não"

### Note on Statistical Accuracy
The dashboard uses simplified statistical calculations suitable for exploratory analysis. For publication or formal reporting, verify results using statistical software (R, SPSS, Python).

## Customization

### Adding New Analyses

1. **New Outcome Variable**:
   - Add to `outcomes` object in `renderMainEffects()`
   - Ensure data processing includes the variable

2. **New Moderation**:
   - Add option to `moderatorFilter` dropdown
   - Implement logic in `renderModeration()`

3. **New Visualization**:
   - Use Chart.js API
   - Add canvas element and chart configuration

### Styling

Edit the `<style>` section in `analytics.html` to customize:
- Colors
- Fonts
- Layout
- Chart appearance

## Troubleshooting

### Charts Not Loading
- **Issue**: CORS error when opening file directly
- **Solution**: Use a local server (see Setup section)

### Data Not Appearing
- **Check**: CSV file names match expected format
- **Check**: CSV files are in same directory
- **Check**: Browser console for errors

### Password Not Working
- **Check**: Password is correctly set in `analytics.js`
- **Check**: No extra spaces in password input

### Statistical Results Seem Incorrect
- **Note**: Simplified calculations are used
- **Verify**: Use statistical software for publication
- **Check**: Exclusion criteria are correctly applied

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Internet Explorer (not supported)

## Security Notes

- Password is client-side only (not secure for production)
- For production use, implement server-side authentication
- Consider HTTPS for sensitive data
- Don't commit passwords to version control

## Data Privacy

- All processing is done client-side
- No data is sent to external servers
- CSV files remain on your server/local machine

## Support

For issues or questions:
1. Check browser console for errors
2. Verify CSV file format matches expected structure
3. Ensure all required files are present
4. Review this README for common solutions

## Future Enhancements

See `ANALYTICS_TODO.md` for planned improvements:
- Enhanced moderation analyses
- Export functionality
- Advanced text analysis
- Real-time data updates

## License

This dashboard is for internal use. Ensure compliance with data protection regulations (GDPR, etc.) when handling participant data.
