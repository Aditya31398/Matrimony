-- ─────────────────────────────────────────────────────────────────────────
-- SoulSync Matrimony — Database Schema
-- MySQL 8.0+
-- ─────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS soulsync
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE soulsync;

-- ── Users ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  email         VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'USER',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Profiles ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                  BIGINT       NOT NULL AUTO_INCREMENT,
  user_id             BIGINT,
  first_name          VARCHAR(80)  NOT NULL,
  last_name           VARCHAR(80),
  date_of_birth       DATE,
  gender              VARCHAR(20),
  profession          VARCHAR(120),
  city                VARCHAR(100),
  state               VARCHAR(100),
  country             VARCHAR(100) DEFAULT 'India',
  religion            VARCHAR(100),
  height              VARCHAR(20),
  mother_tongue       VARCHAR(100),
  dietary_preference  VARCHAR(60),
  education           VARCHAR(120),
  horoscope           VARCHAR(80),
  bio                 TEXT,
  photo_url           VARCHAR(500),
  is_verified         TINYINT(1)   NOT NULL DEFAULT 0,
  is_premium          TINYINT(1)   NOT NULL DEFAULT 0,
  interests           TEXT,          -- comma-separated tags
  lifestyle           TEXT,          -- comma-separated tags
  looking_for         TEXT,          -- newline-separated bullet points
  looking_for_gender  VARCHAR(10),
  age_min             INT,
  age_max             INT,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_profiles_user (user_id),
  KEY idx_profiles_city (city),
  KEY idx_profiles_gender (gender),
  KEY idx_profiles_verified (is_verified),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Matches ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id                  BIGINT      NOT NULL AUTO_INCREMENT,
  sender_profile_id   BIGINT      NOT NULL,
  receiver_profile_id BIGINT      NOT NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_match_pair (sender_profile_id, receiver_profile_id),
  KEY idx_match_receiver (receiver_profile_id),
  KEY idx_match_status (status),
  CONSTRAINT fk_match_sender   FOREIGN KEY (sender_profile_id)   REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_match_receiver FOREIGN KEY (receiver_profile_id) REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Conversations ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id          BIGINT   NOT NULL AUTO_INCREMENT,
  profile1_id BIGINT   NOT NULL,
  profile2_id BIGINT   NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_conv_p1 (profile1_id),
  KEY idx_conv_p2 (profile2_id),
  CONSTRAINT fk_conv_p1 FOREIGN KEY (profile1_id) REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_conv_p2 FOREIGN KEY (profile2_id) REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Messages ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id                 BIGINT      NOT NULL AUTO_INCREMENT,
  conversation_id    BIGINT      NOT NULL,
  sender_profile_id  BIGINT      NOT NULL,
  content            TEXT        NOT NULL,
  is_read            TINYINT(1)  NOT NULL DEFAULT 0,
  sent_at            DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_msg_conv (conversation_id),
  KEY idx_msg_sent (sent_at),
  CONSTRAINT fk_msg_conv   FOREIGN KEY (conversation_id)   REFERENCES conversations (id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_profile_id) REFERENCES profiles      (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Success Stories ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS success_stories (
  id           BIGINT       NOT NULL AUTO_INCREMENT,
  couple_names VARCHAR(200) NOT NULL,
  story        TEXT         NOT NULL,
  matched_date DATE,
  photo_url    VARCHAR(500),
  rating       INT          NOT NULL DEFAULT 5,
  is_visible   TINYINT(1)  NOT NULL DEFAULT 1,
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_stories_visible (is_visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
