# Runbook — WhatsApp student-group outreach (MKT-14)

> Semi-manual growth channel : share fresh listings into student
> WhatsApp groups (universités + facs + regroupements géographiques).
> Every group targets ~50-500 members; three shares per week per group
> is our ceiling to avoid getting banned.

**Owner** : Growth lead · **Cadence** : Mon / Wed / Fri, 10:00 MG time

## Prep

1. Open `/annonces?publishedSince=7d&city=<slug>` for each city we
   have inventory in.
2. Screenshot the top 3 cards at 720p (fits WhatsApp preview nicely).
3. Copy the URL of each listing, run through `withUtm()` in your
   head : append `?utm_source=whatsapp&utm_medium=social&utm_campaign=weekly-drop`.

## Copy templates

### FR — general drop (Fianarantsoa)

```
🏠 3 nouvelles annonces à Fianarantsoa cette semaine

- Studio meublé à Andrainjato — 300 000 Ar/mois
  https://arytrano.com/…?utm_source=whatsapp&utm_medium=social&utm_campaign=weekly-drop

- Chambre à Anjoma près IPT — 180 000 Ar/mois
  https://arytrano.com/…?utm_source=whatsapp&utm_medium=social&utm_campaign=weekly-drop

- T2 meublé Ambalakilonga — 500 000 Ar/mois
  https://arytrano.com/…?utm_source=whatsapp&utm_medium=social&utm_campaign=weekly-drop

Tu cherches autre chose ? → https://arytrano.com/annonces?utm_source=whatsapp&utm_medium=social

Vérifiées gratuitement par notre équipe concierge.
```

### MG — general drop

```
🏠 Trano vaovao 3 ao Fianarantsoa herinandro ity :

- Efitrano meubles ao Andrainjato — 300 000 Ar / volana
  https://arytrano.com/…?utm_source=whatsapp&utm_medium=social&utm_campaign=weekly-drop

- Efitrano ao Anjoma akaikin'ny IPT — 180 000 Ar / volana
  https://arytrano.com/…?utm_source=whatsapp&utm_medium=social&utm_campaign=weekly-drop

- Trano T2 ao Ambalakilonga — 500 000 Ar / volana
  https://arytrano.com/…?utm_source=whatsapp&utm_medium=social&utm_campaign=weekly-drop

Mila zavatra hafa ? → https://arytrano.com/annonces?utm_source=whatsapp&utm_medium=social

Voamarina maimaimpoana avy amin'ny équipe concierge.
```

### FR — university-specific (e.g. IPNT)

```
🎓 Étudiants IPNT / IPT à Antananarivo : voici les 3 dernières
annonces à moins de 3 km de ton campus.

[Same 3-bullet format with `?nearUniversity=ipnt` in the /annonces link
so students can filter further.]
```

## Groups (rolling list)

| Group | Members | Locale | Frequency cap |
|-------|---------|--------|---------------|
| IPT Fianar — Promo 2027 | 380 | FR | 1x/week |
| Anjoma étudiants | 220 | FR/MG | 1x/week |
| Ankatso Ambohipo | 500+ | FR | 1x/week |
| INSCAE 3e année | 145 | FR | 1x/2 weeks |
| Fac de Droit Fianar | 180 | FR/MG | 1x/week |
| _(add as you gain trust)_ | | | |

## Rules of thumb

- **No cold links**. Always introduce with a 1-line context ("j’ai vu
  passer ça, ça peut aider").
- **No same-day resubmissions**. Groups delete bots that re-post.
- **Track admin pings**. Track group admin messages ("tu spammes")
  in your notes so we can adjust cadence.
- **Attribution first**. If you skip the UTM tag, we can’t measure
  the channel and it dies from lack of data.

## Reporting

Every Friday afternoon check `/admin/search-analytics` — a rise in
whatsapp UTM inbound aligns with the drop cadence. Also skim
`/admin/audit` for lead conversions with the `utm_source=whatsapp`
attribute if we've wired that further.
