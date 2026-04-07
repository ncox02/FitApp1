-- ============================================================
-- RESPIRE — Complete Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USER SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid REFERENCES auth.users NOT NULL UNIQUE,
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now(),

  -- Profile
  name                      text,
  bodyweight_lbs            numeric,
  height_in                 numeric,
  age                       integer,
  body_fat_pct              numeric,
  lean_mass_lbs             numeric,

  -- Training schedule
  training_days             integer[] DEFAULT '{1,2,4,5,6}',
  allow_sunday              boolean DEFAULT false,
  onboarded                 boolean DEFAULT false,

  -- Programs
  strength_program          text DEFAULT 'g2f',
  occams_variant            text DEFAULT 'machine',
  occams_next_workout       text DEFAULT 'A',
  running_plan              text DEFAULT 'maf',
  core_enabled              boolean DEFAULT true,
  posterior_enabled         boolean DEFAULT true,
  mobility_enabled          boolean DEFAULT true,
  nutrition_enabled         boolean DEFAULT true,

  -- Strength state
  strength_rest_phase       integer DEFAULT 1,
  strength_test_done        boolean DEFAULT false,
  last_strength_date        date,

  -- Running state
  running_hr_target         integer,
  running_start_miles       numeric DEFAULT 3.0,
  running_progression_pct   integer DEFAULT 10,
  running_progression_type  text DEFAULT 'time',
  last_run_date             date,
  current_run_miles         numeric DEFAULT 3.0,
  last_run_type             text,

  -- Posterior state
  posterior_days_per_week   integer DEFAULT 2,
  last_posterior_date       date,

  -- Nutrition
  nutrition_plan            text DEFAULT 'slowcarb',
  calorie_goal              integer,
  protein_goal_g            integer,
  cheat_day                 integer DEFAULT 6,

  -- Mobility
  mobility_areas            text[] DEFAULT '{shoulders,hips,wrists}',
  side_plank_enabled        boolean DEFAULT false,

  -- Supplements
  sup_pagg                  boolean DEFAULT false,
  sup_creatine              boolean DEFAULT false,
  sup_glutamine             boolean DEFAULT false,
  sup_cq                    boolean DEFAULT false,
  sup_ala                   boolean DEFAULT false,
  sup_policosanol           boolean DEFAULT false,
  sup_cold_exposure         boolean DEFAULT false,

  -- Notifications
  morning_reminder_time     time DEFAULT '07:00',
  evening_reminder_time     time DEFAULT '20:00',
  push_subscription         jsonb,

  -- Exercise customization
  disabled_exercises        text[] DEFAULT '{}'
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON user_settings
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STRENGTH LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS strength_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  created_at        timestamptz DEFAULT now(),
  session_date      date NOT NULL,
  logged_at         timestamptz DEFAULT now(),
  program           text NOT NULL,
  is_test_session   boolean DEFAULT false,
  rest_phase        integer,
  occams_workout    text,
  session_notes     text,
  started_at        timestamptz,
  ended_at          timestamptz
);

CREATE TABLE IF NOT EXISTS strength_log_sets (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strength_log_id         uuid REFERENCES strength_logs ON DELETE CASCADE NOT NULL,
  user_id                 uuid REFERENCES auth.users NOT NULL,
  exercise_name           text NOT NULL,
  exercise_order          integer,
  weight_lbs              numeric,
  reps_completed          integer NOT NULL,
  reached_true_failure    boolean DEFAULT false,
  is_test_set             boolean DEFAULT false,
  test_five_rep_weight    numeric,
  starting_weight_lbs     numeric,
  notes                   text,
  logged_at               timestamptz DEFAULT now()
);

ALTER TABLE strength_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own strength logs" ON strength_logs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE strength_log_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own strength sets" ON strength_log_sets
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_strength_logs_user_date ON strength_logs(user_id, session_date DESC);
CREATE INDEX idx_strength_sets_log ON strength_log_sets(strength_log_id);
CREATE INDEX idx_strength_sets_exercise ON strength_log_sets(user_id, exercise_name, logged_at DESC);

-- ============================================================
-- RUNNING LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS running_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  created_at        timestamptz DEFAULT now(),
  session_date      date NOT NULL,
  logged_at         timestamptz DEFAULT now(),
  run_type          text NOT NULL,
  distance_miles    numeric,
  duration_min      numeric,
  avg_hr_bpm        integer,
  max_hr_bpm        integer,
  maf_hr_target     integer,
  hr_compliance     boolean,
  avg_pace_per_mile numeric,
  intervals_completed integer,
  notes             text
);

ALTER TABLE running_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own run logs" ON running_logs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_running_logs_user_date ON running_logs(user_id, session_date DESC);

-- ============================================================
-- POSTERIOR LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS posterior_logs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users NOT NULL,
  created_at            timestamptz DEFAULT now(),
  session_date          date NOT NULL,
  logged_at             timestamptz DEFAULT now(),
  glute_bridge_reps     integer DEFAULT 20,
  raises_reps_per_side  integer DEFAULT 15,
  kb_weight_lbs         numeric,
  kb_total_reps         integer,
  notes                 text
);

ALTER TABLE posterior_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own posterior logs" ON posterior_logs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_posterior_logs_user_date ON posterior_logs(user_id, session_date DESC);

-- ============================================================
-- CORE LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS core_logs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users NOT NULL,
  created_at            timestamptz DEFAULT now(),
  session_date          date NOT NULL,
  logged_at             timestamptz DEFAULT now(),
  crunch_reps           integer,
  crunch_weight_lbs     numeric DEFAULT 0,
  cat_vomit_reps        integer,
  cat_vomit_hold_sec    integer,
  side_plank_done       boolean DEFAULT false,
  side_plank_sec_each   integer,
  notes                 text
);

ALTER TABLE core_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own core logs" ON core_logs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MOBILITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS mobility_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  created_at        timestamptz DEFAULT now(),
  session_date      date NOT NULL,
  logged_at         timestamptz DEFAULT now(),
  areas_completed   text[],
  duration_min      integer,
  notes             text
);

ALTER TABLE mobility_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mobility logs" ON mobility_logs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MEASUREMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS measurements (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  created_at        timestamptz DEFAULT now(),
  measured_date     date NOT NULL,
  measured_at       timestamptz DEFAULT now(),
  bodyweight_lbs    numeric,
  body_fat_pct      numeric,
  lean_mass_lbs     numeric,
  rmr_kcal          integer,
  -- Ferriss standard TI set
  waist_in          numeric,
  hips_in           numeric,
  right_arm_in      numeric,
  left_arm_in       numeric,
  right_thigh_in    numeric,
  left_thigh_in     numeric,
  -- Extended
  neck_in           numeric,
  chest_in          numeric,
  shoulders_in      numeric,
  right_calf_in     numeric,
  left_calf_in      numeric,
  -- Calculated
  total_inches      numeric,
  notes             text
);

ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own measurements" ON measurements
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_measurements_user_date ON measurements(user_id, measured_date DESC);

-- ============================================================
-- INGREDIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS ingredients (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users NOT NULL,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),
  name                  text NOT NULL,
  store                 text,
  brand                 text,
  serving_size          numeric DEFAULT 1,
  serving_unit          text DEFAULT 'serving',
  calories              numeric DEFAULT 0,
  protein_g             numeric DEFAULT 0,
  carbs_g               numeric DEFAULT 0,
  total_fat_g           numeric DEFAULT 0,
  saturated_fat_g       numeric DEFAULT 0,
  fiber_g               numeric DEFAULT 0,
  added_sugars_g        numeric DEFAULT 0,
  sodium_mg             numeric DEFAULT 0,
  unit_price            numeric,
  servings_per_package  numeric,
  cost_per_serving      numeric,
  protein_per_dollar    numeric,
  calories_per_dollar   numeric,
  is_archived           boolean DEFAULT false
);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ingredients" ON ingredients
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ingredients_user ON ingredients(user_id, name);

-- ============================================================
-- MEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS meals (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users NOT NULL,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),
  name                  text NOT NULL,
  meal_type             text DEFAULT 'any',
  notes                 text,
  is_archived           boolean DEFAULT false,
  total_calories        numeric DEFAULT 0,
  total_protein_g       numeric DEFAULT 0,
  total_carbs_g         numeric DEFAULT 0,
  total_fat_g           numeric DEFAULT 0,
  total_sodium_mg       numeric DEFAULT 0,
  total_fiber_g         numeric DEFAULT 0,
  total_added_sugars_g  numeric DEFAULT 0,
  total_cost            numeric DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meal_ingredients (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id               uuid REFERENCES meals ON DELETE CASCADE NOT NULL,
  ingredient_id         uuid REFERENCES ingredients NOT NULL,
  user_id               uuid REFERENCES auth.users NOT NULL,
  servings              numeric DEFAULT 1,
  ingredient_name       text,
  protein_per_serving   numeric,
  calories_per_serving  numeric
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meals" ON meals
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE meal_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meal ingredients" ON meal_ingredients
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_meals_user ON meals(user_id);
CREATE INDEX idx_meal_ingredients_meal ON meal_ingredients(meal_id);

-- ============================================================
-- MEAL PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS meal_plans (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid REFERENCES auth.users NOT NULL,
  created_at                  timestamptz DEFAULT now(),
  updated_at                  timestamptz DEFAULT now(),
  week_start_date             date NOT NULL,
  default_breakfast_meal_id   uuid REFERENCES meals,
  default_lunch_meal_id       uuid REFERENCES meals,
  default_dinner_meal_id      uuid REFERENCES meals,
  default_snack_meal_ids      uuid[],
  cheat_day_notes             text,
  UNIQUE(user_id, week_start_date)
);

CREATE TABLE IF NOT EXISTS meal_plan_overrides (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id    uuid REFERENCES meal_plans ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES auth.users NOT NULL,
  override_date   date NOT NULL,
  meal_slot       text NOT NULL,
  meal_id         uuid REFERENCES meals,
  UNIQUE(meal_plan_id, override_date, meal_slot)
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meal plans" ON meal_plans
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE meal_plan_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own overrides" ON meal_plan_overrides
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- NUTRITION LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  created_at        timestamptz DEFAULT now(),
  log_date          date NOT NULL,
  is_cheat_day      boolean DEFAULT false,
  total_calories    numeric DEFAULT 0,
  total_protein_g   numeric DEFAULT 0,
  total_carbs_g     numeric DEFAULT 0,
  total_fat_g       numeric DEFAULT 0,
  total_sodium_mg   numeric DEFAULT 0,
  total_fiber_g     numeric DEFAULT 0,
  water_oz          numeric DEFAULT 0,
  on_plan           boolean,
  plan_notes        text,
  UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS nutrition_log_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrition_log_id  uuid REFERENCES nutrition_logs ON DELETE CASCADE NOT NULL,
  user_id           uuid REFERENCES auth.users NOT NULL,
  logged_at         timestamptz DEFAULT now(),
  meal_id           uuid REFERENCES meals,
  meal_name         text NOT NULL,
  servings          numeric DEFAULT 1,
  meal_slot         text,
  calories          numeric DEFAULT 0,
  protein_g         numeric DEFAULT 0,
  carbs_g           numeric DEFAULT 0,
  fat_g             numeric DEFAULT 0,
  sodium_mg         numeric DEFAULT 0,
  is_quick_entry    boolean DEFAULT false,
  notes             text
);

ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own nutrition logs" ON nutrition_logs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE nutrition_log_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own nutrition entries" ON nutrition_log_entries
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date DESC);
CREATE INDEX idx_nutrition_entries_log ON nutrition_log_entries(nutrition_log_id);

-- ============================================================
-- SLEEP & DAILY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS sleep_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users NOT NULL,
  created_at    timestamptz DEFAULT now(),
  log_date      date NOT NULL,
  hours_slept   numeric,
  quality       integer CHECK (quality BETWEEN 1 AND 5),
  bedtime       time,
  wake_time     time,
  notes         text,
  UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS daily_logs (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid REFERENCES auth.users NOT NULL,
  log_date                    date NOT NULL,
  bodyweight_lbs              numeric,
  water_oz                    numeric DEFAULT 0,
  took_pagg                   boolean,
  took_creatine               boolean,
  took_glutamine              boolean,
  took_cq                     boolean,
  cheat_day_first_meal_done   boolean,
  cheat_day_air_squats_done   boolean,
  cold_exposure_done          boolean,
  morning_water_done          boolean,
  notes                       text,
  UNIQUE(user_id, log_date)
);

ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sleep logs" ON sleep_logs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own daily logs" ON daily_logs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HELPFUL VIEW: latest measurements per user
-- ============================================================
CREATE OR REPLACE VIEW latest_measurements AS
SELECT DISTINCT ON (user_id) *
FROM measurements
ORDER BY user_id, measured_date DESC;
