/**
 * Public surface of the `static-pages` feature.
 *
 * Marketing pages that don't read from the DB: `/comment-ca-marche`
 * (audience-toggle client island + 4 RSC sections) and
 * `/proprietaires` (single composite RSC).
 */
export { CommentClient } from './comment/CommentClient'
export { CommentHero } from './comment/CommentHero'
export {
  CommentWhy,
  CommentVerif,
  CommentDont,
  CommentMoney,
} from './comment/CommentStatic'
export { ProprietairesPage } from './proprietaires/ProprietairesPage'
