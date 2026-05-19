# TODO — Watermark Cloudinary (T-036 unblock)

> **Statut** : code en place, UI cachée. Bloqué côté Cloudinary par
> Strict Transformations. À résoudre quand on prend le temps.

---

## Ce qui est déjà fait (à NE PAS refaire)

- ✅ Migration `20260518120000_add_listing_watermark` appliquée
  (`Listing.watermarkOptIn Boolean @default(false)`)
- ✅ Logo uploadé sur Cloudinary : `arytrano/watermark.png`
  (`https://res.cloudinary.com/dk4xefsqo/image/upload/v1779128426/arytrano/watermark.png`)
- ✅ Script `prisma/scripts/upload-watermark.ts` — relançable si on change
  le logo source dans `public/logo/arytrano-mark.svg`
- ✅ Helper `lib/cloudinary/watermark.ts` avec `applyCloudinaryWatermark` +
  `maybeWatermark` — utilise encore l'ancienne syntaxe text overlay
  (à remplacer par image overlay quand on dégèle)
- ✅ Câblage dans 4 queries publiques (`list-public-listings`,
  `get-public-listing`, `list-related-listings`, `list-user-favorites`)
- ✅ Schema Zod `watermarkOptIn` dans `createListingSchema` +
  `updateListingSchema` (via .partial())
- ✅ Services `createListing` + `updateListing` écrivent la colonne
- ✅ `getOwnerListing` la retourne pour le form d'édition
- ✅ i18n FR + MG (`listingForm.watermark.label/hint`)
- ✅ 5 tests unitaires `lib/cloudinary/watermark.test.ts`

## Ce qui est désactivé temporairement

- ❌ Toggle UI dans `ListingForm.tsx` (commenté avec lien vers ce doc)
- ❌ La transformation actuelle utilise l'ancienne syntaxe `l_text:` qui
  ne marche pas en production (Strict Transformations bloque). Voir §2.

---

## Le problème exact observé (2026-05-18)

Compte Cloudinary `dk4xefsqo` (free tier ?) avec restriction :
- ✅ Transformation simple `w_400` fonctionne
- ✅ Text overlay basique `l_text:Arial_30:AryTrano` fonctionne (centre)
- ❌ Text overlay + gravity `l_text:...,g_south_east` → texte ignoré
- ❌ Text overlay + multi-modifiers → **HTTP 404**
- ❌ Image overlay `l_arytrano:watermark,...` → **HTTP 404**
- ❌ Image overlay même avec `c_fit/` comme base → **HTTP 404**

C'est cohérent avec **Strict Transformations** activé : seuls certains
patterns sont allowlistés (ce qui inclut `w_<N>` mais pas les overlays
positionnés).

---

## Options pour débloquer

### Option A — Désactiver Strict Transformations (le plus simple)
1. Console Cloudinary : https://console.cloudinary.com/console/settings/security
2. Section "Strict transformations" → désactiver
3. Le helper actuel devrait marcher après remplacement de la transformation
   par image overlay (voir §B ci-dessous quand même pour la syntaxe).

**Risque** : tous les utilisateurs qui ont l'URL du cloud peuvent appliquer
n'importe quelle transformation, ce qui peut consommer du crédit Cloudinary
(transformations comptent dans le quota). Pour Madagascar pre-launch
c'est acceptable.

### Option B — Image overlay au lieu de text overlay
Remplacer le contenu de `lib/cloudinary/watermark.ts` :

```ts
const WATERMARK_TRANSFORM =
  'l_arytrano:watermark,w_80,o_40,g_south_east,x_20,y_20'
```

Tests à mettre à jour (`watermark.test.ts`) : remplacer toutes les
références à `l_text:Arial_30_bold:AryTrano` par `l_arytrano:watermark`.

L'asset est déjà sur Cloudinary à `arytrano/watermark`, le helper de
script (`prisma/scripts/upload-watermark.ts`) est ré-exécutable.

### Option C — URLs signées (bypass strict mode SDK-side)
Refactor du helper pour utiliser `cloudinary.url(publicId, opts, { sign_url: true })`
plutôt que l'injection de string. Avantage : marche même avec Strict
Transformations activé. Inconvénient : il faut extraire le `publicId` +
`version` depuis l'URL stockée en DB, et le SDK Cloudinary doit être
appelé à chaque rendu (server-side seulement).

Snippet de référence :
```ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({ /* ... */ })

const signed = cloudinary.url('arytrano/listings/X/Y', {
  sign_url: true,
  type: 'upload',
  version: '1778745032',
  format: 'jpg',
  transformation: [
    { overlay: 'arytrano:watermark', width: 80, opacity: 40, gravity: 'south_east', x: 20, y: 20 },
  ],
})
```

### Option D — Named Transformation Cloudinary
Console → Transformations → créer `arytrano_watermark` avec :
```
l_arytrano:watermark,w_80,o_40,g_south_east,x_20,y_20
```
Puis dans le helper, utiliser `t_arytrano_watermark` à la place des
modifiers inline. Marche en strict mode mais lié au compte Cloudinary
(pas portable dev↔prod sans dupliquer la config).

---

## Ré-activation côté code (une fois débloqué)

1. Décommenter le `<Controller name="watermarkOptIn" ...>` dans
   `src/features/listings/components/ListingForm.tsx` (~ligne 360, le
   bloc remplacé par un commentaire pointant vers ce doc)
2. Mettre à jour `lib/cloudinary/watermark.ts` selon l'option choisie
   ci-dessus (probablement A + B combinés)
3. Mettre à jour `watermark.test.ts` (la transformation string change)
4. Test manuel : éditer un listing en cochant le toggle, ouvrir
   `/{city}/{neighborhood}/{slug}` → watermark visible bas-droite
5. `npm test` doit passer 100%
6. Update TICKETS.md : T-036 → ✅ done

Estimation : ~30 min de code + 5 min de test si Strict Transformations
est désactivé proprement.
