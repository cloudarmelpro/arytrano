/**
 * Server-only surface of the `admin-testimonials` feature.
 *
 * Re-exports queries (DB reads) for admin RSC pages. The Server
 * Actions and Client form import directly from their own paths —
 * not via this barrel — to keep the client bundle clean.
 */
export {
  listAdminTestimonials,
  getAdminTestimonialById,
  type AdminTestimonialRow,
  type AdminTestimonialsPage,
  type StatusFilter,
} from './queries/list-admin-testimonials'
