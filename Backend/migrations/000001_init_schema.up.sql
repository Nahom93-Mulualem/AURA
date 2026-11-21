-- 000001_init_schema.up.sql
-- Aura by HANI: Core Database Schema

-- Enable UUID extension for robust, non-enumerable primary keys
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Admins Table
-- Stores authorized studio managers (HANI) with secure bcrypt password hashes
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Perfumes Table
-- Stores boutique fragrances, Ethiopian Birr pricing, and scent pyramids
CREATE TABLE IF NOT EXISTS perfumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    subtitle VARCHAR(255) NOT NULL,
    tagline VARCHAR(255) DEFAULT '',
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    size_ml VARCHAR(50) NOT NULL DEFAULT '100ml',
    category VARCHAR(50) NOT NULL CHECK (category IN ('unisex', 'feminine', 'masculine')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('available', 'sold_out', 'new')),
    featured BOOLEAN NOT NULL DEFAULT false,
    top_notes TEXT[] NOT NULL DEFAULT '{}',
    heart_notes TEXT[] NOT NULL DEFAULT '{}',
    base_notes TEXT[] NOT NULL DEFAULT '{}',
    images TEXT[] NOT NULL DEFAULT '{}',
    longevity VARCHAR(50) DEFAULT '',
    best_season VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- High-performance database indexes for instant query lookups
CREATE INDEX IF NOT EXISTS idx_perfumes_slug ON perfumes(slug);
CREATE INDEX IF NOT EXISTS idx_perfumes_status ON perfumes(status);
CREATE INDEX IF NOT EXISTS idx_perfumes_category ON perfumes(category);
CREATE INDEX IF NOT EXISTS idx_perfumes_featured ON perfumes(featured);
CREATE INDEX IF NOT EXISTS idx_perfumes_created_at ON perfumes(created_at DESC);
