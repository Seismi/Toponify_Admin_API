--
-- PostgreSQL database
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

/*
  SCHEMA
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';

SET default_tablespace = '';

SET default_with_oids = false;


--
-- TOKENS
--

CREATE TABLE public.revoked_tokens (
    token character varying NOT NULL,
    revoked_on timestamp without time zone NOT NULL
);

ALTER TABLE public.revoked_tokens OWNER TO postgres;


--
-- USERS
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    telephone_number character varying,
    enabled_flag boolean NOT NULL
);

ALTER TABLE public.users OWNER TO postgres;

ALTER TABLE ONLY public.users
    ADD CONSTRAINT email UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
