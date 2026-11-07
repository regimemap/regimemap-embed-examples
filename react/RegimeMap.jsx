'use client'; // Next.js App Router: the embeds run in the browser only.
/*
 * Regime Map embeds in React (and Next.js, Remix, Gatsby…).
 *
 * The loader (embed.js) scans the page for [data-regimemap] elements once, when it
 * loads. A single-page app adds elements later, so after every mount we call
 * window.RegimeMapEmbed.scan(), the loader's only global. An element is mounted once;
 * to change its options, give it a new `key` so React replaces the element.
 *
 * The markup matches what https://regimemap.com/data-api/ gives (2026-11-02). For a
 * language other than English, take the words from the configurator in that language:
 * the sentence inside the <div> (`fallback`), the credit prefix (`credit`, e.g. "Karte:"
 * in German, "地圖：" in Traditional Chinese, no space after a full-width colon) and, for a
 * card, the dossier URL. The link text is always "Regime Map".
 *
 * The credit line under each embed is required by the embed terms
 * (https://regimemap.com/data-api/#embed-terms). You may add rel="nofollow" to it.
 */
import { useEffect } from 'react';

const SRC = 'https://regimemap.com/embed/v1/embed.js';

function useRegimeMapLoader(deps) {
  useEffect(() => {
    if (window.RegimeMapEmbed) { window.RegimeMapEmbed.scan(); return; }
    if (document.querySelector(`script[src="${SRC}"]`)) return; // loading: it scans when it runs
    const s = document.createElement('script');
    s.async = true;
    s.src = SRC;
    s.referrerPolicy = 'no-referrer';
    document.head.appendChild(s);
  }, deps);
}

/** "Map: Regime Map": a space after the prefix, except after a full-width colon (Japanese, Chinese). */
function Credit({ prefix, href }) {
  const sep = /[　-〿＀-￯]$/.test(prefix) ? '' : ' ';
  return <p>{prefix + sep}<a href={href}>Regime Map</a></p>;
}

/**
 * The world map, five products; readers switch between them.
 * product: online_casino (default) | sports_betting | poker | lottery | land_based (the one shown first)
 * lang: one of the 39 embed languages (en es no pt ja ko ru de fr it nl pl uk tr sv da fi cs sk hu
 *       ro el bg hr sr-Latn sl mk sq lt lv et is ca kk uz az ka hy zh-Hant)
 * region: world | europe | americas | africa | asia; theme: light | dark | auto
 * hubUrl: the configurator's credit link (regimemap.com's map, in the site's language where it has one)
 */
export function RegimeMap({ product = 'online_casino', lang = 'en', region = 'world', theme = 'light',
  fallback = 'Interactive map: gambling regulation by country.', credit = 'Map:',
  hubUrl = 'https://regimemap.com/gambling-regulation-map/' }) {
  useRegimeMapLoader([product, lang, region, theme]);
  const extra = product !== 'online_casino' ? { 'data-product': product } : {};
  return (
    <>
      <div key={`${product}-${lang}-${region}-${theme}`} data-regimemap="map" {...extra} data-lang={lang} data-region={region} data-theme={theme}>
        {fallback}
      </div>
      <Credit prefix={credit} href={hubUrl} />
    </>
  );
}

/** One country's status for all five products. country: ISO 3166-1 alpha-2, e.g. "FR". */
export function RegimeMapCountry({ country, dossierUrl, lang = 'en', theme = 'light',
  fallback = 'Gambling regulation by product.', credit = 'Source:' }) {
  useRegimeMapLoader([country, lang, theme]);
  return (
    <>
      <div key={`${country}-${lang}-${theme}`} data-regimemap="country" data-country={country} data-lang={lang} data-theme={theme}>
        {fallback}
      </div>
      <Credit prefix={credit} href={dossierUrl} />
    </>
  );
}

/* Usage:
 *   <RegimeMap product="sports_betting" region="europe" theme="auto" />
 *   <RegimeMap lang="de" fallback="Interaktive Karte: Glücksspielregulierung nach Ländern." credit="Karte:" />
 *   <RegimeMapCountry country="FR" fallback="France: gambling regulation by product."
 *     dossierUrl="https://regimemap.com/gambling-regulation-map/france/" />
 */
