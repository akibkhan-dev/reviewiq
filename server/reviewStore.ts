import { Review } from '../src/types';
import { INITIAL_DEMO_REVIEWS } from '../src/data/mockReviews';

let reviewsDatabase: Review[] = [...INITIAL_DEMO_REVIEWS];

export const reviewStore = {
  getAllReviews(): Review[] {
    return [...reviewsDatabase];
  },

  getReviewById(id: string): Review | undefined {
    return reviewsDatabase.find((r) => r.id === id);
  },

  addReview(review: Review): Review {
    // Add to the beginning of the list
    reviewsDatabase.unshift(review);
    return review;
  },

  addBulkReviews(newReviews: Review[]): Review[] {
    reviewsDatabase = [...newReviews, ...reviewsDatabase];
    return newReviews;
  },

  deleteReview(id: string): boolean {
    const initialLength = reviewsDatabase.length;
    reviewsDatabase = reviewsDatabase.filter((r) => r.id !== id);
    return reviewsDatabase.length < initialLength;
  },

  resetToDemo(): Review[] {
    reviewsDatabase = [...INITIAL_DEMO_REVIEWS];
    return reviewsDatabase;
  },

  clearAll(): void {
    reviewsDatabase = [];
  },

  getCount(): number {
    return reviewsDatabase.length;
  },
};
