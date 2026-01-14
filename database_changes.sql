-- Database schema changes for updated survey questions
-- Run these SQL commands in your Supabase SQL editor

-- 0. Update framing_condition constraint to allow A, B, C instead of positive, negative, neutral
-- First, drop the existing constraint
ALTER TABLE framing_study_results 
DROP CONSTRAINT IF EXISTS framing_study_results_framing_condition_check;

-- Create new constraint allowing A, B, C
ALTER TABLE framing_study_results
ADD CONSTRAINT framing_study_results_framing_condition_check 
CHECK (framing_condition IN ('A', 'B', 'C', 'positive', 'negative', 'neutral'));

-- Note: We include old values for backward compatibility with existing data
-- If you want to only allow A, B, C, use: CHECK (framing_condition IN ('A', 'B', 'C'))

-- 1. Add new columns for investment involvement (before financial literacy)
ALTER TABLE framing_study_results
ADD COLUMN IF NOT EXISTS investment_involvement_important INTEGER,
ADD COLUMN IF NOT EXISTS investment_involvement_relevant INTEGER,
ADD COLUMN IF NOT EXISTS investment_involvement_meaningful INTEGER,
ADD COLUMN IF NOT EXISTS investment_involvement_valuable INTEGER;

-- 2. Replace exclusion questions columns
-- Remove old columns (optional - comment out if you want to keep old data)
-- ALTER TABLE framing_study_results DROP COLUMN IF EXISTS exclusion_benefit_type;
-- ALTER TABLE framing_study_results DROP COLUMN IF EXISTS exclusion_percentage;

-- Add new exclusion columns
ALTER TABLE framing_study_results
ADD COLUMN IF NOT EXISTS exclusion_partner_name TEXT,
ADD COLUMN IF NOT EXISTS exclusion_additional_cost TEXT;

-- 3. Replace manipulation check columns
-- Remove old columns (optional - comment out if you want to keep old data)
-- ALTER TABLE framing_study_results DROP COLUMN IF EXISTS manipulation_loss_emphasis;
-- ALTER TABLE framing_study_results DROP COLUMN IF EXISTS manipulation_global_idea;

-- Add new manipulation thoughts column
ALTER TABLE framing_study_results
ADD COLUMN IF NOT EXISTS manipulation_thoughts TEXT;

-- 4. Remove old ease of use columns (product_explain_easy, product_description_easy)
-- These are no longer used, but we keep them for backward compatibility
-- ALTER TABLE framing_study_results DROP COLUMN IF EXISTS product_explain_easy;
-- ALTER TABLE framing_study_results DROP COLUMN IF EXISTS product_description_easy;

-- Note: ease_difficult, ease_easy, clarity_steps_clear, clarity_feel_secure remain the same

-- Summary of changes:
-- NEW COLUMNS:
--   - investment_involvement_important (INTEGER)
--   - investment_involvement_relevant (INTEGER)
--   - investment_involvement_meaningful (INTEGER)
--   - investment_involvement_valuable (INTEGER)
--   - exclusion_partner_name (TEXT)
--   - exclusion_additional_cost (TEXT)
--   - manipulation_thoughts (TEXT)
--
-- REMOVED COLUMNS (optional to drop):
--   - exclusion_benefit_type
--   - exclusion_percentage
--   - manipulation_loss_emphasis
--   - manipulation_global_idea
--   - product_explain_easy
--   - product_description_easy
--
-- UNCHANGED COLUMNS:
--   - All other columns remain the same
