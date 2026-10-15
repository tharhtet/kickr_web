export interface Region {
  /** Unique lowercase slug, e.g. `yangon`. */
  id: string;
  name: string;
}

/** Shape returned by the countries endpoints (unwrapped from `{ data }`). */
export interface Country {
  /** Unique lowercase slug, e.g. `myanmar`. */
  id: string;
  name: string;
  sortOrder: number;
  regions: Region[];
}

/** Body of `POST /countries`. */
export type CreateCountryInput = Country;

/** Body of `PATCH /countries/:id` — `regions` replaces the whole list. */
export type UpdateCountryInput = Country;
