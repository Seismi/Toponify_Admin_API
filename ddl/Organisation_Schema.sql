--
-- PostgreSQL database dump
--

-- Dumped from database version 11.3
-- Dumped by pg_dump version 11.3

-- Started on 2021-01-12 15:50:43

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

--
-- TOC entry 2 (class 3079 OID 21851)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 2860 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 198 (class 1259 OID 21888)
-- Name: application_setup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_setup (
    email_domains character varying[]
);


ALTER TABLE public.application_setup OWNER TO postgres;

--
-- TOC entry 199 (class 1259 OID 21894)
-- Name: revoked_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revoked_tokens (
    token character varying,
    revoked_on timestamp without time zone
);


ALTER TABLE public.revoked_tokens OWNER TO postgres;

--
-- TOC entry 197 (class 1259 OID 21845)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid,
    name character varying,
    email character varying,
    password character varying,
    telephone_number character varying,
    enabled_flag boolean
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 2853 (class 0 OID 21888)
-- Dependencies: 198
-- Data for Name: application_setup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_setup (email_domains) FROM stdin;
{toponify.com,seismi.net}
\.


--
-- TOC entry 2854 (class 0 OID 21894)
-- Dependencies: 199
-- Data for Name: revoked_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revoked_tokens (token, revoked_on) FROM stdin;
eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMDQ5ZDYzMS01MDdiLTRiODctODcyNy00MWYzNWM4ZWY3MzkiLCJuYW1lIjoiRWR2YXJkYXMiLCJleHAiOjE2MTA5NTg2NzksImlhdCI6MTYxMDM1ODY3OX0.lZfS_n8B-EgLoRiigKTmZJUi13VqBwvB9FWYukuq3w-dHdekv_7qefKmYNHSmzLUgA9rbogjrHfgaVmqp2RQXw	2021-01-11 09:51:36.481096
\.


--
-- TOC entry 2852 (class 0 OID 21845)
-- Dependencies: 197
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, telephone_number, enabled_flag) FROM stdin;
d049d631-507b-4b87-8727-41f35c8ef739	Edvardas	edvardas.lunys@toponify.com	$2b$14$bfiN9spqUgJxhV9d3VsQK.MNFkZt5Sje63MiKLZNq7ad/dqmr8R7K	\N	t
dc082833-32c8-4ad5-85df-68134338afdf	Edvardas	edvardas.lunys@seismi.net	$2b$14$LZwlAwlx9ry21OkqdLDmPenVZ7hK7Qg6HLpZDuQ5fwtsgXbEh9rZ.	\N	f
\.


-- Completed on 2021-01-12 15:50:43

--
-- PostgreSQL database dump complete
--

