/**
 * Public surface of the `admin-testimonials` feature.
 *
 * Client-safe — only exports the form component and types needed
 * across the admin client islands. Anything that touches Prisma is
 * server-only and lives in `./server.ts`.
 */
export { TestimonialForm } from './components/TestimonialForm'
export { TestimonialActions } from './components/TestimonialActions'
export type {
  CreateTestimonialInput,
  UpdateTestimonialInput,
  TestimonialAudience,
} from './schemas/testimonial'
